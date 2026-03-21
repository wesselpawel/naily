import NotFound from "@/app/not-found";
import JoinNowButton from "@/components/AdCard/JoinNowButton";
import { getCityUsers } from "@/utils/getCityUsers";
import { ICity } from "@/types";
import { getSingleCity } from "@/utils/getSingleCity";
import { getCities } from "@/utils/getCities";
import { Viewport } from "next";
import Image from "next/image";
import RecentPosts from "@/components/Blog/RecentPosts";
import FAQ, { type FaqItem } from "@/components/FAQ/FAQ";
import { IService } from "@/types";
import UserSliderWrapper from "@/components/CityPage/UserSliderWrapper";
import UserCard from "@/components/CityPage/UserCard";
import { getUserById, getUsers, db } from "@/firebase";
import { User } from "@/types";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Metadata } from "next";
import { type PricingItem } from "@/components/CityPage/PricingTable";

// SEO Components
import SchemaGenerator from "@/components/CityPage/SEO/SchemaGenerator";
import KeywordRichContent from "@/components/CityPage/SEO/KeywordRichContent";
import ServiceAreaMap from "@/components/CityPage/SEO/ServiceAreaMap";
import ReviewRichSnippets from "@/components/CityPage/SEO/ReviewRichSnippets";
// Page Sections
import CityHero from "@/components/CityPage/Sections/CityHero";
import PricingSection from "@/components/CityPage/Sections/PricingSection";
import WhyChooseSection from "@/components/CityPage/Sections/WhyChooseSection";
import NearbyCitiesSection from "@/components/CityPage/Sections/NearbyCitiesSection";
import CityOverviewSection from "@/components/CityPage/Sections/CityOverviewSection";
import ServicesGridSection from "@/components/CityPage/Sections/ServicesGridSection";
import CareerTrainingSection from "@/components/CityPage/Sections/CareerTrainingSection";

// Enable ISR: Revalidate every hour to keep salon listings fresh while maintaining fast static pages
// Pages are generated on-demand (on first request) and then cached - no need to pre-generate all at build time
export const revalidate = 3600; // 1 hour

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

