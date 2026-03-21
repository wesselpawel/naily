import NotFound from "@/app/not-found";
import JoinNowButton from "@/components/AdCard/JoinNowButton";
import Link from "next/link";
import { getCityUsers } from "@/utils/getCityUsers";
import { ICity } from "@/types";
import { getSingleCity } from "@/utils/getSingleCity";
import { getCities } from "@/utils/getCities";
import { Viewport } from "next";
import Image from "next/image";
import Script from "next/script";
import RecentPosts from "@/components/Blog/RecentPosts";
import FAQ, { type FaqItem } from "@/components/FAQ/FAQ";
import {
  FaMapMarkerAlt,
  FaGem,
  FaStar,
  FaClock,
  FaPhone,
  FaArrowRight,
  FaTags,
} from "react-icons/fa";
import { MdSpa } from "react-icons/md";
import { FaCheck, FaUserNinja } from "react-icons/fa6";
import { IService } from "@/types";
import slug1 from "../../../public/slug/slug1.png";
import slug2 from "../../../public/slug/slug2.png";
import slug3 from "../../../public/slug/slug3.png";
import CityHero from "@/components/CityPage/Sections/CityHero";
import UserSliderWrapper from "@/components/CityPage/UserSliderWrapper";
import UserCard from "@/components/CityPage/UserCard";
import PricingTable, { type PricingItem } from "@/components/CityPage/PricingTable";
import { getUserById, getUsers, db } from "@/firebase";
import { User } from "@/types";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Metadata } from "next";

// Enable ISR: Revalidate every hour to keep salon listings fresh while maintaining fast static pages
// Pages are generated on-demand (on first request) and then cached - no need to pre-generate all at build time
export const revalidate = 3600; // 1 hour

// Generate JSON-LD structured data for SEO
function generateStructuredData(city: ICity, serviceType: "manicure" | "pedicure") {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://naily.pl";
  const serviceName = serviceType === "manicure" ? "Manicure" : "Pedicure";
  
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${baseUrl}/${serviceType}/${city.id}#webpage`,
        "url": `${baseUrl}/${serviceType}/${city.id}`,
        "name": `Pedicure ${city.name} - Cennik Katalog`,
        "description": `Najlepsze stylistki i salony pedicure ${city.name}. Pełny cennik, katalog usług i opinie.`,
        "inLanguage": "pl-PL",
        "isPartOf": {
          "@id": `${baseUrl}#website`
        },
        "breadcrumb": {
          "@id": `${baseUrl}/${serviceType}/${city.id}#breadcrumb`
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/${serviceType}/${city.id}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Strona główna",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": `${serviceName} ${city.name}`,
            "item": `${baseUrl}/${serviceType}/${city.id}`
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/${serviceType}/${city.id}#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Jak zarezerwować wizytę w tym mieście?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Rezerwacja wizyty na pedicure w naszym mieście jest bardzo prosta. Najpierw przejrzyj listę dostępnych specjalistek i salonów na tej stronie. Każdy profil zawiera szczegółowe informacje o stylistce, jej doświadczeniu, portfolio prac oraz dostępnych terminach. Możesz zarezerwować wizytę bezpośrednio przez platformę online, wybierając dogodny dla Ciebie termin z kalendarza dostępności. Po wyborze terminu otrzymasz potwierdzenie rezerwacji na podany adres email lub numer telefonu. Większość specjalistek oferuje również możliwość rezerwacji telefonicznej lub przez wiadomość prywatną. Pamiętaj, że niektóre popularne stylistki mogą mieć dłuższe terminy oczekiwania, dlatego warto rezerwować z wyprzedzeniem. Szczególnie w sezonie letnim, gdy zapotrzebowanie na usługi pedicure jest większe, warto planować wizyty z kilkutygodniowym wyprzedzeniem."
            }
          },
          {
            "@type": "Question",
            "name": "Czy ceny różnią się między specjalistkami?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Tak, ceny usług pedicure różnią się między specjalistkami i zależą od wielu czynników. Każda stylistka ustala własny cennik, który może być uzależniony od jej doświadczenia, lokalizacji salonu, używanego sprzętu i produktów, a także zakresu oferowanych usług. Podstawowy pedicure klasyczny może kosztować od 50 do 90 złotych, pedicure hybrydowy od 70 do 130 złotych, a pedicure z dodatkowymi zabiegami pielęgnacyjnymi (np. peeling, masaż, parafina) od 100 do 180 złotych. Ceny mogą również różnić się w zależności od tego, czy wybierasz usługę w salonie czy wizyta odbywa się w domu klientki. Aktualny, szczegółowy cennik znajdziesz na profilu każdej specjalistki, gdzie często dostępne są również informacje o pakietach promocyjnych, zniżkach dla stałych klientek oraz cenach dodatkowych usług takich jak zdobienia, przedłużanie paznokci czy zabiegi pielęgnacyjne stóp."
            }
          },
          {
            "@type": "Question",
            "name": "Jak sprawdzić lokalizację salonu?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Lokalizacja każdego salonu i stylistki jest szczegółowo opisana na jej profilu. Znajdziesz tam pełny adres wraz z kodem pocztowym, a także interaktywną mapę Google Maps, która ułatwi Ci dotarcie na miejsce. Większość profili zawiera również informacje o dostępności komunikacji miejskiej, możliwości parkowania w pobliżu salonu oraz wskazówki dojazdu dla klientek przyjeżdżających samochodem. Niektóre stylistki oferują również usługi mobilne, przyjeżdżając do klientek do domu, co jest szczególnie wygodne w przypadku zabiegów pedicure. Jeśli masz pytania dotyczące lokalizacji lub potrzebujesz dodatkowych wskazówek dojazdu, możesz skontaktować się bezpośrednio ze stylistką przez telefon lub wiadomość prywatną. Warto sprawdzić lokalizację przed rezerwacją, aby upewnić się, że salon jest dla Ciebie dogodnie położony i łatwo dostępny."
            }
          },
          {
            "@type": "Question",
            "name": "Czy mogę zmienić termin wizyty?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Tak, w większości przypadków możesz zmienić termin wizyty, jednak zasady dotyczące zmian i odwołań różnią się w zależności od polityki danej specjalistki. Szczegółowe informacje o możliwości zmiany terminu, wymaganym czasie wyprzedzenia oraz ewentualnych opłatach za odwołanie znajdziesz w potwierdzeniu rezerwacji oraz na profilu stylistki. Zazwyczaj zmiana terminu jest możliwa bez dodatkowych opłat, jeśli poinformujesz stylistkę z odpowiednim wyprzedzeniem (zwykle minimum 24-48 godzin przed wizytą). Odwołanie wizyty w ostatniej chwili może wiązać się z koniecznością uiszczenia częściowej opłaty lub pełnej kwoty za usługę, zgodnie z polityką salonu. W przypadku nagłych sytuacji losowych, większość stylistek jest elastyczna i stara się znaleźć rozwiązanie korzystne dla obu stron. Najlepiej skontaktować się bezpośrednio ze stylistką, aby omówić możliwość zmiany terminu. Pamiętaj, że wczesne poinformowanie o potrzebie zmiany terminu zwiększa szanse na znalezienie dogodnego rozwiązania."
            }
          }
        ]
      },
      {
        "@type": "ItemList",
        "@id": `${baseUrl}/${serviceType}/${city.id}#itemlist`,
        "name": `Pedicure ${city.name} - Cennik Katalog`,
        "description": `Lista najlepszych stylistek i salonów pedicure w ${city.name}`,
        "numberOfItems": 10,
        "itemListElement": {
          "@type": "ListItem",
          "position": 1,
          "name": `Najlepsze salony pedicure w ${city.name}`
        }
      }
    ]
  };
}

