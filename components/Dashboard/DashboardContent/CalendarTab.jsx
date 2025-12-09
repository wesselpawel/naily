"use client";
import { useState, useEffect, useRef, useMemo, memo } from "react";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import moment from "moment";
import "moment/locale/pl";
import { FaCalendar, FaClock, FaPlus, FaChevronLeft, FaChevronRight, FaUser, FaPhone, FaEnvelope, FaStickyNote, FaCheckCircle, FaCheck, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { MdBookOnline } from "react-icons/md";
import EventFormModal from "./EventFormModal";
import ReservationEditModal from "./ReservationEditModal";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Set Polish locale
moment.locale("pl");

// Fetch reservations for current specialist
async function fetchReservations(specialistUid) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL || ""}/api/reservations?specialistUid=${encodeURIComponent(specialistUid)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Fetch events for current user
async function fetchEvents(userId) {
  try {
    const res = await fetch(
      `/api/events?userId=${encodeURIComponent(userId)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

const getApiUrl = (path) => {
  const baseUrl = process.env.NEXT_PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${baseUrl}${path}`;
};

export default function CalendarTab({ user }) {
  const [currentDate, setCurrentDate] = useState(moment());
  const [reservations, setReservations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayPopup, setShowDayPopup] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [nextEventIndex, setNextEventIndex] = useState(0);
  const [declineConfirmId, setDeclineConfirmId] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    loadData();
  }, [user?.uid]);


  const loadData = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [resData, evtData] = await Promise.all([
        fetchReservations(user.uid),
        fetchEvents(user.uid),
      ]);
      setReservations(resData);
      setEvents(evtData);
    } catch (error) {
      console.error("Error loading calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    setCurrentDate(currentDate.clone().subtract(1, "month"));
  };

  const handleNext = () => {
    setCurrentDate(currentDate.clone().add(1, "month"));
  };

  const handleToday = () => {
    setCurrentDate(moment());
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setShowDayPopup(true);
  };

  // Get all upcoming events and reservations sorted by date/time
  const getUpcomingItems = () => {
    const now = moment();
    const allItems = [
      ...reservations
        .filter((r) => {
          // Filter out cancelled reservations
          if (r.status === "cancelled") return false;
          const reservationDate = r.date || r.preferredDate;
          if (!reservationDate) return false;
          const itemTime = r.time || r.preferredTime || "00:00";
          const itemDateTime = moment(`${reservationDate} ${itemTime}`, "YYYY-MM-DD HH:mm");
          return itemDateTime.isAfter(now);
        })
        .map((r) => ({
          ...r,
          date: r.date || r.preferredDate,
          time: r.time || r.preferredTime,
          notes: r.notes || null,
          specialistNotes: r.specialistNotes || null,
          type: "reservation",
          datetime: moment(`${r.date || r.preferredDate} ${r.time || r.preferredTime || "00:00"}`, "YYYY-MM-DD HH:mm"),
        })),
      ...events
        .filter((e) => {
          if (!e.date) return false;
          const itemTime = e.time || "00:00";
          const itemDateTime = moment(`${e.date} ${itemTime}`, "YYYY-MM-DD HH:mm");
          return itemDateTime.isAfter(now);
        })
        .map((e) => ({
          ...e,
          type: "event",
          datetime: moment(`${e.date} ${e.time || "00:00"}`, "YYYY-MM-DD HH:mm"),
        })),
    ].sort((a, b) => {
      if (a.datetime.isBefore(b.datetime)) return -1;
      if (a.datetime.isAfter(b.datetime)) return 1;
      return 0;
    });
    return allItems;
  };

  const upcomingItems = getUpcomingItems();
  const currentNextEvent = upcomingItems[nextEventIndex] || null;

  const handleNextEvent = () => {
    if (nextEventIndex < upcomingItems.length - 1) {
      setNextEventIndex(nextEventIndex + 1);
    }
  };

  const handlePrevEvent = () => {
    if (nextEventIndex > 0) {
      setNextEventIndex(nextEventIndex - 1);
    }
  };

  const handleAddEvent = (date = null) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setShowEventModal(true);
  };

  const handleEventSaved = (savedEvent) => {
    if (savedEvent) {
      // Optimistic update: update local state without full reload
      if (savedEvent.id && events.find(e => e.id === savedEvent.id)) {
        // Update existing event
        setEvents(prevEvents => 
          prevEvents.map(e => e.id === savedEvent.id ? savedEvent : e)
        );
      } else {
        // Add new event
        setEvents(prevEvents => [...prevEvents, savedEvent]);
      }
    } else {
      // Fallback: reload if no event data provided
      loadData();
    }
    setShowEventModal(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  const handleEditReservation = (reservation) => {
    setSelectedReservation(reservation);
    setShowReservationModal(true);
  };

  const handleReservationSaved = (savedReservation) => {
    if (savedReservation) {
      // Optimistic update: update local state
      setReservations(prevReservations =>
        prevReservations.map(r => r.id === savedReservation.id ? savedReservation : r)
      );
    } else {
      // Fallback: reload
      loadData();
    }
    setShowReservationModal(false);
    setSelectedReservation(null);
  };

  const handleContactCustomer = (phone) => {
    if (!phone) return;
    // Create tel: link for phone calls
    const telLink = `tel:${phone.replace(/\s/g, "")}`;
    window.location.href = telLink;
  };

  const handleApproveReservation = async (reservation) => {
    try {
      if (reservation.id) {
        // Optimistic update: update local state immediately
        setReservations((prev) =>
          prev.map((r) =>
            r.id === reservation.id ? { ...r, status: "confirmed" } : r
          )
        );
        
        const res = await fetch(getApiUrl(`/api/reservations/${encodeURIComponent(reservation.id)}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "confirmed" }),
        });
        
        if (res.ok) {
          toast.success("Rezerwacja zatwierdzona");
        } else {
          // Revert on error
          setReservations((prev) =>
            prev.map((r) =>
              r.id === reservation.id ? { ...r, status: reservation.status || "pending" } : r
            )
          );
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update reservation");
        }
      }
    } catch (error) {
      console.error("Error approving reservation:", error);
      toast.error(error.message || "Nie udało się zatwierdzić rezerwacji");
    }
  };

  const handleDeclineReservation = async (reservation) => {
    try {
      if (reservation.id) {
        // Optimistic update: update local state immediately
        setReservations((prev) =>
          prev.map((r) =>
            r.id === reservation.id ? { ...r, status: "cancelled" } : r
          )
        );
        
        const res = await fetch(getApiUrl(`/api/reservations/${encodeURIComponent(reservation.id)}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelled" }),
        });
        
        if (res.ok) {
          toast.success("Rezerwacja odrzucona");
          setDeclineConfirmId(null);
        } else {
          // Revert on error
          setReservations((prev) =>
            prev.map((r) =>
              r.id === reservation.id ? { ...r, status: reservation.status || "pending" } : r
            )
          );
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update reservation");
        }
      }
    } catch (error) {
      console.error("Error declining reservation:", error);
      toast.error(error.message || "Nie udało się odrzucić rezerwacji");
      setDeclineConfirmId(null);
    }
  };

  const handleCallReservation = (reservation) => {
    const phoneNumber = reservation.customerPhone;
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber.replace(/\s/g, "")}`;
      toast.info("Inicjowanie połączenia...");
    } else {
      toast.warning("Brak numeru telefonu");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    // Optimistic update: remove from local state immediately
    const eventToDelete = events.find(e => e.id === eventId);
    setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/events/${eventId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Wydarzenie zostało usunięte");
      } else {
        // Revert on error
        if (eventToDelete) {
          setEvents(prevEvents => [...prevEvents, eventToDelete]);
        }
        toast.error("Nie udało się usunąć wydarzenia");
      }
    } catch (error) {
      // Revert on error
      if (eventToDelete) {
        setEvents(prevEvents => [...prevEvents, eventToDelete]);
      }
      toast.error("Błąd podczas usuwania wydarzenia");
    }
  };

  // Get items for a specific date
  const getItemsForDate = (date) => {
    const dateStr = date.format("YYYY-MM-DD");
    const dayReservations = reservations.filter((r) => {
      // Filter out cancelled reservations
      if (r.status === "cancelled") return false;
      // Check for date or preferredDate field
      const reservationDate = r.date || r.preferredDate;
      if (!reservationDate) return false;
      return moment(reservationDate).format("YYYY-MM-DD") === dateStr;
    }).map((r) => ({
      ...r,
      date: r.date || r.preferredDate,
      time: r.time || r.preferredTime,
    }));
    const dayEvents = events.filter((e) => e.date === dateStr);
    return { reservations: dayReservations, events: dayEvents };
  };

  // Render Month View
  const renderMonthView = () => {
    const startOfMonth = currentDate.clone().startOf("month");
    const endOfMonth = currentDate.clone().endOf("month");
    const startDate = startOfMonth.clone().startOf("week");
    const endDate = endOfMonth.clone().endOf("week");
    const days = [];
    let day = startDate.clone();

    while (day.isSameOrBefore(endDate, "day")) {
      days.push(day.clone());
      day.add(1, "day");
    }

    const weekDays = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

    return (
      <div className="bg-white w-full border border-gray-200">
        {/* Weekday Headers */}
        <div className="flex flex-wrap w-full">
          {weekDays.map((dayName, dayIdx) => {
            const isLastCol = dayIdx === 6;
            return (
              <div
                key={dayName}
                className={`bg-blue-50 p-1.5 sm:p-2 md:p-3 text-center font-semibold text-xs sm:text-sm md:text-base text-gray-700 border-b border-r border-gray-200 whitespace-nowrap ${
                  isLastCol ? "border-r-0" : ""
                }`}
                style={{ width: 'calc(100% / 7)', boxSizing: 'border-box' }}
              >
                {dayName}
              </div>
            );
          })}
        </div>
        {/* Calendar Days */}
        <div className="flex flex-wrap w-full">
          {days.map((day, idx) => {
            const isCurrentMonth = day.month() === currentDate.month();
            const isToday = day.isSame(moment(), "day");
            const { reservations: dayReservations, events: dayEvents } =
              getItemsForDate(day);
            const totalItems = dayReservations.length + dayEvents.length;
            const isLastCol = (idx + 1) % 7 === 0;
            const isLastRow = idx >= days.length - 7;

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(day)}
                className={`group bg-white min-h-[100px] sm:min-h-[120px] md:min-h-[140px] p-1.5 sm:p-2 md:p-2.5 border-b border-r border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer touch-manipulation flex flex-col ${
                  !isCurrentMonth ? "bg-gray-50" : ""
                } ${isToday ? "ring-2 ring-blue-500 ring-inset" : ""} ${
                  isLastCol ? "border-r-0" : ""
                } ${isLastRow ? "border-b-0" : ""}`}
                style={{ width: 'calc(100% / 7)', boxSizing: 'border-box' }}
              >
              <div className="flex items-center justify-between mb-1.5 sm:mb-2 flex-shrink-0 w-full">
                <span
                  className={`text-xs sm:text-sm md:text-base font-medium whitespace-nowrap ${
                    isCurrentMonth ? "text-gray-900" : "text-gray-400"
                  } ${isToday ? "bg-blue-500 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center text-xs sm:text-sm md:text-base font-semibold" : ""}`}
                >
                  {day.format("D")}
                </span>
              </div>
              {/* Mobile: Show limited events with details and overflow indicator */}
              <div className="md:hidden space-y-1 sm:space-y-1.5 flex-1 min-h-0 max-h-[60px] sm:max-h-[70px] relative w-full">
                {dayReservations.slice(0, 2).map((res) => (
                  <div
                    key={res.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayClick(day);
                    }}
                    className="text-[10px] sm:text-xs bg-purple-100 text-purple-800 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded cursor-pointer hover:bg-purple-200 active:bg-purple-300 touch-manipulation font-medium truncate whitespace-nowrap  flex items-center gap-1"
                    title={`Rezerwacja: ${res.serviceName || "Usługa"}${res.status === "confirmed" ? " (Zatwierdzona)" : ""}`}
                  >
                    <MdBookOnline className="inline w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                    {res.status === "confirmed" && (
                      <FaCheckCircle className="inline w-2 h-2 sm:w-2.5 sm:h-2.5 text-green-600 flex-shrink-0" title="Zatwierdzona" />
                    )}
                    <span className="text-[11px] whitespace-nowrap">{res.time && `${res.time} `}</span>
                    
                  </div>
                ))}
                {dayEvents.slice(0, 2).map((evt) => (
                  <div
                    key={evt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayClick(day);
                    }}
                    className="bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 active:bg-blue-300 touch-manipulation font-medium whitespace-nowrap "
                    title={evt.title}
                  >
                    <span className="flex items-center justify-center text-center text-[11px] whitespace-nowrap">{evt.time && `${evt.time} `}</span>
                    
                  </div>
                ))}
                {totalItems > 4 && (
                  <div className="text-[10px] sm:text-xs text-gray-500 px-1.5 sm:px-2 py-0.5 sm:py-1 font-medium relative z-10 whitespace-nowrap">
                    +{totalItems - 4} więcej
                  </div>
                )}
              </div>
              {/* Desktop: Show events with full details and buttons */}
              <div className="hidden md:block space-y-0.5 max-h-[60px] overflow-y-auto">
                {dayReservations.slice(0, 2).map((res) => (
                  <div
                    key={res.id}
                    className="text-xs bg-purple-100 text-purple-800 px-1 py-0.5 rounded truncate cursor-pointer hover:bg-purple-200 whitespace-nowrap  flex items-center gap-0.5"
                    title={`Rezerwacja: ${res.serviceName || "Usługa"}${res.status === "confirmed" ? " (Zatwierdzona)" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayClick(day);
                    }}
                  >
                    <MdBookOnline className="inline w-2.5 h-2.5 flex-shrink-0" />
                    {res.status === "confirmed" && (
                      <FaCheckCircle className="inline w-2 h-2 text-green-600 flex-shrink-0" title="Zatwierdzona" />
                    )}
                    <span className="whitespace-nowrap">{res.time && `${res.time} `}</span>
                    <span className="truncate whitespace-nowrap">{res.serviceName || "Rezerwacja"}</span>
                  </div>
                ))}
                {dayEvents.slice(0, 2).map((evt) => (
                  <div
                    key={evt.id}
                    className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate cursor-pointer hover:bg-blue-200 whitespace-nowrap "
                    title={evt.title}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayClick(day);
                    }}
                  >
                    <span className="whitespace-nowrap">{evt.time && `${evt.time} `}</span>
                    <span className="truncate whitespace-nowrap">{evt.title}</span>
                  </div>
                ))}
                {totalItems > 4 && (
                  <div className="text-xs text-gray-500 px-1 whitespace-nowrap">
                    +{totalItems - 4} więcej
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    );
  };

  // Day Popup Component
  const DayPopup = ({ day, onClose, reservations, events, onAddEvent, onEditEvent, onDeleteEvent, onEditReservation, onContactCustomer, onReload, onApproveReservation, onDeclineReservation, onCallReservation, declineConfirmId, setDeclineConfirmId }) => {
    const [mounted, setMounted] = useState(false);
    const [pendingDeleteEventId, setPendingDeleteEventId] = useState(null);
    const hasAnimatedRef = useRef(false);
    const dayKeyRef = useRef(day.format("YYYY-MM-DD"));

    useEffect(() => {
      setMounted(true);
      const currentDayKey = day.format("YYYY-MM-DD");
      
      // Only reset animation if day changed (new popup opened)
      if (dayKeyRef.current !== currentDayKey) {
        hasAnimatedRef.current = false;
        dayKeyRef.current = currentDayKey;
      }
      
      // Mark animation as played after mount to prevent replay on re-renders
      const timer = setTimeout(() => {
        hasAnimatedRef.current = true;
      }, 300);
      
      return () => {
        clearTimeout(timer);
        setMounted(false);
        setPendingDeleteEventId(null);
        // Don't reset hasAnimatedRef here - let it persist across re-renders
      };
    }, [day]);

    const handleClose = () => {
      setPendingDeleteEventId(null);
      onClose();
    };
    
    const dayStr = day.format("YYYY-MM-DD");
    const dayMoment = moment(day);
    const dayStrFormatted = dayMoment.format("YYYY-MM-DD");
    
    // Memoize filtered reservations to prevent unnecessary re-renders
    const dayReservations = useMemo(() => {
      return reservations.filter((r) => {
        // Filter out cancelled reservations
        if (r.status === "cancelled") return false;
        const reservationDate = r.date || r.preferredDate;
        if (!reservationDate) return false;
        return moment(reservationDate).format("YYYY-MM-DD") === dayStrFormatted;
      }).map((r) => ({
        ...r,
        date: r.date || r.preferredDate,
        time: r.time || r.preferredTime,
        notes: r.notes || null,
        specialistNotes: r.specialistNotes || null,
      }));
    }, [reservations, dayStrFormatted]);
    
    const dayEvents = useMemo(() => {
      return events.filter((e) => e.date === dayStrFormatted);
    }, [events, dayStrFormatted]);
    
    const allItems = useMemo(() => {
      return [
        ...dayReservations.map((r) => ({ ...r, type: "reservation" })),
        ...dayEvents.map((e) => ({ ...e, type: "event" })),
      ].sort((a, b) => {
        const timeA = a.time || "00:00";
        const timeB = b.time || "00:00";
        return timeA.localeCompare(timeB);
      });
    }, [dayReservations, dayEvents]);

    const popupContent = (
      <div className={`fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-white ${!hasAnimatedRef.current ? 'animate-fade-in' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-6 border-b-2 border-gray-200 bg-white shadow-md">
          <button
            onClick={handleClose}
            className="text-gray-700 hover:text-blue-600 font-semibold text-sm md:text-lg px-2 md:px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center gap-1.5 md:gap-2 group"
          >
            <FaChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Zamknij okno</span>
            <span className="sm:hidden">Zamknij</span>
          </button>
          <div className="text-base md:text-xl font-bold text-gray-900 capitalize text-center flex-1">
            {day.format("D MMMM YYYY")}
          </div>
          <button
            onClick={() => onAddEvent(dayStr)}
            className="px-3 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold flex items-center gap-1.5 md:gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm md:text-base"
          >
            <FaPlus className="text-base md:text-lg" />
            <span className="hidden sm:inline">Dodaj</span>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-65px)] md:h-[calc(100vh-73px)] p-3 md:p-6 bg-white min-h-[calc(100vh-65px)] md:min-h-[calc(100vh-73px)]">
          {allItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-fade-in-up px-4">
              <div className="p-4 md:p-6 rounded-full bg-gray-100 mb-4">
                <FaCalendar className="w-12 h-12 md:w-20 md:h-20 text-gray-300" />
              </div>
              <p className="text-lg md:text-2xl font-bold text-gray-600 text-center">Brak wydarzeń</p>
              <p className="text-xs md:text-base mt-2 text-gray-500 text-center">Kliknij "Dodaj", aby dodać wydarzenie</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-4 max-w-2xl mx-auto">
              {allItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`rounded-lg md:rounded-xl p-3 md:p-5 shadow-sm md:shadow-md border border-gray-200 md:border-2 transition-all duration-200 hover:shadow-md md:hover:shadow-lg animate-fade-in-up ${
                    item.type === "reservation"
                      ? "bg-purple-50 md:bg-gradient-to-br md:from-purple-50 md:to-purple-100/50 border-purple-200 md:border-purple-300"
                      : "bg-blue-50 md:bg-gradient-to-br md:from-blue-50 md:to-blue-100/50 border-blue-200 md:border-blue-300"
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Mobile: Compact Layout */}
                  <div className="md:hidden">
                    <div className="flex items-start gap-3 relative">
                      {/* Left: Enhanced Icon */}
                      <div className={`relative flex-shrink-0 ${
                        item.type === "reservation"
                          ? "bg-gradient-to-br from-purple-500 to-purple-600"
                          : "bg-gradient-to-br from-blue-500 to-blue-600"
                      } p-2.5 rounded-xl shadow-md`}>
                        {item.type === "reservation" ? (
                          <MdBookOnline className="w-4 h-4 text-white" />
                        ) : (
                          <FaCalendar className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      {/* Center: Content */}
                      <div className="flex-1 min-w-0">
                        {/* Time - Secondary Info */}
                        {item.time && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <FaClock className={`w-3 h-3 flex-shrink-0 ${
                              item.type === "reservation"
                                ? "text-purple-600"
                                : "text-blue-600"
                            }`} />
                            <span className={`text-xs font-semibold ${
                              item.type === "reservation"
                                ? "text-purple-700"
                                : "text-blue-700"
                            }`}>
                              {item.time}
                            </span>
                          </div>
                        )}
                        {/* Title - Primary Info */}
                        <div
                          className={`text-sm font-extrabold mb-2.5 leading-tight flex items-center gap-2 ${
                            item.type === "reservation"
                              ? "text-purple-900"
                              : "text-blue-900"
                          }`}
                        >
                          {item.type === "reservation"
                            ? item.serviceName || "Rezerwacja"
                            : item.title}
                          {item.type === "reservation" && item.status === "confirmed" && (
                            <span className="flex items-center gap-1 text-green-600" title="Zatwierdzona">
                              <FaCheckCircle className="w-3 h-3" />
                              <span className="text-xs font-semibold">Zatwierdzona</span>
                            </span>
                          )}
                        </div>
                        
                        {/* Mobile: Action Buttons - Confirmed */}
                        {item.type === "reservation" && item.status === "confirmed" && (
                          <div className="mt-3">
                            <button
                              onClick={() => onCallReservation(item)}
                              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5"
                            >
                              <FaPhone className="w-4 h-4" />
                              <span>Zadzwoń</span>
                            </button>
                          </div>
                        )}
                        
                        {/* Notes Section */}
                        {(item.type === "reservation" && (item.notes || item.specialistNotes)) && (
                          <div className="space-y-2 mt-3">
                            {/* Client Notes - Wiadomość */}
                            {item.notes && (
                              <div className="p-2.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <div className="p-1 bg-blue-100 rounded-md">
                                    <FaEnvelope className="w-2.5 h-2.5 text-blue-600" />
                                  </div>
                                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">
                                    Wiadomość
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                                  {item.notes}
                                </p>
                              </div>
                            )}
                            {/* Specialist Notes - Notatka */}
                            {item.specialistNotes && (
                              <div className="p-2.5 bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200/60 shadow-sm">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <div className="p-1 bg-purple-100 rounded-md">
                                    <FaStickyNote className="w-2.5 h-2.5 text-purple-600" />
                                  </div>
                                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">
                                    Notatka
                                  </span>
                                </div>
                                <p className="text-xs text-purple-900 leading-relaxed line-clamp-2 font-medium">
                                  {item.specialistNotes}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Description (for events) */}
                        {item.type === "event" && item.description && (
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mt-2">
                            {item.description}
                          </p>
                        )}
                        
                        {/* Mobile: Decline Confirmation */}
                        {item.type === "reservation" && declineConfirmId === item.id && (
                          <div className="mt-3 p-3 bg-red-50 border-2 border-red-300 rounded-lg animate-fade-in shadow-sm">
                            <p className="text-sm font-semibold text-red-900 mb-3">
                              Czy na pewno chcesz odrzucić tę rezerwację?
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => onDeclineReservation(item)}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 active:scale-95 shadow-md"
                              >
                                Odrzuć
                              </button>
                              <button
                                onClick={() => setDeclineConfirmId(null)}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all duration-200 active:scale-95"
                              >
                                Anuluj
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Mobile: Action Buttons - Pending */}
                        {item.type === "reservation" && item.status !== "confirmed" && item.status !== "cancelled" && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              onClick={() => onApproveReservation(item)}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                            >
                              <FaCheck className="text-sm" />
                              Zatwierdź
                            </button>
                            <button
                              onClick={() => onCallReservation(item)}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                            >
                              <FaPhone className="text-sm" />
                              Zadzwoń
                            </button>
                            <button
                              onClick={() => setDeclineConfirmId(item.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                            >
                              <FaTimes className="text-sm" />
                              Odrzuć
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Right: Edit Button */}
                      {item.type === "reservation" && (
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              onEditReservation(item);
                              onClose();
                            }}
                            className="flex items-center justify-center min-w-[36px] min-h-[36px] p-2 bg-purple-50 hover:bg-purple-100 active:bg-purple-200 text-purple-700 rounded-lg transition-all duration-200 active:scale-95 shadow-sm"
                            title="Edytuj rezerwację"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                      {item.type === "event" && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setPendingDeleteEventId(null);
                              onEditEvent(item);
                              onClose();
                            }}
                            className="flex items-center justify-center min-w-[32px] min-h-[32px] p-2 text-blue-600 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-all duration-200 active:scale-95"
                            title="Edytuj"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setPendingDeleteEventId(item.id);
                            }}
                            className="flex items-center justify-center min-w-[32px] min-h-[32px] p-2 text-red-600 hover:bg-red-100 active:bg-red-200 rounded-lg transition-all duration-200 active:scale-95"
                            title="Usuń"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile: Delete Confirmation */}
                  {item.type === "event" && pendingDeleteEventId === item.id && (
                    <div className="md:hidden mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-lg animate-fade-in">
                      <p className="text-sm font-semibold text-red-900 mb-3">
                        Czy na pewno chcesz usunąć to wydarzenie?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            await onDeleteEvent(item.id);
                            setPendingDeleteEventId(null);
                          }}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 active:scale-95"
                        >
                          Usuń
                        </button>
                        <button
                          onClick={() => setPendingDeleteEventId(null)}
                          className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all duration-200 active:scale-95"
                        >
                          Anuluj
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Desktop: Full Layout */}
                  <div className="hidden md:block">
                    <div className="flex items-start justify-between gap-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4 mb-4">
                          {/* Enhanced Icon */}
                          <div className={`relative flex-shrink-0 ${
                            item.type === "reservation"
                              ? "bg-gradient-to-br from-purple-500 to-purple-600"
                              : "bg-gradient-to-br from-blue-500 to-blue-600"
                          } p-3 rounded-xl shadow-lg`}>
                            {item.type === "reservation" ? (
                              <MdBookOnline className="w-6 h-6 text-white" />
                            ) : (
                              <FaCalendar className="w-6 h-6 text-white" />
                            )}
                          </div>
                          
                          {/* Content Section */}
                          <div className="flex-1 min-w-0">
                            {/* Time - Secondary Info */}
                            {item.time && (
                              <div className="flex items-center gap-2 mb-2">
                                <FaClock className={`w-4 h-4 flex-shrink-0 ${
                                  item.type === "reservation"
                                    ? "text-purple-600"
                                    : "text-blue-600"
                                }`} />
                                <span className={`text-sm font-semibold ${
                                  item.type === "reservation"
                                    ? "text-purple-700"
                                    : "text-blue-700"
                                }`}>
                                  {item.time}
                                </span>
                              </div>
                            )}
                            
                            {/* Title - Primary Info */}
                            <h3
                              className={`text-xl font-extrabold mb-3 leading-tight flex items-center gap-3 ${
                                item.type === "reservation"
                                  ? "text-purple-900"
                                  : "text-blue-900"
                              }`}
                            >
                              {item.type === "reservation"
                                ? item.serviceName || "Rezerwacja"
                                : item.title}
                              {item.type === "reservation" && item.status === "confirmed" && (
                                <span className="flex items-center gap-2 text-green-600" title="Zatwierdzona">
                                  <FaCheckCircle className="w-5 h-5" />
                                  <span className="text-sm font-semibold">Zatwierdzona</span>
                                </span>
                              )}
                            </h3>
                            
                            {/* Desktop: Action Buttons - Confirmed */}
                            {item.type === "reservation" && item.status === "confirmed" && (
                              <div className="mt-3">
                                <button
                                  onClick={() => onCallReservation(item)}
                                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5"
                                >
                                  <FaPhone className="w-4 h-4" />
                                  <span>Zadzwoń</span>
                                </button>
                              </div>
                            )}
                            
                            {/* Notes Section */}
                            {(item.type === "reservation" && (item.notes || item.specialistNotes)) && (
                              <div className="space-y-3 mt-4">
                                {/* Client Notes - Wiadomość */}
                                {item.notes && (
                                  <div className="p-3.5 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200/80 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="p-1.5 bg-blue-100 rounded-lg">
                                        <FaEnvelope className="w-3 h-3 text-blue-600" />
                                      </div>
                                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                                        Wiadomość
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {item.notes}
                                    </p>
                                  </div>
                                )}
                                {/* Specialist Notes - Notatka */}
                                {item.specialistNotes && (
                                  <div className="p-3.5 bg-white/90 backdrop-blur-sm rounded-lg border border-purple-200/80 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="p-1.5 bg-purple-100 rounded-lg">
                                        <FaStickyNote className="w-3 h-3 text-purple-600" />
                                      </div>
                                      <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                                        Notatka
                                      </span>
                                    </div>
                                    <p className="text-sm text-purple-900 leading-relaxed font-medium">
                                      {item.specialistNotes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Description (for events) */}
                            {item.type === "event" && item.description && (
                              <p className="text-gray-700 text-base mt-3 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Desktop: Decline Confirmation */}
                        {item.type === "reservation" && declineConfirmId === item.id && (
                          <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg animate-fade-in shadow-sm">
                            <p className="text-base font-semibold text-red-900 mb-3">
                              Czy na pewno chcesz odrzucić tę rezerwację?
                            </p>
                            <div className="flex gap-3">
                              <button
                                onClick={() => onDeclineReservation(item)}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-md"
                              >
                                Odrzuć
                              </button>
                              <button
                                onClick={() => setDeclineConfirmId(null)}
                                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all duration-200 hover:shadow-md"
                              >
                                Anuluj
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Desktop: Action Buttons - Pending */}
                        {item.type === "reservation" && item.status !== "confirmed" && item.status !== "cancelled" && (
                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              onClick={() => onApproveReservation(item)}
                              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                            >
                              <FaCheck className="text-base" />
                              Zatwierdź
                            </button>
                            <button
                              onClick={() => onCallReservation(item)}
                              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                            >
                              <FaPhone className="text-base" />
                              Zadzwoń
                            </button>
                            <button
                              onClick={() => setDeclineConfirmId(item.id)}
                              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                            >
                              <FaTimes className="text-base" />
                              Odrzuć
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      {item.type === "reservation" && (
                        <div className="flex flex-col gap-2.5 flex-shrink-0">
                          <button
                            onClick={() => {
                              onEditReservation(item);
                              onClose();
                            }}
                            className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                            title="Edytuj rezerwację"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                      {item.type === "event" && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setPendingDeleteEventId(null);
                              onEditEvent(item);
                              onClose();
                            }}
                            className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                            title="Edytuj"
                          >
                            <svg
                              className="w-5 h-5 md:w-6 md:h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setPendingDeleteEventId(item.id);
                            }}
                            className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                            title="Usuń"
                          >
                            <svg
                              className="w-5 h-5 md:w-6 md:h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desktop: Delete Confirmation */}
                  {item.type === "event" && pendingDeleteEventId === item.id && (
                    <div className="hidden md:block mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg animate-fade-in">
                      <p className="text-base font-semibold text-red-900 mb-3">
                        Czy na pewno chcesz usunąć to wydarzenie?
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={async () => {
                            await onDeleteEvent(item.id);
                            setPendingDeleteEventId(null);
                          }}
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-md"
                        >
                          Usuń
                        </button>
                        <button
                          onClick={() => setPendingDeleteEventId(null)}
                          className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all duration-200 hover:shadow-md"
                        >
                          Anuluj
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );

    if (!mounted) return null;
    
    return createPortal(popupContent, document.body);
  };

  // Memoize DayPopup - always allow re-renders, but stable key prevents remounting
  const MemoizedDayPopup = memo(DayPopup);

  // Removed week and day views - only month view is used now

  if (loading) {
    return (
      <Card className="shadow-lg rounded-2xl border-2 border-blue-100 my-6 ">
          {/* Desktop Header Skeleton */}
          <CardHeader className="hidden md:block pt-8 pb-6 px-8 bg-gradient-to-br from-blue-50 via-white to-blue-50/50">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-200 via-gray-200 to-gray-300 animate-pulse"></div>
                </div>
                <div className="flex-1 pt-1 space-y-2">
                  <div className="h-8 w-48 rounded-lg animate-shimmer"></div>
                  <div className="h-5 w-80 rounded-lg animate-shimmer"></div>
                </div>
              </div>
              <div className="h-12 w-48 rounded-xl animate-shimmer"></div>
            </div>
          </CardHeader>

          {/* Mobile Header Skeleton */}
          <CardHeader className="md:hidden pt-6 pb-4 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50/50">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-xl blur-lg opacity-20"></div>
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-gray-200 via-gray-200 to-gray-300 animate-pulse"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-7 w-32 rounded-lg animate-shimmer"></div>
                  <div className="h-4 w-48 rounded-lg animate-shimmer"></div>
                </div>
              </div>
              <div className="h-12 w-full rounded-xl animate-shimmer"></div>
            </div>
          </CardHeader>

          <CardContent className="pt-2 pb-8 px-4 md:px-8">
            {/* Next Event Skeleton */}
            <div className="mb-6 px-4 sm:px-6 md:px-0">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 md:h-7 w-48 rounded-lg animate-shimmer"></div>
                <div className="h-8 w-24 rounded-lg animate-shimmer"></div>
              </div>
              <div className="rounded-xl p-4 md:p-5 border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-gray-200 via-gray-200 to-gray-300 animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-56 rounded animate-shimmer"></div>
                    <div className="h-6 md:h-7 w-3/4 rounded-lg animate-shimmer"></div>
                    <div className="h-4 w-full rounded animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Skeleton */}
            <div className="bg-white border-t border-gray-200">
              {/* Month Navigation Skeleton */}
              <div className="px-2 sm:px-3 md:px-4 py-2.5 sm:py-3 md:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg animate-shimmer"></div>
                  <div className="h-8 w-16 rounded-lg animate-shimmer"></div>
                  <div className="h-8 w-8 rounded-lg animate-shimmer"></div>
                  <div className="h-6 w-32 ml-4 rounded-lg animate-shimmer"></div>
                </div>
              </div>

              {/* Calendar Grid Skeleton */}
              <div className="bg-white w-full border border-gray-200">
                {/* Weekday Headers Skeleton */}
                <div className="flex flex-wrap w-full">
                  {[...Array(7)].map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-blue-50 p-1.5 sm:p-2 md:p-3 border-b border-r border-gray-200"
                      style={{ width: 'calc(100% / 7)', boxSizing: 'border-box' }}
                    >
                      <div className="h-4 w-8 rounded mx-auto animate-shimmer"></div>
                    </div>
                  ))}
                </div>

                {/* Calendar Days Skeleton */}
                <div className="flex flex-wrap w-full">
                  {[...Array(35)].map((_, idx) => {
                    const isLastCol = (idx + 1) % 7 === 0;
                    const isLastRow = idx >= 28;
                    return (
                      <div
                        key={idx}
                        className={`min-h-[100px] sm:min-h-[120px] md:min-h-[140px] p-1.5 sm:p-2 md:p-2.5 border-b border-r border-gray-200 ${
                          isLastCol ? "border-r-0" : ""
                        } ${isLastRow ? "border-b-0" : ""}`}
                        style={{ width: 'calc(100% / 7)', boxSizing: 'border-box' }}
                      >
                        <div className="space-y-2">
                          <div className="h-5 w-5 rounded-full animate-shimmer"></div>
                          <div className="space-y-1">
                            <div className="h-4 w-full rounded animate-shimmer" style={{ animationDelay: `${idx * 20}ms` }}></div>
                            <div className="h-4 w-3/4 rounded animate-shimmer" style={{ animationDelay: `${idx * 20 + 50}ms` }}></div>
                            {idx % 3 === 0 && (
                              <div className="h-4 w-2/3 rounded animate-shimmer" style={{ animationDelay: `${idx * 20 + 100}ms` }}></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden shadow-lg rounded-2xl border-2 border-blue-100 my-6 ">
        {/* Desktop Header */}
        <CardHeader className="hidden md:block pt-8 pb-6 px-8 bg-gradient-to-br from-blue-50 via-white to-blue-50/50">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transform hover:scale-105 transition-transform">
                  <FaCalendar className="text-white text-2xl" />
                </div>
              </div>
              <div className="flex-1 pt-1">
                <CardTitle className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                  Kalendarz
                </CardTitle>
                <CardDescription className="text-base text-gray-600 leading-relaxed">
                  Zarządzaj rezerwacjami i wydarzeniami
                </CardDescription>
              </div>
            </div>
            <button
              onClick={() => handleAddEvent()}
              className="group relative px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-bold text-base "
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative flex items-center gap-2">
                <FaPlus className="text-xl group-hover:rotate-90 transition-transform duration-300" />
                <span>Dodaj wydarzenie</span>
              </div>
            </button>
          </div>
        </CardHeader>

        {/* Mobile Header */}
        <CardHeader className="md:hidden pt-6 pb-4 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50/50">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-xl blur-lg opacity-20"></div>
                <div className="relative p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                  <FaCalendar className="text-white text-xl" />
                </div>
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Kalendarz
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-1">
                  Zarządzaj rezerwacjami i wydarzeniami
                </CardDescription>
              </div>
            </div>
            <button
              onClick={() => handleAddEvent()}
              className="w-full group relative px-5 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-bold text-base "
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative flex items-center justify-center gap-2">
                <FaPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                <span>Dodaj wydarzenie</span>
              </div>
            </button>
          </div>
        </CardHeader>

        <CardContent className="">
          {/* Najbliższe wydarzenie */}
          {currentNextEvent && (
            <div className="mb-6 px-4 sm:px-6 md:px-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 whitespace-nowrap">Najbliższe wydarzenie</h3>
                {upcomingItems.length > 1 && (
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={handlePrevEvent}
                      disabled={nextEventIndex === 0}
                      className="p-1.5 hover:bg-white rounded-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center min-w-[32px] min-h-[32px]"
                      title="Poprzednie"
                    >
                      <FaChevronLeft className="w-3.5 h-3.5 text-gray-700" />
                    </button>
                    <span className="text-sm font-medium text-gray-700 px-2 min-w-[45px] text-center whitespace-nowrap">
                      {nextEventIndex + 1} / {upcomingItems.length}
                    </span>
                    <button
                      onClick={handleNextEvent}
                      disabled={nextEventIndex === upcomingItems.length - 1}
                      className="p-1.5 hover:bg-white rounded-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center min-w-[32px] min-h-[32px]"
                      title="Następne"
                    >
                      <FaChevronRight className="w-3.5 h-3.5 text-gray-700" />
                    </button>
                  </div>
                )}
              </div>
              
              <div
                className={`group relative rounded-xl p-4 md:p-6 border-2 ${
                  currentNextEvent.type === "reservation"
                    ? "bg-gradient-to-br from-purple-50 via-purple-50/80 to-purple-100/50 border-purple-300 hover:border-purple-400"
                    : "bg-gradient-to-br from-blue-50 via-blue-50/80 to-blue-100/50 border-blue-300 hover:border-blue-400"
                }`}
              >
                {/* Decorative corner accent */}
                <div className={`absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-15 transition-opacity duration-300 ${
                  currentNextEvent.type === "reservation"
                    ? "bg-purple-500"
                    : "bg-blue-500"
                }`} style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}></div>
                
                <div className="flex items-start gap-4 md:gap-5 relative z-10">
                  {/* Enhanced Icon Container */}
                  <div className={`relative flex-shrink-0 ${
                    currentNextEvent.type === "reservation"
                      ? "bg-gradient-to-br from-purple-400 to-purple-600"
                      : "bg-gradient-to-br from-blue-400 to-blue-600"
                  } p-3 md:p-4 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                    {currentNextEvent.type === "reservation" ? (
                      <MdBookOnline className="w-6 h-6 md:w-7 md:h-7 text-white flex-shrink-0 relative z-10" />
                    ) : (
                      <FaClock className="w-6 h-6 md:w-7 md:h-7 text-white flex-shrink-0 relative z-10" />
                    )}
                  </div>
                  
                  {/* Content Section */}
                  <div className="flex-1 min-w-0 ">
                    {/* Date/Time Row - Secondary Info */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <FaClock className={`w-4 h-4 flex-shrink-0 ${
                          currentNextEvent.type === "reservation"
                            ? "text-purple-600"
                            : "text-blue-600"
                        }`} />
                        <span className={`text-sm md:text-base font-semibold whitespace-nowrap truncate ${
                          currentNextEvent.type === "reservation"
                            ? "text-purple-700"
                            : "text-blue-700"
                        }`}>
                          {currentNextEvent.datetime.format("D MMMM YYYY")} o {currentNextEvent.time || "00:00"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Title - Primary Info */}
                    <h4
                      className={`text-xl md:text-2xl font-extrabold mb-3 leading-tight flex items-center gap-3 ${
                        currentNextEvent.type === "reservation"
                          ? "text-purple-900"
                          : "text-blue-900"
                      }`}
                    >
                      {currentNextEvent.type === "reservation"
                        ? currentNextEvent.serviceName || "Rezerwacja"
                        : currentNextEvent.title}
                      {currentNextEvent.type === "reservation" && currentNextEvent.status === "confirmed" && (
                        <span className="flex items-center gap-2 text-green-600" title="Zatwierdzona">
                          <FaCheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                          <span className="text-sm md:text-base font-semibold">Zatwierdzona</span>
                        </span>
                      )}
                    </h4>
                    
                    {/* Description */}
                    {currentNextEvent.description && (
                      <p className={`text-sm md:text-base mb-3 text-gray-600 leading-relaxed ${
                        currentNextEvent.type === "reservation"
                          ? "text-purple-700"
                          : "text-blue-700"
                      }`}>{currentNextEvent.description}</p>
                    )}
                    
                    {/* Notes Section - Tertiary Info */}
                    {(currentNextEvent.type === "reservation" && (currentNextEvent.notes || currentNextEvent.specialistNotes)) && (
                      <div className="space-y-3 mt-4">
                        {/* Client Notes - Wiadomość */}
                        {currentNextEvent.notes && (
                          <div className="p-4 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200/80 shadow-sm">
                            <div className="flex items-center gap-2 mb-2.5">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FaEnvelope className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-xs md:text-sm font-bold text-blue-700 uppercase tracking-wider">
                                Wiadomość
                              </span>
                            </div>
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                              {currentNextEvent.notes}
                            </p>
                          </div>
                        )}
                        {/* Specialist Notes - Notatka */}
                        {currentNextEvent.specialistNotes && (
                          <div className="p-4 bg-white/90 backdrop-blur-sm rounded-lg border border-purple-200/80 shadow-sm">
                            <div className="flex items-center gap-2 mb-2.5">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <FaStickyNote className="w-4 h-4 text-purple-600" />
                              </div>
                              <span className="text-xs md:text-sm font-bold text-purple-700 uppercase tracking-wider">
                                Notatka
                              </span>
                            </div>
                            <p className="text-sm md:text-base text-purple-900 leading-relaxed font-medium">
                              {currentNextEvent.specialistNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Contact Button (for reservations) */}
                    {currentNextEvent.type === "reservation" && currentNextEvent.customerPhone && (
                      <div className="mt-5">
                        <button
                          onClick={() => handleContactCustomer(currentNextEvent.customerPhone)}
                          className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5"
                        >
                          <FaPhone className="w-4 h-4" />
                          <span>Zadzwoń</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Combined Month Navigation + Calendar Grid */}
          <div className="border-t border-gray-200 bg-white min-w-full">
            {/* Month Navigation - Top part */}
            <div className="px-2 sm:px-3 md:px-4 py-2.5 sm:py-3 md:py-4 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 flex-1 min-w-0">
                  <button
                    onClick={handlePrev}
                    className="focus:outline-none p-1 sm:p-1.5 md:p-2 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200 touch-manipulation min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] md:min-w-0 md:min-h-0 flex items-center justify-center flex-shrink-0 group"
                    title="Poprzedni miesiąc"
                  >
                    <FaChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                  </button>
                  <button
                    onClick={handleToday}
                    className="focus:outline-none px-2 sm:px-3 md:px-4 py-1.5 md:py-2 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm md:text-base touch-manipulation flex-shrink-0 whitespace-nowrap"
                    title="Dzisiaj"
                  >
                    Dzisiaj
                  </button>
                  <button
                    onClick={handleNext}
                    className="focus:outline-none p-1 sm:p-1.5 md:p-2 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200 touch-manipulation min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] md:min-w-0 md:min-h-0 flex items-center justify-center flex-shrink-0 group"
                    title="Następny miesiąc"
                  >
                    <FaChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                  </button>
                  <div className="ml-1 sm:ml-2 md:ml-4 text-sm sm:text-base md:text-lg font-bold text-gray-900 capitalize truncate min-w-0 flex-1">
                    {currentDate.format("MMMM YYYY")}
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Grid - Bottom part, seamlessly connected */}
            <div className="group  w-full">
              {renderMonthView()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Modal */}
      {showEventModal && (
        <EventFormModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
            setSelectedDate(null);
          }}
          event={selectedEvent}
          initialDate={selectedDate}
          userId={user?.uid}
          onSave={handleEventSaved}
        />
      )}

      {/* Day Popup */}
      {showDayPopup && selectedDay && (
        <MemoizedDayPopup
          key={selectedDay.format("YYYY-MM-DD")}
          day={selectedDay}
          onClose={() => {
            setShowDayPopup(false);
            setSelectedDay(null);
          }}
          reservations={reservations}
          events={events}
          onAddEvent={(date) => {
            setSelectedDate(date);
            setSelectedEvent(null);
            setShowDayPopup(false);
            setShowEventModal(true);
          }}
          onEditEvent={(event) => {
            handleEditEvent(event);
            setShowDayPopup(false);
          }}
          onEditReservation={(reservation) => {
            handleEditReservation(reservation);
            setShowDayPopup(false);
          }}
          onContactCustomer={handleContactCustomer}
          onDeleteEvent={handleDeleteEvent}
          onReload={loadData}
          onApproveReservation={handleApproveReservation}
          onDeclineReservation={handleDeclineReservation}
          onCallReservation={handleCallReservation}
          declineConfirmId={declineConfirmId}
          setDeclineConfirmId={setDeclineConfirmId}
        />
      )}

      {/* Reservation Edit Modal */}
      {showReservationModal && (
        <ReservationEditModal
          isOpen={showReservationModal}
          onClose={() => {
            setShowReservationModal(false);
            setSelectedReservation(null);
          }}
          reservation={selectedReservation}
          onSave={handleReservationSaved}
        />
      )}
    </>
  );
}
