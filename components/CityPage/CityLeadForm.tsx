"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { FaCheck, FaPhone, FaShieldHalved, FaWandSparkles } from "react-icons/fa6";

type CityLeadFormProps = {
  citySlug: string;
  cityName: string;
  serviceType: "manicure" | "pedicure";
  /** Glass style for use on dark / image hero */
  variant?: "glass" | "light";
  isCourse?: boolean;
};

export default function CityLeadForm({
  citySlug,
  cityName,
  serviceType,
  variant = "glass",
  isCourse,
}: CityLeadFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const serviceLabel = serviceType === "manicure" ? "manicure" : "pedicure";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/form-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          citySlug,
          cityName,
          serviceType,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(
          typeof data.error === "string" ? data.error : "Nie udało się wysłać formularza."
        );
        return;
      }
      toast.success("Dziękujemy! Skontaktujemy się wkrótce.");
      setName("");
      setPhone("");
    } catch {
      toast.error("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setSubmitting(false);
    }
  }

  const isGlass = variant === "glass";

  return (
    <div
      className={
        isGlass
          ? "relative overflow-hidden rounded-3xl border border-white/18 bg-slate-950/90 p-6 shadow-[0_25px_80px_-12px_rgba(0,0,0,0.55)] backdrop-blur-md md:p-8"
          : "relative overflow-hidden rounded-3xl border border-purple-200/80 bg-white p-6 shadow-xl md:p-8"
      }
    >
      {/* Subtle accents — dark-tinted so text stays readable on hero */}
      {isGlass ? (
        <>
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-blue-600/15 blur-3xl"
            aria-hidden
          />
        </>
      ) : (
        <>
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-40 blur-3xl"
            style={{
              background:
                "linear-gradient(135deg, rgb(139 92 246), rgb(236 72 153), rgb(59 130 246))",
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full opacity-30 blur-2xl"
            style={{ background: "rgb(59 130 246)" }}
          />
        </>
      )}

      <div className="relative">
        <div className="mb-5 flex items-start gap-3">
          <div
            className={
              isGlass
                ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg"
                : "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg"
            }
          >
            <FaWandSparkles className="h-5 w-5" aria-hidden />
          </div>
          <div>
            
            <h2
              className={
                isGlass
                  ? "mt-1 font-baloo text-2xl font-bold leading-tight text-white md:text-3xl"
                  : "mt-1 font-baloo text-2xl font-bold leading-tight text-zinc-900 md:text-3xl"
              }
            >
              {isCourse ? "Zapisz się na kurs" : "Umów wizytę w " + cityName}
            </h2>
            <p
              className={
                isGlass
                  ? "mt-1.5 text-sm text-slate-200 font-poppins"
                  : "mt-1.5 text-sm text-neutral-600 font-poppins"
              }
            >
              Zostaw numer — pomożemy znaleźć {serviceLabel} w Twojej okolicy.
            </p>
          </div>
        </div>

        <ul
          className={
            isGlass
              ? "mb-6 space-y-2 text-sm text-slate-100 font-poppins"
              : "mb-6 space-y-2 text-sm text-neutral-600 font-poppins"
          }
        >
          <li className="flex items-center gap-2">
            <FaCheck className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
            Miasto: <strong className={isGlass ? "text-white" : "text-zinc-800"}>{cityName}</strong>
          </li>
          <li className="flex items-center gap-2">
            <FaShieldHalved className="h-4 w-4 shrink-0 text-sky-400" aria-hidden />
            {isCourse ? "Bez spamu — tylko kontakt w sprawie kursu" : "Bez spamu — tylko kontakt w sprawie wizyty"}
          </li>
        </ul>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor={`lead-name-${citySlug}`}
              className={
                isGlass
                  ? "mb-1 block text-xs font-medium text-slate-300"
                  : "mb-1 block text-xs font-medium text-neutral-600"
              }
            >
              Imię
            </label>
            <input
              id={`lead-name-${citySlug}`}
              name="name"
              type="text"
              autoComplete="given-name"
              required
              minLength={2}
              maxLength={120}
              placeholder="np. Anna"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl border border-white/10 bg-white/95 px-4 py-3.5 text-zinc-900 shadow-inner placeholder:text-neutral-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30 font-poppins text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`lead-phone-${citySlug}`}
              className={
                isGlass
                  ? "mb-1 block text-xs font-medium text-slate-300"
                  : "mb-1 block text-xs font-medium text-neutral-600"
              }
            >
              Telefon
            </label>
            <input
              id={`lead-phone-${citySlug}`}
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              minLength={9}
              maxLength={40}
              placeholder="+48 …"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl border border-white/10 bg-white/95 px-4 py-3.5 text-zinc-900 shadow-inner placeholder:text-neutral-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30 font-poppins text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="group relative mt-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-60 font-poppins"
          >
            <span className="relative z-10">
              {submitting ? "Wysyłanie…" : "Wyślij — oddzwonimy"}
            </span>
            <span
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              aria-hidden
            />
          </button>
          <p
            className={
                isGlass
                ? "text-center text-[11px] text-slate-400"
                : "text-center text-[11px] text-neutral-500"
            }
          >
            Wysyłając formularz akceptujesz kontakt w celu umówienia wizyty.
          </p>
        </form>
      </div>
    </div>
  );
}