const manicurePricing: PricingItem[] = [
  {
    id: "manicure-classic",
    name: "Manicure klasyczny z odżywką",
    minPrice: 110,
    maxPrice: 110,
    description: "Podstawowy manicure z lakierem klasycznym, pielęgnacją skórek, kształtowaniem paznokci oraz odżywką wzmacniającą płytkę paznokcia.",
  },
  {
    id: "manicure-hybrid",
    name: "Manicure hybrydowy (jeden kolor)",
    minPrice: 80,
    maxPrice: 80,
    description: "Trwały manicure hybrydowy z lakierem UV/LED, utrzymujący się nawet do 3 tygodni. Idealny dla osób, które chcą długotrwałej ochrony i pięknego wyglądu paznokci.",
  },
  {
    id: "manicure-japanese",
    name: "Manicure japoński",
    minPrice: 220,
    maxPrice: 220,
    description: "Tradycyjny japoński manicure z użyciem naturalnych składników, delikatnym polerowaniem i specjalnymi odżywkami. Metoda znana z regeneracji i wzmocnienia paznokci.",
  },
  {
    id: "manicure-spa",
    name: "Manicure SPA (z peelingiem i maską)",
    minPrice: 180,
    maxPrice: 180,
    description: "Luksusowy manicure z pełną pielęgnacją dłoni, peelingiem, maseczką nawilżającą i relaksującym masażem. Kompleksowa regeneracja skóry dłoni i paznokci.",
  },
  {
    id: "manicure-male",
    name: "Manicure męski",
    minPrice: 130,
    maxPrice: 130,
    description: "Profesjonalna pielęgnacja paznokci i dłoni dla mężczyzn, obejmująca czyszczenie, kształtowanie i polerowanie paznokci oraz pielęgnację skórek.",
  },
  {
    id: "nail-extension-gel",
    name: "Przedłużanie paznokci żelem na formie",
    minPrice: 80,
    maxPrice: 120,
    description: "Przedłużanie paznokci metodą żelową z użyciem form. Trwała i naturalnie wyglądająca metoda, która pozwala na uzyskanie dowolnej długości i kształtu paznokci.",
  },
  {
    id: "nail-extension-acrylic",
    name: "Przedłużanie paznokci metodą akrylową",
    minPrice: 90,
    maxPrice: 90,
    description: "Przedłużanie paznokci przy użyciu akrylu - wytrzymała metoda, która zapewnia długotrwały efekt i możliwość tworzenia różnych kształtów i długości.",
  },
  {
    id: "french-manicure",
    name: "Stylizacja French Manicure",
    minPrice: 220,
    maxPrice: 220,
    description: "Klasyczna stylizacja French Manicure z białymi końcówkami i naturalnym różowym tłem. Elegancki i ponadczasowy wygląd, idealny na każdą okazję.",
  },
  {
    id: "baby-boomer",
    name: "Stylizacja Baby Boomer",
    minPrice: 180,
    maxPrice: 180,
    description: "Stylizacja Baby Boomer z efektem gradientu od naturalnego różu do białego. Delikatny i naturalny wygląd z subtelnym przejściem kolorów.",
  },
  {
    id: "artistic-decoration",
    name: "Ręczne zdobienie artystyczne",
    minPrice: 80,
    maxPrice: 80,
    description: "Unikalne ręczne zdobienia paznokci wykonane przez doświadczoną stylistkę. Możliwość stworzenia indywidualnych wzorów, rysunków i dekoracji zgodnie z Twoimi preferencjami.",
  },
  {
    id: "nail-reconstruction",
    name: "Rekonstrukcja płytki paznokcia",
    minPrice: 90,
    maxPrice: 90,
    description: "Specjalistyczna rekonstrukcja uszkodzonej lub zniszczonej płytki paznokcia. Metoda przywracająca naturalny wygląd i funkcjonalność paznokcia.",
  },
  {
    id: "nail-hardening",
    name: "Utwardzenie naturalnej płytki żelem lub bazą budującą",
    minPrice: 140,
    maxPrice: 140,
    description: "Wzmocnienie naturalnych paznokci za pomocą żelu lub bazy budującej. Idealne rozwiązanie dla osób z kruchymi i łamliwymi paznokciami, które chcą je wzmocnić bez przedłużania.",
  },
  {
    id: "acrylic-fill",
    name: "Uzupełnienie paznokci akrylowych",
    minPrice: 100,
    maxPrice: 100,
    description: "Uzupełnienie odrostu paznokci wykonanych metodą akrylową. Regularna korekta pozwala na utrzymanie pięknego wyglądu i przedłużenie trwałości stylizacji.",
  },
  {
    id: "gel-fill",
    name: "Uzupełnienie paznokci żelowych",
    minPrice: 170,
    maxPrice: 170,
    description: "Uzupełnienie odrostu paznokci wykonanych metodą żelową. Profesjonalna korekta z zachowaniem spójności stylizacji i jakości wykonania.",
  },
  {
    id: "titanium-fill",
    name: "Uzupełnienie paznokci tytanowych",
    minPrice: 120,
    maxPrice: 120,
    description: "Uzupełnienie odrostu paznokci wykonanych metodą tytanową. Specjalistyczna korekta zapewniająca długotrwałą trwałość i wytrzymałość stylizacji.",
  },
  {
    id: "ibx-treatment",
    name: "Kuracja regeneracyjna IBX System na paznokcie",
    minPrice: 50,
    maxPrice: 50,
    description: "Profesjonalna kuracja regeneracyjna IBX System wzmacniająca i naprawiająca uszkodzoną płytkę paznokcia. Idealna dla paznokci łamliwych, rozdwajających się lub osłabionych.",
  },
];

