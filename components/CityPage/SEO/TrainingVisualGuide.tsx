import Image from "next/image";
import Link from "next/link";
import type { ICity } from "@/types";
import type { PolishCityForms } from "@/utils/polishCityGrammar";

type ServiceType = "manicure" | "pedicure";

type Props = {
  forms: PolishCityForms;
  nearbyCities: ICity[];
  basePath: "kursy-stylizacji-paznokci" | "kursy-pedicure";
  serviceType: ServiceType;
};

const HOME_ASSETS = {
  phone: "/home/1.png",
  calendar: "/home/2.png",
  nailsIllustration: "/home/3.png",
  marshmellow: "/home/marshmellow.webp",
  sticker: "/home/6.webp",
  feature1: "/home/feature1.jpg",
  feature2: "/home/feature2.jpg",
  feature3: "/home/feature3.jpg",
  service1: "/home/service1.jpg",
  service2: "/home/service2.jpg",
  service3: "/home/service3.jpg",
  woman: "/home/woman.png",
} as const;

function getGuideContent(serviceType: ServiceType, forms: PolishCityForms) {
  const { nominative, locative } = forms;

  if (serviceType === "pedicure") {
    return {
      headline: `Kurs pedicure ${nominative} – ceny, szkolenia i terminy 2026`,
      intro:
        `Szukasz profesjonalnego kursu pedicure w ${locative}? Porównaj programy, ceny i podejście instruktorek, a potem wybierz szkolenie dopasowane do Twojego poziomu oraz planu rozwoju.`,
      includesTitle: `💅 Kurs pedicure w ${locative} – co obejmuje?`,
      includesLead: "Na kursach nauczysz się:",
      includesItems: [
        "opracowania stóp i płytki paznokcia",
        "wykonywania pedicure klasycznego i hybrydowego",
        "pracy frezarką i bezpiecznego tempa zabiegu",
        "doboru produktów pielęgnacyjnych i wykończenia stylizacji",
        "pracy z klientką i budowania powracającej bazy usług",
      ],
      includesSummary:
        `Szkolenia są dostępne zarówno dla początkujących, jak i osób chcących uporządkować technikę. Szukając kursu pedicure w ${locative} oraz hasła szkolenie pedicure ${nominative}, warto porównać programy u kilku instruktorek.`,
      popularTitle: `📍 Najpopularniejsze kursy pedicure ${nominative}`,
      popularItems: [
        `Kurs pedicure klasyczny ${nominative} – podstawy pracy i pierwszy pełny zabieg`,
        `Kurs pedicure hybrydowy ${nominative} – trwałość, estetyka i praca krok po kroku`,
        `Kurs frezarki ${nominative} – bezpieczeństwo, płynność i większa pewność pracy`,
        `Kurs pedicure pielęgnacyjnego ${nominative} – peeling, masaż i usługi premium`,
      ],
      popularSummary:
        `Dobierz kurs pedicure w ${locative} pod swój poziom – od pierwszych zabiegów po bardziej dochodowe usługi premium.`,
      pricingTitle: `💰 Ile kosztuje kurs pedicure w ${locative}?`,
      pricingItems: [
        "kurs podstawowy: 1000 – 1500 zł",
        "kurs rozszerzony: 1500 – 2200 zł",
        "szkolenia specjalistyczne: 1800 – 2800 zł",
      ],
      pricingSummary:
        `Cena zależy od zakresu, liczby dni i ilości praktyki. Frazy typu kurs pedicure ${nominative} cena warto zestawić z realnym programem szkolenia.`,
      earningsTitle: "💸 Ile można zarobić po kursie pedicure?",
      earningsItems: [
        "początkująca: 2500 – 4500 zł / miesiąc",
        "średnio zaawansowana: 4500 – 7000 zł / miesiąc",
        "ekspertka / instruktorka: 7000 – 15000 zł / miesiąc",
      ],
      earningsSummary:
        "Zwrot z inwestycji w kurs często następuje już po 1–2 miesiącach pracy, szczególnie przy regularnych klientkach i usługach dodatkowych.",
      worthTitle: "📈 Czy warto zrobić kurs pedicure w 2026?",
      worthIntro:
        `Tak — branża beauty dynamicznie rośnie, a profesjonalny pedicure jest coraz częściej traktowany jako stała usługa pielęgnacyjna, także w ${locative}.`,
      worthItems: [
        "rosnące zapotrzebowanie na pedicure klasyczny i hybrydowy",
        "szybki zwrot inwestycji",
        "możliwość pracy w salonie, mobilnie lub we własnym studio",
        "łatwe rozszerzenie oferty o usługi premium i pielęgnację",
      ],
      worthSummary:
        `Jeśli rozważasz kurs pedicure dla początkujących w ${locative}, zacznij od programu podstawowego i stopniowo dokładaj kolejne specjalizacje.`,
      nearbyTitle: "🔗 Kurs pedicure w okolicy",
      nearbyLead:
        "Sprawdź też szkolenia w sąsiednich miastach i porównaj dostępne instruktorki:",
      linkLabel: (city: ICity) => `Kurs pedicure ${city.name}`,
    };
  }

  return {
    headline: `Kurs stylizacji paznokci ${nominative} – ceny, szkolenia i terminy 2026`,
    intro:
      `Szukasz profesjonalnego kursu stylizacji paznokci w ${locative}? Sprawdź aktualne szkolenia manicure i zdobień paznokci prowadzone przez doświadczone instruktorki. Dowiedz się, ile kosztuje kurs, co obejmuje program oraz jak szybko możesz zacząć zarabiać jako stylistka paznokci.`,
    includesTitle: `💅 Kurs stylizacji paznokci w ${locative} – co obejmuje?`,
    includesLead: "Na kursach nauczysz się:",
    includesItems: [
      "przygotowania płytki paznokcia",
      "wykonywania manicure klasycznego i hybrydowego",
      "przedłużania paznokci (żel, akryl)",
      "zdobień i aktualnych trendów",
      "pracy z klientką i budowania portfolio",
    ],
    includesSummary:
      `Szkolenia są dostępne zarówno dla początkujących, jak i osób chcących podnieść kwalifikacje. Szukając kursu stylizacji paznokci w ${locative} oraz hasła szkolenie manicure ${nominative}, warto porównać programy u kilku instruktorek.`,
    popularTitle: `📍 Najpopularniejsze kursy manicure ${nominative}`,
    popularItems: [
      `Kurs manicure klasyczny ${nominative} – podstawy i pierwsze stylizacje`,
      `Kurs manicure hybrydowy ${nominative} – aplikacja i trwałość`,
      `Kurs przedłużania paznokci ${nominative} – żel i formy`,
      `Kurs zdobień paznokci ${nominative} – trendy i nail art`,
    ],
    popularSummary:
      `Dobierz kurs manicure hybrydowego w ${locative} pod swój poziom – od pierwszych kroków po zaawansowane stylizacje. W treści często pojawia się też wyszukiwanie kurs manicure hybrydowy ${nominative}.`,
    pricingTitle: `💰 Ile kosztuje kurs stylizacji paznokci w ${locative}?`,
    pricingItems: [
      "kurs podstawowy: 800 – 1500 zł",
      "kurs rozszerzony: 1500 – 2500 zł",
      "szkolenia specjalistyczne: 500 – 1200 zł",
    ],
    pricingSummary:
      `Cena zależy od zakresu, liczby dni i renomy instruktorki. Frazy typu kurs paznokci ${nominative} cena warto zestawić z realnym zakresem materiału i liczbą godzin praktyki.`,
    earningsTitle: "💸 Ile można zarobić po kursie manicure?",
    earningsItems: [
      "początkująca: 2000 – 4000 zł / miesiąc",
      "średnio zaawansowana: 4000 – 6000 zł / miesiąc",
      "ekspertka: 6000 – 12000 zł / miesiąc",
    ],
    earningsSummary:
      "Zwrot z inwestycji w kurs często następuje już po 1–2 miesiącach pracy.",
    worthTitle: "📈 Czy warto zrobić kurs stylizacji paznokci w 2026?",
    worthIntro:
      `Tak — branża beauty w Polsce dynamicznie rośnie. Coraz więcej klientek regularnie korzysta z manicure hybrydowego i żelowego, także w ${locative}.`,
    worthItems: [
      "niskie koszty wejścia",
      "szybki zwrot inwestycji",
      "możliwość pracy mobilnej lub w salonie",
      "możliwość otwarcia własnego biznesu",
    ],
    worthSummary:
      `Jeśli rozważasz kurs paznokci dla początkujących w ${locative}, zacznij od programu podstawowego i stopniowo dokładaj specjalizacje.`,
    nearbyTitle: "🔗 Kurs stylizacji paznokci w okolicy",
    nearbyLead:
      "Sprawdź też szkolenia w sąsiednich miastach i porównaj programy u instruktorek:",
    linkLabel: (city: ICity) => `Kurs stylizacji paznokci ${city.name}`,
  };
}