async function fetchUserBySlugOrUid(slug: string): Promise<User | null> {
  try {
    const all = (await getUsers()) as User[];
    const bySlug = all.find(
      (u) => (u as User & { userSlugUrl?: string })?.userSlugUrl === slug
    );
    if (bySlug) return bySlug as User;
    // fallback to uid
    const byUid = (await getUserById(slug)) as User | null;
    return byUid || null;
  } catch {
    return null;
  }
}

const pedicurePricing: PricingItem[] = [
  {
    id: "pedicure-classic",
    name: "Pedicure klasyczny (tradycyjny lakier)",
    minPrice: 160,
    maxPrice: 160,
    description: "Podstawowy pedicure z tradycyjnym lakierem, pielęgnacją stóp, kształtowaniem paznokci i usuwaniem zrogowaciałego naskórka. Idealny dla osób, które preferują klasyczne rozwiązania.",
  },
  {
    id: "pedicure-hybrid",
    name: "Pedicure hybrydowy",
    minPrice: 160,
    maxPrice: 160,
    description: "Trwały pedicure hybrydowy z lakierem UV/LED, utrzymujący się nawet do 4 tygodni. Idealny dla osób, które chcą długotrwałej ochrony i pięknego wyglądu paznokci u stóp.",
  },
  {
    id: "pedicure-spa",
    name: "Pedicure SPA (z peelingiem i maską)",
    minPrice: 210,
    maxPrice: 210,
    description: "Luksusowy pedicure z pełną pielęgnacją stóp, peelingiem, maseczką nawilżającą i relaksującym masażem. Kompleksowa regeneracja skóry stóp i paznokci z elementami aromaterapii.",
  },
  {
    id: "pedicure-medical",
    name: "Pedicure leczniczy",
    minPrice: 160,
    maxPrice: 160,
    description: "Specjalistyczny pedicure leczniczy dla osób z problemami skórnymi stóp, wrastającymi paznokciami lub innymi dolegliwościami. Wykonywany z użyciem profesjonalnych narzędzi i preparatów medycznych.",
  },
  {
    id: "pedicure-male",
    name: "Pedicure męski",
    minPrice: 25,
    maxPrice: 25,
    description: "Profesjonalna pielęgnacja stóp i paznokci dla mężczyzn, obejmująca czyszczenie, kształtowanie i polerowanie paznokci oraz pielęgnację skóry stóp. Idealny dla aktywnych mężczyzn.",
  },
  {
    id: "paraffin-treatment",
    name: "Zabieg parafinowy na stopy",
    minPrice: 140,
    maxPrice: 140,
    description: "Relaksujący zabieg parafinowy na stopy, który głęboko nawilża i zmiękcza skórę. Idealny dla suchych, zrogowaciałych stóp. Zabieg poprawia elastyczność skóry i zapewnia długotrwałe nawilżenie.",
  },
  {
    id: "heel-regeneration",
    name: "Zabieg regeneracyjny na pękające pięty",
    minPrice: 210,
    maxPrice: 210,
    description: "Specjalistyczny zabieg regeneracyjny dla pękających pięt z użyciem profesjonalnych preparatów i narzędzi. Intensywna kuracja przywracająca zdrowy wygląd i funkcjonalność skóry pięt.",
  },
];

