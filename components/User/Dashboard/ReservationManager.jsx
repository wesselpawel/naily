"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  FaCalendar,
  FaClock,
  FaUser,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaFilter,
  FaSearch,
  FaInfoCircle,
} from "react-icons/fa";
import { MdBookOnline, MdSchedule, MdPerson } from "react-icons/md";
import { toast } from "react-toastify";

// Mock data for services and specialists
const mockServices = [
  { id: 1, name: "Manicure hybrydowy", price: 80, duration: 60 },
  { id: 2, name: "Pedicure klasyczny", price: 60, duration: 45 },
  { id: 3, name: "Manicure klasyczny", price: 50, duration: 30 },
  { id: 4, name: "Pedicure hybrydowy", price: 90, duration: 75 },
  { id: 5, name: "Przedłużanie paznokci", price: 120, duration: 90 },
];

const mockSpecialists = [
  { id: 1, name: "Anna Kowalska", services: [1, 2, 3] },
  { id: 2, name: "Maria Nowak", services: [1, 2, 3, 4] },
  { id: 3, name: "Katarzyna Wiśniewska", services: [1, 2, 3, 4, 5] },
];

// Placeholder reservations data (shown when user hasn't made any reservations)
const placeholderReservations = [
  {
    id: "placeholder-1",
    serviceId: 1,
    specialistId: 1,
    date: "2024-02-15",
    time: "14:00",
    status: "confirmed",
    price: 80,
    createdAt: "2024-02-10T10:00:00Z",
    isPlaceholder: true,
  },
  {
    id: "placeholder-2",
    serviceId: 2,
    specialistId: 2,
    date: "2024-02-18",
    time: "16:30",
    status: "pending",
    price: 60,
    createdAt: "2024-02-12T15:30:00Z",
    isPlaceholder: true,
  },
  {
    id: "placeholder-3",
    serviceId: 4,
    specialistId: 3,
    date: "2024-02-20",
    time: "10:00",
    status: "confirmed",
    price: 90,
    createdAt: "2024-02-15T09:15:00Z",
    isPlaceholder: true,
  },
];