export default function TrainingVisualGuide({
  forms,
  nearbyCities,
  basePath,
  serviceType,
}: Props) {
  const content = getGuideContent(serviceType, forms);
  const internalLinks = nearbyCities.slice(0, 8);

  return (
    <article className="relative overflow-hidden bg-gradient-to-b from-white via-[#faf7ff] to-white px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(196,181,253,0.35),transparent_65%)]" />

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-10 text-center sm:mb-12">
          <span className="inline-flex items-center rounded-full border border-violet-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700 shadow-sm">
            Visual Course Guide
          </span>
          <h2 className="mt-4 font-baloo text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl lg:text-5xl">
            {content.headline}
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-neutral-600 font-poppins sm:text-lg">
            {content.intro}
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-slate-950 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.6)]">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/55 to-transparent z-10" />
            <Image
              src={HOME_ASSETS.service3}
              alt={`Kurs ${serviceType === "manicure" ? "stylizacji paznokci" : "pedicure"} ${forms.nominative}`}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 60vw, 100vw"
            />
            <Image
              src={HOME_ASSETS.woman}
              alt=""
              width={340}
              height={340}
              className="pointer-events-none absolute bottom-0 right-0 z-20 hidden w-[240px] opacity-80 lg:block xl:w-[320px]"
              aria-hidden
            />
            <div className="relative z-20 flex min-h-[420px] flex-col justify-end p-6 sm:p-8 lg:p-10">
              <div className="max-w-2xl rounded-[1.75rem] border border-white/15 bg-white/10 p-6 backdrop-blur-md">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink-200">
                  Program 2026
                </p>
                <h3 className="mt-3 font-baloo text-3xl font-bold leading-tight text-white sm:text-4xl">
                  {content.includesTitle}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/85 font-poppins sm:text-base">
                  {content.includesSummary}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <div className="relative overflow-hidden rounded-[2rem] border border-violet-200 bg-gradient-to-br from-white to-violet-50 p-6 shadow-[0_18px_60px_-34px_rgba(124,58,237,0.45)]">
              <Image
                src={HOME_ASSETS.phone}
                alt=""
                width={150}
                height={150}
                className="pointer-events-none absolute -right-5 -top-3 w-28 opacity-95 sm:w-32"
                aria-hidden
              />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">
                Co obejmuje
              </p>
              <ul className="mt-5 space-y-3">
                {content.includesItems.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-white bg-white/90 px-4 py-3 text-sm leading-6 text-neutral-700 shadow-sm font-poppins"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-4 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.28)]">
              <div className="grid grid-cols-[1.05fr_0.95fr] gap-4">
                <div className="relative min-h-[220px] overflow-hidden rounded-[1.5rem]">
                  <Image
                    src={HOME_ASSETS.service2}
                    alt="Stylizacja paznokci na zbliżeniu"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 20vw, 45vw"
                  />
                </div>
                <div className="grid gap-4">
                  <div className="relative min-h-[103px] overflow-hidden rounded-[1.5rem] bg-[#f7f3ff]">
                    <Image
                      src={HOME_ASSETS.feature2}
                      alt="Produkty do manicure"
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 12vw, 30vw"
                    />
                  </div>
                  <div className="relative min-h-[103px] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-pink-50 to-violet-100">
                    <Image
                      src={HOME_ASSETS.calendar}
                      alt=""
                      width={180}
                      height={180}
                      className="mx-auto mt-2 w-28 sm:w-32"
                      aria-hidden
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-4 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.28)]">
            <div className="relative min-h-[400px] overflow-hidden rounded-[1.6rem]">
              <Image
                src={HOME_ASSETS.service1}
                alt="Efektowna stylizacja paznokci"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 35vw, 100vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent p-6">
                <h3 className="font-baloo text-3xl font-bold text-white">
                  {content.popularTitle}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-7 text-white/85 font-poppins">
                  {content.popularSummary}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {content.popularItems.map((item, index) => (
              <article
                key={item}
                className="relative overflow-hidden rounded-[2rem] border border-violet-100 bg-gradient-to-br from-white to-violet-50 p-6 shadow-[0_18px_60px_-38px_rgba(124,58,237,0.35)]"
              >
                {index === 0 ? (
                  <Image
                    src={HOME_ASSETS.nailsIllustration}
                    alt=""
                    width={110}
                    height={110}
                    className="pointer-events-none absolute right-3 top-3 w-20 opacity-80"
                    aria-hidden
                  />
                ) : null}
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-sm font-bold text-white">
                  0{index + 1}
                </span>
                <p className="mt-5 pr-10 font-baloo text-2xl font-bold leading-tight text-neutral-900">
                  {item}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[1fr_1fr_0.82fr]">
          <article className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-[0_18px_60px_-38px_rgba(16,185,129,0.32)] sm:p-8">
            <Image
              src={HOME_ASSETS.sticker}
              alt=""
              width={130}
              height={130}
              className="pointer-events-none absolute right-3 top-3 w-20 opacity-95"
              aria-hidden
            />
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Cennik
            </p>
            <h3 className="mt-3 font-baloo text-3xl font-bold leading-tight text-neutral-900">
              {content.pricingTitle}
            </h3>
            <div className="mt-6 space-y-3">
              {content.pricingItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white bg-white/90 px-4 py-4 font-poppins text-sm leading-6 text-neutral-700 shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-5 font-poppins text-sm leading-7 text-neutral-600">
              {content.pricingSummary}
            </p>
          </article>

          <article className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-6 shadow-[0_18px_60px_-38px_rgba(59,130,246,0.32)] sm:p-8">
            <Image
              src={HOME_ASSETS.marshmellow}
              alt=""
              width={140}
              height={140}
              className="pointer-events-none absolute right-2 top-2 w-20 opacity-90"
              aria-hidden
            />
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Zarobki
            </p>
            <h3 className="mt-3 font-baloo text-3xl font-bold leading-tight text-neutral-900">
              {content.earningsTitle}
            </h3>
            <div className="mt-6 grid gap-3">
              {content.earningsItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white bg-white/90 px-4 py-4 font-poppins text-sm leading-6 text-neutral-700 shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-5 font-poppins text-sm leading-7 text-neutral-600">
              {content.earningsSummary}
            </p>
          </article>

          <aside className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-4 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.28)]">
            <div className="relative min-h-[360px] overflow-hidden rounded-[1.6rem] bg-slate-100">
              <Image
                src={HOME_ASSETS.feature1}
                alt="Lampa UV podczas stylizacji"
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 20vw, 100vw"
              />
            </div>
          </aside>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-4 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.28)]">
            <div className="relative min-h-[420px] overflow-hidden rounded-[1.6rem]">
              <Image
                src={HOME_ASSETS.feature3}
                alt="Budowanie marki stylistki paznokci online"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 35vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-200">
                  Rozwój
                </p>
                <h3 className="mt-2 font-baloo text-3xl font-bold text-white sm:text-4xl">
                  {content.worthTitle}
                </h3>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-pink-100 bg-gradient-to-br from-white to-pink-50 p-6 shadow-[0_18px_60px_-38px_rgba(236,72,153,0.3)] sm:p-8">
            <Image
              src={HOME_ASSETS.service2}
              alt=""
              width={160}
              height={160}
              className="pointer-events-none absolute -right-4 bottom-0 hidden w-32 rounded-tl-[2rem] rounded-br-[2rem] opacity-25 lg:block"
              aria-hidden
            />
            <p className="font-poppins text-base leading-7 text-neutral-700">
              {content.worthIntro}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {content.worthItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white bg-white/90 px-4 py-4 font-poppins text-sm leading-6 text-neutral-700 shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-5 max-w-2xl font-poppins text-sm leading-7 text-neutral-600">
              {content.worthSummary}
            </p>
          </div>
        </section>

        {internalLinks.length > 0 ? (
          <section className="mt-10 overflow-hidden rounded-[2.25rem] border border-neutral-200 bg-slate-950 px-6 py-8 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.72)] sm:px-8 sm:py-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative">
                <Image
                  src={HOME_ASSETS.nailsIllustration}
                  alt=""
                  width={150}
                  height={150}
                  className="pointer-events-none absolute -right-3 -top-2 hidden w-28 opacity-90 lg:block"
                  aria-hidden
                />
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200">
                  Linkowanie wewnętrzne
                </p>
                <h3 className="mt-3 max-w-2xl font-baloo text-3xl font-bold leading-tight text-white sm:text-4xl">
                  {content.nearbyTitle}
                </h3>
                <p className="mt-4 max-w-2xl font-poppins text-base leading-7 text-slate-200/90">
                  {content.nearbyLead}
                </p>
                <div className="relative mt-6 hidden min-h-[220px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5 lg:block">
                  <Image
                    src={HOME_ASSETS.service1}
                    alt="Kursy paznokci w pobliskich miastach"
                    fill
                    className="object-cover opacity-85"
                    sizes="(min-width: 1024px) 30vw, 100vw"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {internalLinks.map((city) => (
                  <Link
                    key={city.id}
                    href={`/${basePath}/${city.id}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-poppins text-sm leading-6 text-white transition hover:border-violet-300/60 hover:bg-white/10"
                  >
                    <span className="block font-semibold text-violet-200 transition group-hover:text-white">
                      {content.linkLabel(city)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