const preVisitFaq: FaqItem[] = [
  {
    id: "prep-before-visit",
    question: "Jak przygotować się do wizyty na pedicure?",
    answer:
      "Przed wizytą na pedicure warto umyć stopy, ale nie musisz ich specjalnie przygotowywać - stylistka zajmie się pełną pielęgnacją. Jeśli masz grzybicę stóp lub inne problemy skórne, poinformuj o tym stylistkę przed rozpoczęciem zabiegu. Warto przemyśleć, jaki kolor lub styl paznokci Cię interesuje - możesz przynieść zdjęcia inspiracji. Zalecamy założenie wygodnych, otwartych butów na wizytę, aby lakier mógł wyschnąć. Jeśli to możliwe, unikaj noszenia skarpetek bezpośrednio po zabiegu.",
  },
  {
    id: "how-long-pedicure",
    question: "Ile trwa wizyta na pedicure?",
    answer:
      "Czas trwania wizyty zależy od wybranego typu pedicure. Podstawowy pedicure klasyczny trwa zazwyczaj około 45-60 minut, pedicure hybrydowy około 60-90 minut, a pedicure z dodatkowymi zabiegami pielęgnacyjnymi (peeling, masaż, parafina) może zająć nawet 90-120 minut. Czas może się również różnić w zależności od stylistki i zakresu usługi. Warto zarezerwować sobie odpowiednią ilość czasu i cieszyć się relaksującym zabiegiem.",
  },
  {
    id: "what-to-bring-pedicure",
    question: "Czy muszę coś przynieść na wizytę?",
    answer:
      "Nie musisz przynosić niczego specjalnego na wizytę - stylistka ma wszystkie niezbędne narzędzia i produkty. Możesz jednak przynieść zdjęcia inspiracji, jeśli masz konkretny pomysł na wygląd paznokci. Jeśli masz własne lakiery, które chcesz użyć, możesz je przynieść, ale większość salonów ma szeroki wybór kolorów. Pamiętaj o zabraniu ze sobą wygodnych, otwartych butów oraz środków płatniczych lub możliwości płatności online.",
  },
  {
    id: "hybrid-duration-pedicure",
    question: "Jak długo utrzymuje się pedicure hybrydowy?",
    answer:
      "Pedicure hybrydowy utrzymuje się zazwyczaj od 3 do 4 tygodni, a nawet dłużej, ponieważ paznokcie u stóp rosną wolniej niż u rąk. Aby przedłużyć trwałość pedicure hybrydowego, unikaj długich kąpieli w gorącej wodzie, noś wygodne buty, które nie uciskają paznokci, i regularnie nawilżaj stopy. Jeśli zauważysz odklejanie się lakieru lub pękanie, skontaktuj się ze stylistką w celu korekty. Pamiętaj, że regularna pielęgnacja stóp jest ważna dla zdrowia i wyglądu.",
  },
  {
    id: "first-time-visit-pedicure",
    question: "Czy muszę umawiać się z wyprzedzeniem?",
    answer:
      "Zdecydowanie tak - umawianie się z wyprzedzeniem jest bardzo ważne, szczególnie jeśli chcesz wizytę u konkretnej stylistki lub w określonym terminie. Popularne stylistki mogą mieć terminy zarezerwowane nawet na kilka tygodni do przodu, szczególnie w sezonie letnim, gdy zapotrzebowanie na usługi pedicure jest większe. Rezerwacja z wyprzedzeniem daje Ci również możliwość wyboru najlepszego dla Ciebie terminu i zapewnia, że stylistka będzie miała czas na wykonanie pełnego zabiegu zgodnie z Twoimi oczekiwaniami.",
  },
];

