"use client";
import { useState, useEffect } from "react";
import { FaTimes, FaSave, FaCalendar, FaClock, FaStickyNote } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ReservationEditModal({
  isOpen,
  onClose,
  reservation,
  onSave,
}) {
  const [formData, setFormData] = useState({
    preferredDate: "",
    preferredTime: "",
    specialistNotes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reservation && reservation.id) {
      setFormData({
        preferredDate: reservation.preferredDate || reservation.date || "",
        preferredTime: reservation.preferredTime || reservation.time || "",
        specialistNotes: reservation.specialistNotes || "",
      });
    }
  }, [reservation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reservation?.id) {
      toast.error("Brak identyfikatora rezerwacji");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredDate: formData.preferredDate || null,
          preferredTime: formData.preferredTime || null,
          specialistNotes: formData.specialistNotes.trim() || null,
        }),
      });
      
      if (res.ok) {
        toast.success("Rezerwacja została zaktualizowana");
        // Fetch updated reservation to get all fields
        const updatedRes = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/reservations/${reservation.id}`);
        if (updatedRes.ok) {
          const updatedReservation = await updatedRes.json();
          onSave(updatedReservation);
        } else {
          // Fallback: construct reservation from form data
          const updatedReservation = {
            ...reservation,
            preferredDate: formData.preferredDate || null,
            preferredTime: formData.preferredTime || null,
            specialistNotes: formData.specialistNotes.trim() || null,
          };
          onSave(updatedReservation);
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Nie udało się zaktualizować rezerwacji");
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast.error("Błąd podczas aktualizacji rezerwacji");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edytuj rezerwację</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendar className="text-purple-600" />
                Data
              </label>
              <input
                type="date"
                value={formData.preferredDate}
                onChange={(e) =>
                  setFormData({ ...formData, preferredDate: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaClock className="text-purple-600" />
                Godzina
              </label>
              <input
                type="time"
                value={formData.preferredTime}
                onChange={(e) =>
                  setFormData({ ...formData, preferredTime: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Client Notes (read-only, no label) */}
          {reservation?.notes && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                {reservation.notes}
              </p>
            </div>
          )}

          {/* Specialist Notes (editable) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaStickyNote className="text-purple-600" />
              Twoje notatki
            </label>
            <textarea
              value={formData.specialistNotes}
              onChange={(e) =>
                setFormData({ ...formData, specialistNotes: e.target.value })
              }
              placeholder="Dodaj swoje notatki do rezerwacji..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Service Info (read-only) */}
          {reservation?.serviceName && (
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-sm font-semibold text-purple-900">Usługa:</p>
              <p className="text-sm text-purple-700">{reservation.serviceName}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all duration-200"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Zapisywanie...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Zapisz</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

