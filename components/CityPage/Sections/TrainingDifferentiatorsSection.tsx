import type { PolishCityForms } from "@/utils/polishCityGrammar";
import {
  FaCalendarAlt,
  FaChartLine,
  FaCheck,
  FaGift,
  FaGraduationCap,
  FaUser,
} from "react-icons/fa";

type TrainingDifferentiatorsSectionProps = {
  forms: PolishCityForms;
  serviceType: "manicure" | "pedicure";
};

const SHARED_HIGHLIGHTS = [
  {
    title: "Indywidualny tok nauki",
    description:
      "Nie działamy schematami. Zakres, tempo i harmonogram dobieramy do Twojego poziomu, celu i czasu.",
    bullets: [
      "uczysz się w tempie dopasowanym do Ciebie",
      "program może zaczynać się od podstaw albo doszlifować technikę",
      "masz 100% uwagi instruktorki",
    ],
    icon: FaUser,
    accent: "from-blue-500/15 to-cyan-500/20",
    iconClass: "text-blue-600",
  },
  {
    title: "Praktyka na modelkach",
    description:
      "Realna praca najlepiej przygotowuje do obsługi klientek i pozwala szybciej nabrać pewności.",
    bullets: [
      "uczysz się na realnych przypadkach",
      "poznajesz różne typy płytki lub skóry stóp",
      "po kursie łatwiej reagujesz w praktyce, nie tylko w teorii",
    ],
    icon: FaGraduationCap,
    accent: "from-violet-500/15 to-fuchsia-500/20",
    iconClass: "text-violet-600",
  },
  {
    title: "Wsparcie po kursie",
    description:
      "Po szkoleniu nadal możesz do nas wracać po pomoc w produktach, technice i rozwoju marki.",
    bullets: [
      "dobór produktów i materiałów",
      "konsultacje techniczne po szkoleniu",
      "pomoc w social mediach i treściach dla klientek",
    ],
    icon: FaChartLine,
    accent: "from-emerald-500/15 to-teal-500/20",
    iconClass: "text-emerald-600",
  },
  {
    title: "Dodatkowy dzień doszkolenia",
    description:
      "W kursach kompleksowych dostajesz dodatkowy dzień na utrwalenie techniki i poprawę błędów.",
    bullets: [
      "czas na dopracowanie detali",
      "bez presji i bez porównań z grupą",
      "bez konieczności dokupowania kolejnego szkolenia od razu",
    ],
    icon: FaGift,
    accent: "from-amber-500/15 to-orange-500/20",
    iconClass: "text-amber-600",
  },
];

const MANICURE_TRAININGS = [
  {
    title: "Frezarka - szkolenie podstawowe",
    description:
      "Dla osób, które chcą pracować pewnie, szybciej i bez stresu już od pierwszych stylizacji.",
  },
  {
    title: "Manicure hybrydowy z nadbudową",
    description:
      "Praca produktem bazowym, równa linia światła i technika lakierowania pod skórki.",
  },
  {
    title: "Żel / Akryl / Flexy Gel - od podstaw",
    description:
      "Dobierasz metodę do siebie i uczysz się przedłużania krok po kroku z naciskiem na praktykę.",
  },
  {
    title: "Manicure hybrydowy - szkolenie podstawowe",
    description:
      "Idealne na start, gdy chcesz wejść do branży bez presji i z jasnym planem nauki.",
  },
];

const PEDICURE_TRAININGS = [
  {
    title: "Frezarka i opracowanie stóp - podstawy",
    description:
      "Bezpieczna praca frezarką, porządek w technice i większa swoboda podczas zabiegu.",
  },
  {
    title: "Pedicure hybrydowy krok po kroku",
    description:
      "Przygotowanie, opracowanie i estetyczne wykończenie stylizacji z naciskiem na trwałość.",
  },
  {
    title: "Pedicure kosmetyczny od podstaw",
    description:
      "Dobra opcja na start lub uporządkowanie podstaw pracy z klientką i zabiegiem pielęgnacyjnym.",
  },
  {
    title: "Pedicure pielęgnacyjny i premium",
    description:
      "Rozszerzenie usług o peeling, masaż i elementy, które podnoszą wartość zabiegu.",
  },
];