const preVisitFaq: FaqItem[] = [
  {
    id: "prep-before-visit",
    question: "Jak przygotować się do wizyty na manicure?",
    answer:
      "Przed wizytą na manicure warto usunąć stary lakier z paznokci, jeśli masz. Nie musisz obcinać paznokci - stylistka zrobi to za Ciebie. Jeśli masz jakiekolwiek problemy skórne wokół paznokci, poinformuj o tym stylistkę przed rozpoczęciem zabiegu. Warto również przemyśleć, jaki kolor lub styl paznokci Cię interesuje - możesz przynieść zdjęcia inspiracji. Pamiętaj, aby przyjść na wizytę z czystymi dłońmi.",
  },
  {
    id: "how-long-manicure",
    question: "Ile trwa wizyta na manicure?",
    answer:
      "Czas trwania wizyty zależy od wybranego typu manicure. Podstawowy manicure klasyczny trwa zazwyczaj około 30-45 minut, manicure hybrydowy około 60-90 minut, a przedłużanie paznokci może zająć nawet 2-3 godziny. Czas może się również różnić w zależności od stylistki i zakresu usługi. Warto zarezerwować sobie odpowiednią ilość czasu i nie planować innych pilnych spraw zaraz po wizycie.",
  },
  {
    id: "what-to-bring",
    question: "Czy muszę coś przynieść na wizytę?",
    answer:
      "Nie musisz przynosić niczego specjalnego na wizytę - stylistka ma wszystkie niezbędne narzędzia i produkty. Możesz jednak przynieść zdjęcia inspiracji, jeśli masz konkretny pomysł na wygląd paznokci. Jeśli masz własne lakiery, które chcesz użyć, możesz je przynieść, ale większość salonów ma szeroki wybór kolorów. Pamiętaj tylko o zabraniu ze sobą środków płatniczych lub możliwości płatności online.",
  },
  {
    id: "hybrid-duration",
    question: "Jak długo utrzymuje się manicure hybrydowy?",
    answer:
      "Manicure hybrydowy utrzymuje się zazwyczaj od 2 do 3 tygodni, w zależności od tempa wzrostu paznokci i sposobu pielęgnacji. Aby przedłużyć trwałość manicure hybrydowego, unikaj agresywnych środków chemicznych, używaj rękawiczek podczas prac domowych i regularnie nawilżaj dłonie i skórki. Jeśli zauważysz odklejanie się lakieru lub pękanie, skontaktuj się ze stylistką w celu korekty.",
  },
  {
    id: "first-time-visit",
    question: "Czy muszę umawiać się z wyprzedzeniem?",
    answer:
      "Zdecydowanie tak - umawianie się z wyprzedzeniem jest bardzo ważne, szczególnie jeśli chcesz wizytę u konkretnej stylistki lub w określonym terminie. Popularne stylistki mogą mieć terminy zarezerwowane nawet na kilka tygodni do przodu. Rezerwacja z wyprzedzeniem daje Ci również możliwość wyboru najlepszego dla Ciebie terminu i zapewnia, że stylistka będzie miała czas na wykonanie usługi zgodnie z Twoimi oczekiwaniami.",
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

  const cityFaq: FaqItem[] = [
    {
      id: "booking-city",
      question: `Jak zarezerwować wizytę manicure w ${city.name}?`,
      answer:
        `Rezerwacja wizyty na manicure w naszym mieście jest bardzo prosta. Najpierw przejrzyj listę dostępnych specjalistek i salonów na tej stronie. Każdy profil zawiera szczegółowe informacje o stylistce, jej doświadczeniu, portfolio prac oraz dostępnych terminach. Możesz zarezerwować wizytę bezpośrednio przez platformę online, wybierając dogodny dla Ciebie termin z kalendarza dostępności. Po wyborze terminu otrzymasz potwierdzenie rezerwacji na podany adres email lub numer telefonu. Większość specjalistek oferuje również możliwość rezerwacji telefonicznej lub przez wiadomość prywatną. Pamiętaj, że niektóre popularne stylistki mogą mieć dłuższe terminy oczekiwania, dlatego warto rezerwować z wyprzedzeniem.`,
    },
    {
      id: "prices-city",
      question: "Czy ceny różnią się między specjalistkami?",
      answer:
        `Tak, ceny usług manicure różnią się między specjalistkami i zależą od wielu czynników. Każda stylistka ustala własny cennik, który może być uzależniony od jej doświadczenia, lokalizacji salonu, używanego sprzętu i produktów, a także zakresu oferowanych usług. Podstawowy manicure klasyczny może kosztować od 60 do 120 złotych, manicure hybrydowy od 90 do 150 złotych, a przedłużanie paznokci od 100 do 200 złotych. Ceny mogą również różnić się w zależności od tego, czy wybierasz usługę w salonie czy wizyta odbywa się w domu klientki. Aktualny, szczegółowy cennik znajdziesz na profilu każdej specjalistki, gdzie często dostępne są również informacje o pakietach promocyjnych, zniżkach dla stałych klientek oraz cenach dodatkowych usług takich jak zdobienia czy przedłużanie paznokci.`,
    },
    {
      id: "location-city",
      question: "Jak sprawdzić lokalizację salonu?",
      answer:
        "Lokalizacja każdego salonu i stylistki jest szczegółowo opisana na jej profilu. Znajdziesz tam pełny adres wraz z kodem pocztowym, a także interaktywną mapę Google Maps, która ułatwi Ci dotarcie na miejsce. Większość profili zawiera również informacje o dostępności komunikacji miejskiej, możliwości parkowania w pobliżu salonu oraz wskazówki dojazdu dla klientek przyjeżdżających samochodem. Niektóre stylistki oferują również usługi mobilne, przyjeżdżając do klientek do domu. Jeśli masz pytania dotyczące lokalizacji lub potrzebujesz dodatkowych wskazówek dojazdu, możesz skontaktować się bezpośrednio ze stylistką przez telefon lub wiadomość prywatną. Warto sprawdzić lokalizację przed rezerwacją, aby upewnić się, że salon jest dla Ciebie dogodnie położony.",
    },
    {
      id: "change-city",
      question: "Czy mogę zmienić termin wizyty?",
      answer:
        "Tak, w większości przypadków możesz zmienić termin wizyty, jednak zasady dotyczące zmian i odwołań różnią się w zależności od polityki danej specjalistki. Szczegółowe informacje o możliwości zmiany terminu, wymaganym czasie wyprzedzenia oraz ewentualnych opłatach za odwołanie znajdziesz w potwierdzeniu rezerwacji oraz na profilu stylistki. Zazwyczaj zmiana terminu jest możliwa bez dodatkowych opłat, jeśli poinformujesz stylistkę z odpowiednim wyprzedzeniem (zwykle minimum 24-48 godzin przed wizytą). Odwołanie wizyty w ostatniej chwili może wiązać się z koniecznością uiszczenia częściowej opłaty lub pełnej kwoty za usługę, zgodnie z polityką salonu. W przypadku nagłych sytuacji losowych, większość stylistek jest elastyczna i stara się znaleźć rozwiązanie korzystne dla obu stron. Najlepiej skontaktować się bezpośrednio ze stylistką, aby omówić możliwość zmiany terminu.",
    },
  ];

  const allFaqItems = [...preVisitFaq, ...cityFaq];

  return (
    <div className="min-h-screen bg-white">
      {/* Comprehensive Schema Generator with LocalBusiness and BeautySalon */}
      <SchemaGenerator
        city={city}
        serviceType="manicure"
        users={sortedMergedUsers}
        faqItems={allFaqItems.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        }))}
      />
      {/* Hero Section */}
      <CityHero city={city} serviceType="manicure" />
      
      {/* Featured Salons Section */}
      {Array.isArray(sortedMergedUsers) && sortedMergedUsers.length > 0 && (
      <section
        className="py-20 px-6 bg-purple-50"
        itemScope
        itemType="https://schema.org/ItemList"
      >
        <div className="container mx-auto max-w-7xl text-center mb-10 md:mb-12">
          <h2 className="text-3xl lg:text-4xl font-baloo font-bold text-neutral-900 mb-3">
            <span itemProp="name">
              Najlepsze salony manicure w {city.name}
            </span>
          </h2>
          <p className="text-neutral-600 font-poppins max-w-2xl mx-auto" itemProp="description">
            Sprawdzone miejsca z najwyższymi ocenami klientek. Każdy salon przeszedł
            weryfikację jakości — zarezerwuj wizytę u specjalistek poniżej.
          </p>
        </div>
        <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 mb-10">
              {sortedMergedUsers.map((u: User) => (
                    <UserCard key={u.uid} user={u} cityParam={cityParam} />
              ))}
            </div>

            {/* AD Card */}
          <div className="grid grid-cols-1 gap-8">
              <div className="group bg-white h-max rounded-2xl transition-all duration-300 overflow-hidden animate-fade-in-up border border-primary-200 hover:shadow-lg">
                    <div className="md:grid md:grid-cols-12 gap-8 p-6 md:p-8 lg:p-10">
                      <div className="relative md:col-span-4 rounded-xl overflow-hidden bg-primary-50 flex items-center justify-center min-h-[220px] md:min-h-[260px] lg:min-h-[300px]">
                        <Image
                          src="/naily-logo2.png"
                          alt="Naily Logo"
                          fill
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          className="object-contain p-10 md:p-4 lg:p-12"
                        />
                      </div>
                      <div className="md:col-span-8 flex flex-col justify-between h-full">
                        <div className="flex flex-col gap-4">
                          <div className="mt-4 md:mt-0 mb-2 md:mb-4 flex flex-row items-start justify-between gap-3">
                            <h3 className="text-3xl font-baloo font-bold text-zinc-800 transition-colors">
                          Dla stylistek z Naily
                            </h3>
                            <span className="inline-flex items-center rounded-full bg-primary-50 text-blue-700 px-3.5 py-1.5 text-xs md:text-sm font-inter font-medium">
                          Miesiąc za darmo
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        {["Rezerwacje online", "Profesjonalny cennik", "Większa widoczność", "Nowe klientki", "Prowadzenie szkoleń", "0% prowizji"].map(
                              (feature: string, featureIndex: number) => (
                                <div
                                  key={featureIndex}
                                  className="flex items-center gap-2 text-sm text-neutral-700 font-inter font-normal leading-relaxed"
                                >
                              <span className="text-green-500">✓</span>
                                  <span>{feature}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                        <div className="mt-8 md:mt-10 lg:mt-0 flex flex-col gap-3">
                          <span className="text-xs md:text-sm text-neutral-500 font-inter font-normal pr-0 md:pr-12">
                        Promocja tylko dla pierwszych 10 specjalistek w Twoim mieście — zajmij miejsce zanim zniknie.
                          </span>
                          <div>
                            <JoinNowButton />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
          </div>
        </div>
        <meta itemProp="numberOfItems" content={String(sortedMergedUsers.length)} />
      </section>
      )}

      {/* Aggressive SEO Component 3: Service Area Map */}
      <ServiceAreaMap
        city={city}
        serviceType="manicure"
        nearbyCities={nearbyCities}
      />

      {/* Aggressive SEO Component 4: Review Rich Snippets */}
      {sortedMergedUsers.length > 0 && (
        <ReviewRichSnippets
          city={city}
          serviceType="manicure"
          users={sortedMergedUsers}
        />
      )}

      {/* Pricing Section */}
      <PricingSection pricingItems={manicurePricing} serviceType="manicure" />

      {/* Services Grid Sections */}
      {sortedMergedUsers.length > 0 && (
        <>
          <ServicesGridSection
            users={sortedMergedUsers}
            cityParam={cityParam}
            title={`Manicure hybrydowy ${city.name} – sprawdzone stylistki w 2026 roku`}
            sliceStart={0}
            sliceEnd={3}
          />
          {sortedMergedUsers.length > 3 && (
            <ServicesGridSection
              users={sortedMergedUsers}
              cityParam={cityParam}
              title={`Paznokcie hybrydowe ${city.name}`}
              sliceStart={3}
              sliceEnd={6}
            />
          )}
        </>
      )}

      {/* Pre-Visit FAQ Section */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="container">
          <FAQ className="animate-fade-in-up" items={preVisitFaq} />
        </div>
      </section>

      {/* City Overview Section */}
      <CityOverviewSection city={city} serviceType="manicure" />

      {/* Career & Training Section */}
      <CareerTrainingSection city={city} />

      {/* Nearby Cities Section */}
      <NearbyCitiesSection nearbyCities={nearbyCities} serviceType="manicure" />

      {/* Why Choose Section */}
      <WhyChooseSection />

      {/* Recent blog posts */}
      <RecentPosts
        limit={3}
        columns={3}
        className="bg-white"
        allowStaticFallback={false}
      />

{/* Aggressive SEO Component 1: Keyword-Rich Content */}
<KeywordRichContent
        city={city}
        serviceType="manicure"
        userCount={sortedMergedUsers.length}
      />
      {/* City FAQ */}
      <section className="py-20 px-6 bg-white">
        <div className="container">
        <FAQ className="animate-fade-in-up" items={cityFaq} />
      </div>
      </section>

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
  const canonicalUrl = `${baseUrl}/manicure/${cityData.id}`;
  const title = `Najlepszy Manicure ${cityData.name} Ceny`;
  const description = `Najlepsze stylistki i salony manicure ${cityData.name}. Cenniki, usługi i opinie. Sprawdzone miejsca z najwyższymi ocenami. Rezerwuj online.`;
  const keywords = `manicure ${cityData.name}, cennik manicure ${cityData.name}, najlepsze salony paznokci ${cityData.name}, stylistki paznokci ${cityData.name}, manicure hybrydowy ${cityData.name}, pedicure ${cityData.name}`;
  
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
          alt: `Manicure ${cityData.name}`,
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
          alt: `Manicure ${cityData.name}`,
        },
      ],
    },
    other: {
      "theme-color": "#1e40af",
    },
  };
}


