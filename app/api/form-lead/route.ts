import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addDocument } from "@/firebase";

/** Jeden typ body — unika `never` przy przecięciu dwóch wariantów `source` */
type FormLeadRequestBody = Partial<{
  source: "city-page" | "booking-modal";
  name: string;
  phone: string;
  citySlug: string;
  cityName: string;
  serviceType: "manicure" | "pedicure";
  profileSlug: string;
  specialistUid: string;
  specialistName: string;
  selectedServiceName: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  notes: string | null;
  path: string;
}>;

function sanitize(str: unknown, max = 200): string {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, max);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FormLeadRequestBody;

    const id = `fl_${randomUUID()}`;
    const now = new Date().toISOString();

    if (body.source === "booking-modal") {
      const phone = sanitize(body.phone, 40);
      const specialistUid = sanitize(body.specialistUid, 128);
      const profileSlug = sanitize(body.profileSlug, 200);
      const name = sanitize(body.name, 120) || "Klientka";

      if (!phone || phone.replace(/\s/g, "").length < 9) {
        return NextResponse.json(
          { error: "Podaj poprawny numer telefonu." },
          { status: 400 }
        );
      }
      if (!specialistUid) {
        return NextResponse.json(
          { error: "Brak identyfikatora specjalistki." },
          { status: 400 }
        );
      }
      if (!profileSlug) {
        return NextResponse.json(
          { error: "Brak identyfikatora profilu." },
          { status: 400 }
        );
      }

      const serviceType =
        body.serviceType === "pedicure" ? "pedicure" : "manicure";
      const path =
        sanitize(body.path, 300) || `/zarezerwuj/${profileSlug}`;

      const record = {
        id,
        name,
        phone,
        citySlug: profileSlug,
        cityName: sanitize(body.specialistName, 200) || null,
        serviceType,
        source: "booking-modal" as const,
        createdAt: now,
        path,
        specialistUid,
        specialistName: sanitize(body.specialistName, 200) || null,
        selectedServiceName: body.selectedServiceName
          ? sanitize(body.selectedServiceName, 200)
          : null,
        preferredDate: body.preferredDate
          ? sanitize(body.preferredDate, 32)
          : null,
        preferredTime: body.preferredTime
          ? sanitize(body.preferredTime, 16)
          : null,
        notes: body.notes ? sanitize(body.notes, 2000) : null,
      };

      await addDocument("formLead", id, record);

      return NextResponse.json({ ok: true, id }, { status: 201 });
    }

    /* ——— city-page (manicure / pedicure landing) ——— */
    const name = sanitize(body.name, 120);
    const phone = sanitize(body.phone, 40);
    const citySlug = sanitize(body.citySlug, 120);
    const cityName = sanitize(body.cityName, 120);
    const serviceType = body.serviceType;

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Podaj imię (min. 2 znaki)." },
        { status: 400 }
      );
    }
    if (!phone || phone.replace(/\s/g, "").length < 9) {
      return NextResponse.json(
        { error: "Podaj poprawny numer telefonu." },
        { status: 400 }
      );
    }
    if (!citySlug) {
      return NextResponse.json(
        { error: "Brak identyfikatora miasta." },
        { status: 400 }
      );
    }
    if (serviceType !== "manicure" && serviceType !== "pedicure") {
      return NextResponse.json(
        { error: "Nieprawidłowy typ usługi." },
        { status: 400 }
      );
    }

    const record = {
      id,
      name,
      phone,
      citySlug,
      cityName: cityName || null,
      serviceType,
      source: "city-page" as const,
      createdAt: now,
      path: `/${serviceType}/${citySlug}`,
    };

    await addDocument("formLead", id, record);

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Błąd serwera";
    console.error("[form-lead]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
