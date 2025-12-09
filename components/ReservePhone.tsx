"use client";
import { useState } from "react";

export default function ReservePhone({
  specialistUid,
  specialistName,
  serviceName,
  sourceSlug,
  className,
}: {
  specialistUid?: string;
  specialistName?: string;
  serviceName?: string;
  sourceSlug?: string;
  className?: string;
}) {
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!phone.trim()) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialistUid,
          specialistName,
          serviceName,
          customerPhone: phone.trim(),
          sourceSlug,
        }),
      });
      if (!res.ok) throw new Error("Błąd rezerwacji");
      setPhone("");
      alert("Dziękujemy! Skontaktujemy się pod wskazanym numerem.");
    } catch (err) {
      alert("Nie udało się wysłać rezerwacji.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <input
          type="tel"
          placeholder="Twój numer telefonu"
          className="px-3 py-2 border rounded w-full"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <button
          disabled={submitting}
          onClick={submit}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          Wyślij
        </button>
      </div>
    </div>
  );
}
