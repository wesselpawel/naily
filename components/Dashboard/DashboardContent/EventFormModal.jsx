"use client";
import { useState, useEffect } from "react";
import { FaTimes, FaSave, FaCalendar, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";

export default function EventFormModal({
  isOpen,
  onClose,
  event,
  initialDate,
  userId,
  onSave,
}) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event && event.id) {
      // Full event object for editing
      setFormData({
        title: event.title || "",
        date: event.date || "",
        time: event.time || "",
        description: event.description || "",
      });
    } else if (event && event.time) {
      // Partial event object with pre-filled time (from time slot click)
      setFormData({
        title: "",
        date: initialDate || new Date().toISOString().split("T")[0],
        time: event.time || "",
        description: "",
      });
    } else if (initialDate) {
      setFormData({
        title: "",
        date: initialDate,
        time: "",
        description: "",
      });
    } else {
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        title: "",
        date: today,
        time: "",
        description: "",
      });
    }
  }, [event, initialDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Tytuł jest wymagany");
      return;
    }
    if (!formData.date) {
      toast.error("Data jest wymagana");
      return;
    }
    if (!userId) {
      toast.error("Brak identyfikatora użytkownika");
      return;
    }

    setLoading(true);
    try {
      if (event && event.id) {
        // Update existing event
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/events/${event.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title.trim(),
            date: formData.date,
            time: formData.time || null,
            description: formData.description.trim() || null,
          }),
        });
        if (res.ok) {
          toast.success("Wydarzenie zostało zaktualizowane");
          // Fetch updated event to get all fields
          const updatedRes = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/events/${event.id}`);
          if (updatedRes.ok) {
            const updatedEvent = await updatedRes.json();
            onSave(updatedEvent);
          } else {
            // Fallback: construct event from form data
            const updatedEvent = {
              ...event,
              title: formData.title.trim(),
              date: formData.date,
              time: formData.time || null,
              description: formData.description.trim() || null,
            };
            onSave(updatedEvent);
          }
        } else {
          const data = await res.json();
          toast.error(data.error || "Nie udało się zaktualizować wydarzenia");
        }
      } else {
        // Create new event
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            title: formData.title.trim(),
            date: formData.date,
            time: formData.time || null,
            description: formData.description.trim() || null,
          }),
        });
        if (res.ok) {
          const newEvent = await res.json();
          toast.success("Wydarzenie zostało dodane");
          onSave(newEvent);
        } else {
          const data = await res.json();
          toast.error(data.error || "Nie udało się dodać wydarzenia");
        }
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Wystąpił błąd podczas zapisywania");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {event ? "Edytuj wydarzenie" : "Dodaj wydarzenie"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tytuł <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Np. Spotkanie z klientem"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaCalendar className="inline w-4 h-4 mr-1" />
              Data <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaClock className="inline w-4 h-4 mr-1" />
              Godzina (opcjonalnie)
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Opis (opcjonalnie)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Dodatkowe informacje o wydarzeniu..."
              rows={4}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave />
              {loading ? "Zapisywanie..." : event ? "Zapisz zmiany" : "Dodaj"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