// Fetch reservations for current specialist (dashboard owner)
async function fetchSpecialistReservations(specialistUid) {
  try {
    const res = await fetch(
      `/api/reservations?specialistUid=${encodeURIComponent(specialistUid)}`,
      {
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default function ReservationManager() {
  const { user } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [userReservations, setUserReservations] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    (async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      const data = await fetchSpecialistReservations(user.uid);
      if (isActive) {
        setUserReservations(data);
        setLoading(false);
      }
    })();
    return () => {
      isActive = false;
    };
  }, [user?.uid]);

  // Determine which reservations to show
  const hasUserReservations = userReservations.length > 0;
  const reservationsToShow = hasUserReservations
    ? userReservations
    : placeholderReservations;
  const isShowingPlaceholders = !hasUserReservations && !loading;
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  // Creation in dashboard removed for now per spec; only manage incoming reservations

  const getServiceById = (id) => mockServices.find((s) => s.id === id);
  const getSpecialistById = (id) => mockSpecialists.find((s) => s.id === id);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Potwierdzona";
      case "pending":
        return "Oczekująca";
      case "cancelled":
        return "Anulowana";
      case "completed":
        return "Ukończona";
      default:
        return "Nieznany";
    }
  };

  const filteredReservations = reservationsToShow.filter((reservation) => {
    const matchesStatus =
      filterStatus === "all" || reservation.status === filterStatus;
    const haystack = [
      reservation?.serviceName,
      reservation?.specialistName,
      reservation?.customerPhone,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch =
      searchTerm === "" || haystack.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const now = new Date();
  const upcomingReservations = filteredReservations.filter((reservation) => {
    if (reservation?.date && reservation?.time) {
      return new Date(`${reservation.date} ${reservation.time}`) > now;
    }
    return true; // phone-only reservations treated as upcoming
  });

  const pastReservations = filteredReservations.filter((reservation) => {
    if (reservation?.date && reservation?.time) {
      return new Date(`${reservation.date} ${reservation.time}`) <= now;
    }
    return false;
  });

  async function updateReservation(id, update) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/reservations/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    return res.ok;
  }

  const handleCancelReservation = async (id) => {
    const ok = await updateReservation(id, { status: "cancelled" });
    if (!ok) return toast.error("Nie udało się zaktualizować rezerwacji");
    setUserReservations((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status: "cancelled" } : res))
    );
    toast.success("Rezerwacja została anulowana");
  };

  const handleConfirmReservation = async (id) => {
    const ok = await updateReservation(id, { status: "confirmed" });
    if (!ok) return toast.error("Nie udało się zaktualizować rezerwacji");
    setUserReservations((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status: "confirmed" } : res))
    );
    toast.success("Rezerwacja została potwierdzona");
  };

  const getAvailableSpecialists = (serviceId) => {
    return mockSpecialists.filter((specialist) =>
      specialist.services.includes(parseInt(serviceId))
    );
  };

  const getAvailableTimes = () => {
    const times = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        times.push(time);
      }
    }
    return times;
  };

  const renderReservationCard = (reservation) => {
    const isPhoneOnly = !!reservation?.customerPhone;
    if (isPhoneOnly) {
      return (
        <div
          key={reservation.id}
          className="bg-white border border-beauty-rose-200 rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-beauty-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaCalendar className="text-sm md:text-base text-beauty-rose-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-beauty-charcoal text-sm md:text-base truncate">
                  {reservation.serviceName || "Nowa rezerwacja"}
                </h3>
                <p className="text-xs md:text-sm text-beauty-slate truncate">
                  Telefon: {reservation.customerPhone}
                </p>
                {reservation.createdAt && (
                  <p className="text-xs text-beauty-slate truncate">
                    {new Date(reservation.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  reservation.status
                )}`}
              >
                {getStatusText(reservation.status)}
              </span>
            </div>

            <div className="flex gap-2 pt-2 border-t border-beauty-rose-100">
              {reservation.status === "pending" && (
                <>
                  <button
                    onClick={() => handleConfirmReservation(reservation.id)}
                    className="flex-1 flex items-center justify-center gap-1 p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-xs md:text-sm"
                    title="Potwierdź"
                  >
                    <FaCheck className="text-xs" />
                    <span>Potwierdź</span>
                  </button>
                  <button
                    onClick={() => handleCancelReservation(reservation.id)}
                    className="flex-1 flex items-center justify-center gap-1 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-xs md:text-sm"
                    title="Anuluj"
                  >
                    <FaTimes className="text-xs" />
                    <span>Anuluj</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Fallback to demo structure
    const service = getServiceById(reservation.serviceId);
    const specialist = getSpecialistById(reservation.specialistId);
    return (
      <div
        key={reservation.id}
        className="bg-white border border-beauty-rose-200 rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-beauty-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaCalendar className="text-sm md:text-base text-beauty-rose-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-beauty-charcoal text-sm md:text-base truncate">
                {service?.name}
              </h3>
              <p className="text-xs md:text-sm text-beauty-slate truncate">
                {specialist?.name}
              </p>
            </div>
          </div>

          {reservation?.date && reservation?.time && (
            <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-beauty-slate">
              <div className="flex items-center gap-1">
                <FaCalendar className="text-beauty-rose-500" />
                <span>{reservation.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaClock className="text-beauty-rose-500" />
                <span>{reservation.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaUser className="text-beauty-rose-500" />
                <span>{service?.duration} min</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                reservation.status
              )}`}
            >
              {getStatusText(reservation.status)}
            </span>
            {reservation?.price && (
              <p className="text-base md:text-lg font-bold text-beauty-charcoal">
                {reservation.price} zł
              </p>
            )}
          </div>

          {!reservation.isPlaceholder && (
            <div className="flex gap-2 pt-2 border-t border-beauty-rose-100">
              {reservation.status === "pending" && (
                <>
                  <button
                    onClick={() => handleConfirmReservation(reservation.id)}
                    className="flex-1 flex items-center justify-center gap-1 p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-xs md:text-sm"
                    title="Potwierdź"
                  >
                    <FaCheck className="text-xs" />
                    <span>Potwierdź</span>
                  </button>
                  <button
                    onClick={() => handleCancelReservation(reservation.id)}
                    className="flex-1 flex items-center justify-center gap-1 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-xs md:text-sm"
                    title="Anuluj"
                  >
                    <FaTimes className="text-xs" />
                    <span>Anuluj</span>
                  </button>
                </>
              )}
              <button
                className="flex-1 flex items-center justify-center gap-1 p-2 text-beauty-rose-500 hover:bg-beauty-rose-100 rounded-lg transition-colors text-xs md:text-sm"
                title="Edytuj"
              >
                <FaEdit className="text-xs" />
                <span>Edytuj</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Placeholder Notice */}
      {isShowingPlaceholders && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">
                Uwaga! Dane przykładowe
              </h3>
              <p className="text-yellow-700 text-sm mb-3">
                Gdy pojawią się rezerwacje od klientów, zobaczysz je tutaj.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-white rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all ${
            activeTab === "upcoming"
              ? "bg-rose-600 text-white"
              : "hover:bg-rose-50"
          }`}
        >
          <MdSchedule className="text-lg" />
          <span>Nadchodzące ({upcomingReservations.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all ${
            activeTab === "past" ? "bg-rose-600 text-white" : "hover:bg-rose-50"
          }`}
        >
          <MdBookOnline className="text-lg" />
          <span>Przeszłe ({pastReservations.length})</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-beauty-slate" />
          <input
            type="text"
            placeholder="Szukaj rezerwacji..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 md:py-2 border border-beauty-rose-200 rounded-xl focus:ring-2 focus:ring-beauty-rose-500 focus:border-transparent text-base shadow-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 md:py-2 border border-beauty-rose-200 rounded-xl focus:ring-2 focus:ring-beauty-rose-500 focus:border-transparent text-base shadow-sm"
        >
          <option value="all">Wszystkie statusy</option>
          <option value="confirmed">Potwierdzone</option>
          <option value="pending">Oczekujące</option>
          <option value="cancelled">Anulowane</option>
          <option value="completed">Ukończone</option>
        </select>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {activeTab === "upcoming" && (
          <>
            {upcomingReservations.length === 0 ? (
              <div className="text-center py-8">
                <FaCalendar className="text-4xl text-beauty-slate mx-auto mb-4" />
                <p className="text-beauty-slate">
                  Brak nadchodzących rezerwacji
                </p>
              </div>
            ) : (
              upcomingReservations.map(renderReservationCard)
            )}
          </>
        )}

        {activeTab === "past" && (
          <>
            {pastReservations.length === 0 ? (
              <div className="text-center py-8">
                <MdBookOnline className="text-4xl text-beauty-slate mx-auto mb-4" />
                <p className="text-beauty-slate">Brak przeszłych rezerwacji</p>
              </div>
            ) : (
              pastReservations.map(renderReservationCard)
            )}
          </>
        )}
      </div>

      {/* Creation modal removed */}
    </div>
  );
}