export default async function ServiceCitySlug({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cityParam = (await params).city;
  const city = await getSingleCity(cityParam);

  if (city?.error) {
    return <NotFound />;
  }

  // Fetch registered users matching city
  const cityUsers = await getCityUsers(city.id);
  
  // Sort city users by priorityLevel, then by name
  const sortedMergedUsers = cityUsers.sort((a: User, b: User) => {
    const priorityA = a.priorityLevel ?? 0;
    const priorityB = b.priorityLevel ?? 0;
    if (priorityB !== priorityA) {
      return priorityB - priorityA; // Higher priority first
    }
    return (a.name || "").localeCompare(b.name || "");
  });

  // Pre-load user data if query parameter is present
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const userSlug = resolvedSearchParams.user as string | undefined;
  let preloadedUser: User | null = null;
  let preloadedPortfolio: Array<{ id: string; url?: string; title?: string }> = [];

  if (userSlug) {
    preloadedUser = await fetchUserBySlugOrUid(userSlug);
    if (preloadedUser?.uid) {
      try {
        const colRef = collection(db, "users", preloadedUser.uid, "portfolio");
        const q = query(colRef, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        preloadedPortfolio = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
      } catch (_) {
        preloadedPortfolio = [];
      }
    }
  }

  // Add promotional AD to salons array
  const salonsWithAd = [
    {
      id: "ad",
      name: "Twój profil tutaj!",
      isAd: true,
      title: "Dla stylistek z Naily",
      subtitle: "Miesiąc za darmo",
      description: "Wyświetlaj się wśród najlepszych w mieście",
      image:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop&crop=center",
      features: [
        "Rezerwacje online",
        "Profesjonalny cennik",
        "Większa widoczność",
        "Nowe klientki",
        "Prowadzenie szkoleń",
        "0% prowizji",
      ],
    },
  ];

  const calculateDistanceKm = (
    latitudeA: number,
    longitudeA: number,
    latitudeB: number,
    longitudeB: number
  ): number => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRadians(latitudeB - latitudeA);
    const dLon = toRadians(longitudeB - longitudeA);
    const lat1Rad = toRadians(latitudeA);
    const lat2Rad = toRadians(latitudeB);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  };

  const allCities: ICity[] = await getCities();
  // Validate current city coords. If invalid, try to find a city with the same name that has valid coords
  const hasValidOrigin =
    typeof city.latitude === "number" &&
    typeof city.longitude === "number" &&
    city.latitude !== 0 &&
    city.longitude !== 0;
  const origin = hasValidOrigin
    ? city
    : allCities.find(
        (c) => c.name === city.name && c.latitude !== 0 && c.longitude !== 0
      ) || city;

  const nearbyCities: ICity[] = Array.isArray(allCities)
    ? allCities
        .filter(
          (c) =>
            c &&
            typeof c.latitude === "number" &&
            typeof c.longitude === "number" &&
            c.latitude !== 0 &&
            c.longitude !== 0 &&
            c.id !== origin.id
        )
        .map((c) => {
          const distance = calculateDistanceKm(
            origin.latitude,
            origin.longitude,
            c.latitude,
            c.longitude
          );
          const sameProvince =
            origin.province && c.province && origin.province === c.province
              ? 1
              : 0;
          return { city: c, distance, sameProvince };
        })
        .filter((x) => Number.isFinite(x.distance))
        .sort((a, b) => {
          if (b.sameProvince !== a.sameProvince)
            return b.sameProvince - a.sameProvince;
          return a.distance - b.distance;
        })
        .slice(0, 18)
        .map((x) => x.city)
    : [];

  // Generate structured data for SEO
  const structuredData = generateStructuredData(city, "pedicure");

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD Structured Data for SEO */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <CityHero
        city={city}
        serviceType="pedicure"
        headline={`Pedicure ${city.name} - Cennik`}
        description="Sprawdzone miejsca z najwyższymi ocenami klientek i profesjonalnym pedicure. Sprawdź przewidywane ceny i katalog stylistek pedicure w swoim mieście."
      />

      {/* Featured Salons Section - Modern Design */}
      <section className="py-20 px-6 bg-neutral-50">
        <h2 className="text-3xl lg:text-4xl font-baloo font-bold text-neutral-900 mb-12 text-center">Zarezerwuj pedicure teraz</h2>
        <div className="container">
          {/* Results single column cards */}
          {Array.isArray(sortedMergedUsers) && sortedMergedUsers.length > 0 && (
            <div className="flex flex-col gap-6 md:gap-8 mb-10">
              {sortedMergedUsers.map(
                (u: {
                  uid: string;
                  name: string;
                  logo?: string;
                  userSlugUrl?: string;
                  services?: IService[];
                  portfolioImages?: unknown[];
                  portfolio?: Array<{ url?: string; id?: string; [key: string]: unknown }>;
                  premiumActive?: boolean;
                  seek?: boolean;
                  location?: { address?: string };
                  phoneNumber?: string;
                  description?: string;
                }) => {
                  const isIndividualSpecialist = u.seek === true;
                  const isSalon = u.seek === false;
                  // Get portfolio images from either portfolioImages or portfolio field
                  // portfolioImages uses {src: string}, portfolio uses {url: string}
                  const getPortfolioImages = () => {
                    if (u.portfolioImages && Array.isArray(u.portfolioImages) && u.portfolioImages.length > 0) {
                      return u.portfolioImages.map((img: any) => ({ src: img.src || img.url }));
                    }
                    if (u.portfolio && Array.isArray(u.portfolio) && u.portfolio.length > 0) {
                      return u.portfolio.map((item: any) => ({ src: item.url || item.src }));
                    }
                    return [];
                  };
                  return (
                    <div key={u.uid} className="w-full">
                      <UserCard user={u} cityParam={cityParam} />
                    </div>
                  );
                }
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-8">
            {salonsWithAd.map((salon, index) => {
              // Special rendering for AD card
              if (salon.isAd) {
                return (
                  <div
                    key={salon.id}
                    className="group bg-white h-max rounded-2xl transition-all duration-300 overflow-hidden animate-fade-in-up border border-primary-200 hover:shadow-lg"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="md:grid md:grid-cols-12 gap-8 p-6 md:p-8 lg:p-10">
                      {/* AD Image */}
                      <div className="relative md:col-span-4 rounded-xl overflow-hidden bg-primary-50 flex items-center justify-center min-h-[220px] md:min-h-[260px] lg:min-h-[300px]">
                        <Image
                          src="/naily-logo2.png"
                          alt="Naily Logo"
                          fill
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          className="object-contain p-10 md:p-4 lg:p-12"
                        />
                      </div>

                      {/* AD Content */}
                      <div className="md:col-span-8 flex flex-col justify-between h-full">
                        <div className="flex flex-col gap-4">
                          <div className="mt-4 md:mt-0 mb-2 md:mb-4 flex flex-row items-start justify-between gap-3">
                            <h3 className="text-3xl font-baloo font-bold text-zinc-800 transition-colors">
                              {salon.title}
                            </h3>
                            <span className="inline-flex items-center rounded-full bg-primary-50 text-blue-700 px-3.5 py-1.5 text-xs md:text-sm font-inter font-medium">
                              {salon.subtitle}
                            </span>
                          </div>

                          {/* AD Features */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                            {salon.features?.map(
                              (feature: string, featureIndex: number) => (
                                <div
                                  key={featureIndex}
                                  className="flex items-center gap-2 text-sm text-neutral-700 font-inter font-normal leading-relaxed"
                                >
                                  <FaCheck className="text-green-500" />
                                  <span>{feature}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                        <div className="mt-8 md:mt-10 lg:mt-0 flex flex-col gap-3">
                          <span className="text-xs md:text-sm text-neutral-500 font-inter font-normal pr-0 md:pr-12">
                            Promocja tylko dla pierwszych 10 specjalistek w
                            Twoim mieście — zajmij miejsce zanim zniknie.
                          </span>
                          {/* CTA Button */}
                          <div>
                            <JoinNowButton />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </section>

      {/* Pedicure Hybrydowy Section */}
      {Array.isArray(sortedMergedUsers) && sortedMergedUsers.length > 0 && (
        <section className="py-20 px-6 bg-white">
          <div className="container">
            <h2 className="mb-12 text-3xl lg:text-4xl font-baloo font-bold text-neutral-900">
              Pedicure hybrydowy {city.name} – sprawdzone stylistki w 2026 roku
            </h2>
            <div className="flex flex-col gap-6 md:gap-8">
              {sortedMergedUsers.slice(0, 3).map((u: {
                uid: string;
                name: string;
                logo?: string;
                userSlugUrl?: string;
                services?: IService[];
                portfolioImages?: unknown[];
                portfolio?: Array<{ url?: string; id?: string; [key: string]: unknown }>;
                premiumActive?: boolean;
                seek?: boolean;
                location?: { address?: string };
                phoneNumber?: string;
                description?: string;
              }) => (
                <div key={u.uid} className="w-full">
                  <UserCard user={u} cityParam={cityParam} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Najlepsze Stylistki Section */}
      {Array.isArray(sortedMergedUsers) && sortedMergedUsers.length > 3 && (
        <section className="py-20 px-6 bg-neutral-50">
          <div className="container">
            <h2 className="mb-12 text-3xl lg:text-4xl font-baloo font-bold text-neutral-900">
              Paznokcie hybrydowe {city.name}
            </h2>
            <div className="flex flex-col gap-6 md:gap-8">
              {sortedMergedUsers.slice(3, 6).map((u: {
                uid: string;
                name: string;
                logo?: string;
                userSlugUrl?: string;
                services?: IService[];
                portfolioImages?: unknown[];
                portfolio?: Array<{ url?: string; id?: string; [key: string]: unknown }>;
                premiumActive?: boolean;
                seek?: boolean;
                location?: { address?: string };
                phoneNumber?: string;
                description?: string;
              }) => (
                <div key={u.uid} className="w-full">
                  <UserCard user={u} cityParam={cityParam} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ceny Pedicure Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-blue-200/20 blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-purple-200/20 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-100/10 blur-3xl"></div>
        </div>

        <div className="relative z-10 container mx-auto max-w-4xl">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-200/50 mb-4 sm:mb-6 shadow-sm">
              <FaTags className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-baloo font-bold text-neutral-900 mb-3 leading-tight">
            Ceny pedicure {city.name} w 2026
          </h2>
            <p className="text-base sm:text-lg text-neutral-600 font-poppins max-w-2xl mx-auto">
              Sprawdź szczegółowy cennik wszystkich usług pedicure. Ceny mogą się różnić w zależności od stylistki i zakresu usługi.
              </p>
            </div>

          {/* Enhanced Pricing Table Container */}
          <div className="relative">
            {/* Decorative border accent */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 blur-sm"></div>
            <div className="relative bg-white rounded-xl shadow-xl border border-neutral-200/50 p-6 sm:p-8">
              <PricingTable items={pedicurePricing} />
              </div>
            </div>
        </div>
      </section>

      {/* Najczęstsze Pytania Section */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="container">
          <h2 className="mb-12 text-3xl lg:text-4xl font-baloo font-bold text-neutral-900">
            Najczęstsze pytania przed wizytą
          </h2>
          <FAQ className="animate-fade-in-up" items={preVisitFaq} />
        </div>
      </section>

      {/* City Overview Section - Enhanced */}
      <section className="py-20 px-6">
        <div className="container">
          <h2 className="mb-16 text-4xl lg:text-5xl font-baloo font-bold text-neutral-900 leading-tight">
            Pedicure {city.name} - Przegląd cen w 2026
          </h2>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
            <div className="">
              <Image
                src={slug1}
                alt={`Najlepsza jakość pedicure ${city.name} - Profesjonalne usługi paznokci`}
                width={500}
                height={500}
                className="w-[350px]"
                loading="lazy"
                fetchPriority="low"
              />
              <h3 className="text-3xl font-baloo mt-8 lg:mt-12 mb-6 font-bold text-zinc-800">
                Stylistki paznokci w Twojej lokalizacji
              </h3>
              <p className="text-neutral-600 font-poppins font-normal">
                Twoja stylistka paznokci {city.name} - wypróbuj pedicure,
                który podkreśli Twój charakter.
              </p>
            </div>

            <div className="">
              <Image
                src={slug2}
                alt={`Najlepsze opinie pedicure ${city.name} - Zadowolone klientki na 2026 rok`}
                width={500}
                height={500}
                className="w-[350px]"
                loading="lazy"
                fetchPriority="low"
              />

              <h3 className="text-3xl font-baloo mt-8 lg:mt-12 mb-6 font-bold text-zinc-800">
                Perfekcyjne stylizacje paznokci
              </h3>
              <p className="text-neutral-600 font-poppins font-normal">
                Setki pozytywnych opinii i tysiące zachwyconych stóp. Sprawdź,
                dlaczego kobiety wybierają Naily.
              </p>
            </div>

            <div className="">
              <Image
                src={slug3}
                alt={`Rezerwuj pedicure ${city.name} - Umów wizytę online`}
                width={500}
                height={500}
                className="w-[350px]"
                loading="lazy"
                fetchPriority="low"
              />

              <h3 className="text-3xl font-baloo mt-8 lg:mt-12 mb-6 font-bold text-zinc-800">
                Rezerwuj pedicure, kiedy chcesz
              </h3>
              <p className="text-neutral-600 font-poppins font-normal">
                Zarezerwuj termin lub przyjmuj klientki wtedy, gdy to dla Ciebie
                najwygodniejsze.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Szkolenia i oferty pracy section */}
      <section className="py-12 px-6 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Szkolenia Card */}
            <Link
              href={`/kursy-pedicure/${city.id}`}
              className="group bg-white rounded-xl p-8 lg:p-10 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300"
            >
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                    <FaGem className="text-2xl text-purple-700" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-baloo font-bold text-zinc-800 mb-3 group-hover:text-blue-600 transition-colors">
                    Szkolenia Pedicure {city.name}
                  </h3>
                  <p className="text-neutral-600 text-base font-poppins leading-relaxed">
                    Znajdź najlepsze szkolenia z pedicure {city.name}. Profesjonalne kursy, certyfikaty i rozwój umiejętności.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <span className="inline-flex items-center gap-2 text-blue-600 font-semibold font-poppins group-hover:gap-3 transition-all">
                    Instruktorki pedicure {city.name}
                    <FaArrowRight className="text-sm" />
                  </span>
                </div>
              </div>
            </Link>

            {/* Oferty pracy card */}
            <Link
              href={`/kariera/${city.id}`}
              className="group bg-white rounded-xl p-8 lg:p-10 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300"
            >
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <FaStar className="text-2xl text-blue-700" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-baloo font-bold text-zinc-800 mb-3 group-hover:text-blue-600 transition-colors">
                    Pracuj w salonie pedicure {city.name}
                  </h3>
                  <p className="text-neutral-600 text-base font-poppins leading-relaxed">
                    Najlepsze oferty pracy pedicure {city.name}. Praca w salonach i rozwój
                    umiejętności w branży beauty.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <span className="inline-flex items-center gap-2 text-blue-600 font-semibold font-poppins group-hover:gap-3 transition-all">
                    Oferty pracy pedicurzystka {city.name}
                    <FaArrowRight className="text-sm" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
      {/* Nearby Cities Section - distance based */}
      <section className="py-20 px-6 bg-white">
        <div className="container">
          <h3 className="mb-20 text-4xl lg:text-5xl font-baloo font-bold text-neutral-900">
            Szukaj pedicure w innych miastach
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-baloo font-bold text-neutral-900 mb-4">
                Manicure
              </h2>
              <div className="flex flex-wrap gap-6">
                {nearbyCities.map((c) => (
                  <Link
                    key={c.id}
                    href={`/manicure/${c.id}`}
                    className="group py-3 relative w-max text-xl text-black hover:border-blue-800 hover:text-blue-800"
                  >
                    {`${c.name}`}
                    <div className="absolute bottom-0 left-0 w-full h-[4px] bg-blue-800 group-hover:h-[6px] duration-100 rounded-full"></div>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-baloo font-bold text-neutral-900 mb-4">
                Pedicure
              </h2>
              <div className="flex flex-wrap gap-6">
                {nearbyCities.map((c) => (
                  <Link
                    key={c.id}
                    href={`/pedicure/${c.id}`}
                    className="group py-3 relative w-max text-xl text-black hover:border-blue-800 hover:text-blue-800"
                  >
                    {`${c.name}`}
                    <div className="absolute bottom-0 left-0 w-full h-[4px] bg-blue-800 group-hover:h-[6px] duration-100 rounded-full"></div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Professional Salons */}
      <section className="py-12 px-6 bg-neutral-50">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-baloo font-bold text-zinc-800 mb-4">
              Dlaczego pedicure w Naily?
            </h2>
            <p className="text-neutral-600 max-w-2xl font-poppins font-normal">
              Profesjonalne salony oferują najwyższą jakość usług i
              bezpieczeństwo zabiegów
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-16">
            <div>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaGem className="text-4xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold font-baloo text-2xl text-zinc-800 mb-2">
                    Najlepsze produkty do pedicure
                  </h3>
                  <p className="text-neutral-600 text-sm font-poppins font-normal">
                    Sprawdzone i bezpieczne narzędzia i produkty
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaStar className="text-4xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold font-baloo text-2xl text-zinc-800 mb-2">
                    Doświadczone stylistki paznokci
                  </h3>
                  <p className="text-neutral-600 text-sm font-poppins font-normal">
                    Stylistki pedicure z wieloletnim doświadczeniem
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaClock className="text-4xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold font-baloo text-2xl text-zinc-800 mb-2">
                    Dogodne terminy
                  </h3>
                  <p className="text-neutral-600 text-sm font-poppins font-normal">
                    Elastyczne godziny otwarcia dostosowane do Twoich potrzeb
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaPhone className="text-4xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold font-baloo text-2xl text-zinc-800 mb-2">
                    Łatwa rezerwacja
                  </h3>
                  <p className="text-neutral-600 text-sm font-poppins font-normal">
                    Szybkie i wygodne umawianie wizyt online lub telefonicznie
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-4xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold font-baloo text-2xl text-zinc-800 mb-2">
                    Dogodne lokalizacje
                  </h3>
                  <p className="text-neutral-600 text-sm font-poppins font-normal">
                    Salony w centrum miasta z łatwym dojazdem komunikacją
                    miejską
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MdSpa className="text-4xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold font-baloo text-2xl text-zinc-800 mb-2">
                    Sterylne narzędzia
                  </h3>
                  <p className="text-neutral-600 text-sm font-poppins font-normal">
                    Dezynfekcja i sterylizacja wszystkich narzędzi po każdym
                    kliencie
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent blog posts */}
      <RecentPosts
        limit={3}
        columns={3}
        className="bg-white"
        allowStaticFallback={false}
      />

      {/* City FAQ */}
      <div className="py-20">
        <FAQ className="animate-fade-in-up" items={cityFaq} />
      </div>

      {/* User Slider Wrapper */}
      <UserSliderWrapper
        cityUsers={sortedMergedUsers || []}
        preloadedUser={preloadedUser}
        preloadedPortfolio={preloadedPortfolio}
        initialUserSlug={userSlug || null}
      />
    </div>
  );
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e40af",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const cityData: ICity = await getSingleCity(city);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://naily.pl";
  const canonicalUrl = `${baseUrl}/pedicure/${cityData.id}`;
  const title = `Pedicure ${cityData.name} 2026 - Cennik Katalog Opinie`;
  const description = `Najlepsze stylistki i salony pedicure ${cityData.name}. Pełny cennik, katalog usług i opinie. Sprawdzone miejsca z najwyższymi ocenami. Rezerwuj online.`;
  const keywords = `pedicure ${cityData.name}, cennik pedicure ${cityData.name}, najlepsze salony paznokci ${cityData.name}, stylistki paznokci ${cityData.name}, pedicure hybrydowy ${cityData.name}, manicure ${cityData.name}`;
  
  return {
    title: title,
    description: description,
    keywords: keywords,
    authors: [
      {
        name: "Naily",
        url: "https://naily.pl",
      },
    ],
    publisher: "naily.pl",
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: [
      {
        url: "/fav/favicon.ico",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    openGraph: {
      type: "website",
      title: title,
      description: description,
      siteName: "Naily",
      url: canonicalUrl,
      locale: "pl_PL",
      images: [
        {
          url: `${baseUrl}/pricing.png`,
          width: 1200,
          height: 630,
          alt: `TOP 10 PEDICURE ${cityData.name} w 2026 - Cennik Katalog`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@Naily",
      title: title,
      description: description,
      images: [
        {
          url: `${baseUrl}/pricing.png`,
          alt: `TOP 10 PEDICURE ${cityData.name} w 2026 - Cennik Katalog`,
        },
      ],
    },
    other: {
      "theme-color": "#1e40af",
    },
  };
}

const cityFaq: FaqItem[] = [
  {
    id: "booking-city",
    question: "Jak zarezerwować wizytę w tym mieście?",
    answer:
      "Rezerwacja wizyty na pedicure w naszym mieście jest bardzo prosta. Najpierw przejrzyj listę dostępnych specjalistek i salonów na tej stronie. Każdy profil zawiera szczegółowe informacje o stylistce, jej doświadczeniu, portfolio prac oraz dostępnych terminach. Możesz zarezerwować wizytę bezpośrednio przez platformę online, wybierając dogodny dla Ciebie termin z kalendarza dostępności. Po wyborze terminu otrzymasz potwierdzenie rezerwacji na podany adres email lub numer telefonu. Większość specjalistek oferuje również możliwość rezerwacji telefonicznej lub przez wiadomość prywatną. Pamiętaj, że niektóre popularne stylistki mogą mieć dłuższe terminy oczekiwania, dlatego warto rezerwować z wyprzedzeniem. Szczególnie w sezonie letnim, gdy zapotrzebowanie na usługi pedicure jest większe, warto planować wizyty z kilkutygodniowym wyprzedzeniem.",
  },
  {
    id: "prices-city",
    question: "Czy ceny różnią się między specjalistkami?",
    answer:
      "Tak, ceny usług pedicure różnią się między specjalistkami i zależą od wielu czynników. Każda stylistka ustala własny cennik, który może być uzależniony od jej doświadczenia, lokalizacji salonu, używanego sprzętu i produktów, a także zakresu oferowanych usług. Podstawowy pedicure klasyczny może kosztować od 50 do 90 złotych, pedicure hybrydowy od 70 do 130 złotych, a pedicure z dodatkowymi zabiegami pielęgnacyjnymi (np. peeling, masaż, parafina) od 100 do 180 złotych. Ceny mogą również różnić się w zależności od tego, czy wybierasz usługę w salonie czy wizyta odbywa się w domu klientki. Aktualny, szczegółowy cennik znajdziesz na profilu każdej specjalistki, gdzie często dostępne są również informacje o pakietach promocyjnych, zniżkach dla stałych klientek oraz cenach dodatkowych usług takich jak zdobienia, przedłużanie paznokci czy zabiegi pielęgnacyjne stóp.",
  },
  {
    id: "location-city",
    question: "Jak sprawdzić lokalizację salonu?",
    answer:
      "Lokalizacja każdego salonu i stylistki jest szczegółowo opisana na jej profilu. Znajdziesz tam pełny adres wraz z kodem pocztowym, a także interaktywną mapę Google Maps, która ułatwi Ci dotarcie na miejsce. Większość profili zawiera również informacje o dostępności komunikacji miejskiej, możliwości parkowania w pobliżu salonu oraz wskazówki dojazdu dla klientek przyjeżdżających samochodem. Niektóre stylistki oferują również usługi mobilne, przyjeżdżając do klientek do domu, co jest szczególnie wygodne w przypadku zabiegów pedicure. Jeśli masz pytania dotyczące lokalizacji lub potrzebujesz dodatkowych wskazówek dojazdu, możesz skontaktować się bezpośrednio ze stylistką przez telefon lub wiadomość prywatną. Warto sprawdzić lokalizację przed rezerwacją, aby upewnić się, że salon jest dla Ciebie dogodnie położony i łatwo dostępny.",
  },
  {
    id: "change-city",
    question: "Czy mogę zmienić termin wizyty?",
    answer:
      "Tak, w większości przypadków możesz zmienić termin wizyty, jednak zasady dotyczące zmian i odwołań różnią się w zależności od polityki danej specjalistki. Szczegółowe informacje o możliwości zmiany terminu, wymaganym czasie wyprzedzenia oraz ewentualnych opłatach za odwołanie znajdziesz w potwierdzeniu rezerwacji oraz na profilu stylistki. Zazwyczaj zmiana terminu jest możliwa bez dodatkowych opłat, jeśli poinformujesz stylistkę z odpowiednim wyprzedzeniem (zwykle minimum 24-48 godzin przed wizytą). Odwołanie wizyty w ostatniej chwili może wiązać się z koniecznością uiszczenia częściowej opłaty lub pełnej kwoty za usługę, zgodnie z polityką salonu. W przypadku nagłych sytuacji losowych, większość stylistek jest elastyczna i stara się znaleźć rozwiązanie korzystne dla obu stron. Najlepiej skontaktować się bezpośrednio ze stylistką, aby omówić możliwość zmiany terminu. Pamiętaj, że wczesne poinformowanie o potrzebie zmiany terminu zwiększa szanse na znalezienie dogodnego rozwiązania.",
  },
];

