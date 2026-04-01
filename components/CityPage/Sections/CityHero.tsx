import Image from "next/image";
import { ICity } from "@/types";
import Logic from "@/components/SearchBar/Logic";
import CityLeadForm from "@/components/CityPage/CityLeadForm";

interface CityHeroProps {
  city: ICity;
  serviceType: "manicure" | "pedicure";
  /** Override default H1 */
  headline?: string;
  /** Override default subtitle */
  description?: string;
}

export default function CityHero({
  city,
  serviceType,
  headline,
  description,
}: CityHeroProps) {
  const baseRoute =
    serviceType === "manicure"
      ? "kursy-stylizacji-paznokci"
      : "kursy-pedicure";
  const serviceName = serviceType === "manicure" ? "Manicure" : "Pedicure";
  const title =
    headline ?? `${serviceName} ${city.name} - Cennik 2026`;
  const subtitle =
    description ??
    `Sprawdzone miejsca z najwyższymi ocenami klientek i profesjonalnym ${serviceType}. Sprawdź przewidywane ceny i katalog stylistek ${serviceType} w swoim mieście.`;

  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-clip">
      {/* Full-bleed hero: edge-to-edge on desktop even when parent is narrow */}
      <section className="relative isolate min-h-[calc(100svh-4.75rem)] w-full overflow-hidden bg-slate-950 lg:min-h-[calc(100svh-5rem)]">
        {/* Background photo — full section width, woman visible on the right */}
        <Image
          src="/woman.png"
          alt=""
          fill
          priority
          className="object-cover object-[82%_22%] sm:object-[78%_center] lg:object-[72%_center] xl:object-[68%_center]"
          sizes="100vw"
          aria-hidden
        />
        {/* Left: readability for copy. Right: lighter so the photo stays visible (desktop) */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/92 to-slate-950/55 sm:via-slate-950/78 sm:to-slate-950/25 lg:from-slate-950/95 lg:via-slate-900/50 lg:via-45% lg:to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30 lg:from-slate-950/50 lg:to-slate-950/20"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_55%_70%_at_90%_35%,transparent_0%,rgba(15,23,42,0.2)_55%,rgba(15,23,42,0.55)_100%)] lg:bg-[radial-gradient(ellipse_50%_80%_at_95%_30%,transparent_0%,transparent_45%,rgba(15,23,42,0.35)_100%)]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4.75rem)] max-w-[1600px] items-center px-5 py-12 sm:px-8 lg:min-h-[calc(100svh-5rem)] lg:px-12 xl:px-16 2xl:px-20">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_minmax(280px,440px)] lg:gap-14 xl:grid-cols-[1.15fr_minmax(320px,460px)]">
            {/* Copy + search */}
            <div className="max-w-2xl lg:max-w-none">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-200 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                {city.name} · 2026
              </p>
              <h1 className="font-baloo text-4xl font-bold leading-[1.06] text-white drop-shadow-sm sm:text-5xl lg:text-[2.75rem] xl:text-5xl 2xl:text-6xl">
                {title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-100/95 font-poppins sm:text-lg lg:max-w-2xl">
                {subtitle}
              </p>

              <div className="mt-8 max-w-xl lg:max-w-2xl">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/60">
                  Zmień miasto
                </p>
                <div className="rounded-2xl bg-white p-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)] ring-1 ring-white/80">
                  <Logic slugCity={city.name} variant="inline" baseRoute={baseRoute} />
                </div>
              </div>

              <p className="mt-6 text-xs text-white/50 font-poppins">
                Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}
              </p>
            </div>

            {/* Lead form */}
            <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none lg:justify-self-end">
              <div className="w-full max-w-[440px] lg:ml-auto">
                <CityLeadForm
                  citySlug={city.id}
                  cityName={city.name}
                  serviceType={serviceType}
                  variant="glass"
                  isCourse={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
