"use client";
import { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaTimes,
  FaCheck,
  FaMapMarkerAlt,
  FaTag,
} from "react-icons/fa";
import { User, IService } from "@/types";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa6";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  preselectedService?: IService | null;
}

export default function ReservationModal({
  isOpen,
  onClose,
  user,
  preselectedService = null,
}: ReservationModalProps) {
  const [selectedService, setSelectedService] = useState<IService | null>(preselectedService);
  
  useEffect(() => {
    if (isOpen && preselectedService) {
      setSelectedService(preselectedService);
    }
  }, [isOpen, preselectedService]);
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    const profileSlug = user.userSlugUrl || user.uid || "";

    try {
      setSubmitting(true);
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialistUid: user.uid,
          specialistName: user.name,
          serviceName: selectedService?.real_name || "Konsultacja",
          customerPhone: phone.trim(),
          preferredDate,
          preferredTime,
          notes,
          sourceSlug: user.userSlugUrl,
        }),
      });

      if (!res.ok) throw new Error("Błąd rezerwacji");

      /* Zapis leada w tej samej kolekcji co formularze miast (formLead) */
      try {
        const leadRes = await fetch("/api/form-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "booking-modal",
            name: "Klientka",
            phone: phone.trim(),
            profileSlug,
            specialistUid: user.uid,
            specialistName: user.name,
            serviceType: "manicure",
            selectedServiceName: selectedService?.real_name ?? null,
            preferredDate: preferredDate || null,
            preferredTime: preferredTime || null,
            notes: notes.trim() ? notes.trim() : null,
            path: profileSlug ? `/zarezerwuj/${profileSlug}` : "/zarezerwuj",
          }),
        });
        if (!leadRes.ok) {
          const err = await leadRes.json().catch(() => ({}));
          console.error("[ReservationModal] formLead failed:", err);
        }
      } catch (leadErr) {
        console.error("[ReservationModal] formLead request error:", leadErr);
      }

      setSuccess(true);
      setPhone("");
      setPreferredDate("");
      setPreferredTime("");
      setNotes("");
      setSelectedService(null);

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      alert("Nie udało się wysłać rezerwacji. Spróbuj ponownie.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[15000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <FaCheck className="text-3xl text-green-600" />
            </div>
            <h3 className="font-baloo text-3xl font-bold text-neutral-900 mb-3">
              Rezerwacja wysłana!
            </h3>
            <p className="text-neutral-600 font-poppins text-lg">
              Dziękujemy! {user.name} skontaktuje się z Tobą wkrótce pod
              wskazanym numerem.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="font-baloo text-xl md:text-2xl font-bold text-zinc-800 break-words pr-4">
                Zarezerwuj wizytę
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/80 transition-colors"
              >
                <FaTimes className="text-neutral-600 w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              {/* Specialist Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center gap-4">
                  <Image
                    src={user.logo || "/default-user.png"}
                    alt={user.name}
                    width={70}
                    height={70}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-baloo text-lg md:text-xl font-bold text-neutral-900 mb-1 break-words">
                      {user.name}
                    </h3>
                    {user.location?.address && (
                      <div className="flex items-start gap-2 text-sm text-neutral-600 font-poppins">
                        <FaMapMarkerAlt className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="break-words">{user.location.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Selection */}
              {user.services?.length > 0 && (
                <div>
                  <label className="block font-baloo text-lg font-bold text-zinc-800 mb-4">
                    Wybierz usługę (opcjonalnie)
                  </label>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {user.services.map((service) => (
                      <label
                        key={service.flatten_name}
                        className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedService?.flatten_name === service.flatten_name
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-neutral-200 hover:border-blue-300 hover:bg-neutral-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="service"
                          value={service.flatten_name}
                          checked={
                            selectedService?.flatten_name ===
                            service.flatten_name
                          }
                          onChange={() => setSelectedService(service)}
                          className="mt-1 text-blue-600 w-5 h-5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-baloo text-base md:text-lg font-bold text-neutral-900 mb-1 break-words">
                            {service.real_name}
                          </div>
                          {service.description && (
                            <p className="text-sm text-neutral-600 mb-2 font-poppins line-clamp-2 break-words">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 flex-wrap">
                            {typeof service.price === "number" && (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-lg border border-blue-200">
                                <FaTag className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-700 font-bold text-sm font-poppins">
                                  {service.price} zł
                                </span>
                              </div>
                            )}
                            {service.duration && (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg border border-neutral-200">
                                <FaClock className="w-4 h-4 text-neutral-600" />
                                <span className="text-neutral-700 font-semibold text-sm font-poppins">
                                  {service.duration} min
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div>
                <label className="block font-baloo text-lg font-bold text-zinc-800 mb-2">
                  Numer telefonu *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Twój numer telefonu"
                  className="w-full p-4 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-poppins text-base"
                />
              </div>

              {/* Preferred Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-baloo text-lg font-bold text-zinc-800 mb-2">
                    Preferowana data
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full p-4 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-poppins"
                  />
                </div>
                <div>
                  <label className="block font-baloo text-lg font-bold text-zinc-800 mb-2">
                    Preferowana godzina
                  </label>
                  <input
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full p-4 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-poppins"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-baloo text-lg font-bold text-zinc-800 mb-2">
                  Dodatkowe informacje
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dodatkowe informacje, pytania lub uwagi..."
                  rows={4}
                  className="w-full p-4 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none font-poppins text-base"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !phone.trim()}
                className="w-full group relative px-8 py-4 bg-blue-600 text-white rounded-xl font-baloo font-bold text-lg transition-all duration-200 hover:bg-blue-700 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <FaCalendarAlt className="w-5 h-5" />
                {submitting ? "Wysyłanie..." : "Wyślij prośbę o rezerwację"}
                <FaArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

              <p className="text-sm text-neutral-500 text-center font-poppins">
                To jest darmowa prośba o rezerwację. Stylistka skontaktuje się z Tobą wkrótce.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