export default function TrainingDifferentiatorsSection({
  forms,
  serviceType,
}: TrainingDifferentiatorsSectionProps) {
  const trainings =
    serviceType === "manicure" ? MANICURE_TRAININGS : PEDICURE_TRAININGS;
  const courseLabel =
    serviceType === "manicure"
      ? "kurs stylizacji paznokci"
      : "kurs pedicure";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-violet-50/40 to-white px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
      <div className="absolute left-0 top-12 h-48 w-48 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-violet-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-violet-700 shadow-sm">
            Szkolenie 1:1
          </span>
          <h2 className="mt-4 font-baloo text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl lg:text-5xl">
            My robimy to inaczej
          </h2>
          <p className="mt-4 font-poppins text-base leading-relaxed text-neutral-600 sm:text-lg">
            Jeśli interesuje Cię {courseLabel} w {forms.locative}, stawiamy na
            naukę dopasowaną do Ciebie, praktykę na realnych modelkach i
            wsparcie także po zakończeniu szkolenia.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {SHARED_HIGHLIGHTS.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className={`rounded-3xl border border-white/80 bg-gradient-to-br ${item.accent} p-[1px] shadow-[0_20px_60px_-28px_rgba(15,23,42,0.28)]`}
              >
                <div className="h-full rounded-3xl bg-white/95 p-6 backdrop-blur sm:p-7">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ${item.iconClass}`}
                  >
                    <Icon className="text-xl" />
                  </div>
                  <h3 className="mt-5 font-baloo text-2xl font-bold text-neutral-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 font-poppins text-sm leading-7 text-neutral-600">
                    {item.description}
                  </p>
                  <ul className="mt-5 space-y-3">
                    {item.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-3 text-sm font-poppins leading-6 text-neutral-700"
                      >
                        <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] text-emerald-600">
                          <FaCheck />
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_70px_-30px_rgba(15,23,42,0.65)] sm:p-10">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
              Dlaczego indywidualnie
            </span>
            <h3 className="text-yellow-300 mt-4 font-baloo text-3xl font-bold leading-tight sm:text-4xl">
              Bo ta forma po prostu daje szybsze efekty
            </h3>
            <p className="mt-4 max-w-2xl font-poppins text-base leading-relaxed text-slate-200/90">
              Od lat pracujemy indywidualnie, bo wtedy możemy realnie dopasować
              program do poziomu, celu i tempa pracy. Bez stresu, bez porównań i
              bez presji grupy.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "100% uwagi skupione na Tobie",
                "tempo dopasowane do Twojego poziomu",
                "szybsze postępy i lepsze utrwalenie techniki",
                "więcej swobody i mniej stresu na starcie",
              ].map((bullet) => (
                <div
                  key={bullet}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 font-poppins text-sm text-slate-100"
                >
                  {bullet}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-violet-200 bg-white p-8 shadow-[0_20px_60px_-28px_rgba(124,58,237,0.28)] sm:p-10">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <FaCalendarAlt className="text-xl" />
              </div>
              <h3 className="font-baloo text-2xl font-bold text-neutral-900 sm:text-3xl">
                Organizacja bez chaosu
              </h3>
            </div>

            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Nie masz modelki?",
                  description:
                    "Możemy pomóc w organizacji modelki na szkolenie - wystarczy dać znać wcześniej.",
                },
                {
                  title: "Elastyczne godziny",
                  description:
                    "Dopasowujemy grafik do pracy, dzieci i innych obowiązków. Także wieczory i weekendy.",
                },
                {
                  title: "Pomoc w dofinansowaniu",
                  description:
                    "Współpracujemy z Urzędami Pracy i pomagamy przejść przez dokumenty oraz formalności.",
                },
                {
                  title: "Nie wiesz, od czego zacząć?",
                  description:
                    "Pomożemy dobrać metodę i zakres szkolenia tak, żeby miał sens dla Ciebie i lokalnego rynku.",
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-violet-600 shadow-sm">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h4 className="font-baloo text-xl font-bold text-neutral-900">
                        {item.title}
                      </h4>
                      <p className="mt-1 font-poppins text-sm leading-6 text-neutral-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-[2rem] border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-violet-50 p-8 shadow-[0_20px_60px_-32px_rgba(37,99,235,0.28)] sm:p-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              Szkolenia
            </span>
            <h3 className="mt-4 font-baloo text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">
              Zakres dobieramy do celu, a nie do gotowego schematu
            </h3>
            <p className="mt-4 font-poppins text-base leading-relaxed text-neutral-600">
              Najczęściej wybierane szkolenia łączą solidne podstawy, dużo
              praktyki i jasny plan wdrożenia do pracy z klientkami po kursie.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {trainings.map((training) => (
              <article
                key={training.title}
                className="rounded-3xl border border-white bg-white/90 p-6 shadow-sm"
              >
                <h4 className="font-baloo text-2xl font-bold leading-tight text-neutral-900">
                  {training.title}
                </h4>
                <p className="mt-3 font-poppins text-sm leading-7 text-neutral-600">
                  {training.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
