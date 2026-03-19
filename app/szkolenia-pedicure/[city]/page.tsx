import NotFound from "@/app/not-found";
import JoinNowButton from "@/components/AdCard/JoinNowButton";
import Link from "next/link";
import { ICity } from "@/types";
import { getSingleCity } from "@/utils/getSingleCity";
import { getCities } from "@/utils/getCities";
import { Viewport } from "next";
import Image from "next/image";
import FAQ, { type FaqItem } from "@/components/FAQ/FAQ";
import { FaCheck, FaMapMarkerAlt, FaClock, FaUser, FaCertificate, FaChartLine, FaDollarSign, FaGraduationCap, FaStar } from "react-icons/fa";
import Logic from "@/components/SearchBar/Logic";
import { fetchTrainingOffersByCity } from "@/firebase";
import { TrainingOffer, User } from "@/types";
import TestimonialsCarousel from "@/components/Testimonials/Carousel";
import { getCityUsers } from "@/utils/getCityUsers";
import { getUsers as getAllUsers } from "@/utils/getUsers";
import UserCard from "@/components/CityPage/UserCard";
import TrainingKeywordRichContent from "@/components/CityPage/SEO/TrainingKeywordRichContent";

// Enable ISR: Revalidate every hour to keep training offers fresh while maintaining fast static pages
// Pages are generated on-demand (on first request) and then cached - no need to pre-generate all at build time
export const revalidate = 3600; // 1 hour

export default async function SzkoleniaPedicureCityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const cityParam = (await params).city;
  const city = await getSingleCity(cityParam);

  if (city?.error) {
    return <NotFound />;
  }

  // Fetch training offers for this city
  const trainingOffers = await fetchTrainingOffersByCity(city.id) as TrainingOffer[];

  // Fetch users (instructors) who offer pedicure courses
  const cityUsers = await getCityUsers(city.id);
  const allUsers = await getAllUsers() as User[];
  
  // Filter users by trainingType: "pedicure" or "both"
  const instructorUsers = [
    ...cityUsers.filter((user: User) => {
      const trainingType = user.trainingType || "none";
      return (trainingType === "pedicure" || trainingType === "both") && 
             Boolean(user?.configured) && 
             Boolean(user?.settings?.publicProfile ?? true);
    }),
    ...allUsers.filter((user: User) => {
      const trainingType = user.trainingType || "none";
      const hasNoCity = !user?.location?.address || user.location.address.trim() === "";
      return (trainingType === "pedicure" || trainingType === "both") &&
             hasNoCity &&
             Boolean(user?.configured) && 
             Boolean(user?.settings?.publicProfile ?? true);
    }).map((user: User) => ({
      ...user,
      location: {
        ...user.location,
        address: city.name,
      },
    })),
  ];

  // Sort instructors by priorityLevel
  const sortedInstructors = instructorUsers.sort((a: User, b: User) => {
    const priorityA = a.priorityLevel ?? 0;
    const priorityB = b.priorityLevel ?? 0;
    if (priorityB !== priorityA) {
      return priorityB - priorityA;
    }
    return (a.name || "").localeCompare(b.name || "");
  });

  // Get nearby cities (excluding villages)
  const allCities: ICity[] = await getCities();
  const citiesOnly = allCities.filter((c) => c.type === "city");
  const nearbyCities = citiesOnly
    .filter((c) => c.id !== city.id)
    .slice(0, 18);

  // Add promotional AD
  const offersWithAd: (TrainingOffer | { isAd: boolean })[] = [
    ...trainingOffers,
    {
      isAd: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Featured Training Offers Section */}
      <section className="pb-20 px-6 bg-purple-50">
        <div className="container">
          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-baloo font-bold text-black mb-4">
              Kursy i szkolenia pedicure {city.name} 2026
            </h1>
            <p className="text-gray-500 font-poppins font-normal text-base sm:text-lg">
              Profesjonalne szkolenia i kursy z pedicure w {city.name}. Ile kosztuje kurs stylizacji paznokci w{" "}
              {city.name}? Sprawdź cennik szkoleń pedicure i rozwijaj swoje umiejętności pod okiem doświadczonych instruktorek.
            </p>
            <p className="text-gray-500 font-poppins text-sm mt-3">Ostatnia aktualizacja: 02.01.2026</p>
            <div className="mt-6">
              <Logic slugCity={city.name} variant="inline" baseRoute="kursy-pedicure" />
            </div>
          </div>

          <TrainingKeywordRichContent
            city={city}
            serviceType="pedicure"
            userCount={sortedInstructors.length}
          />

          {/* Instructors Section */}
          {sortedInstructors.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl lg:text-4xl font-baloo font-bold text-neutral-900 mb-6">
                Instruktorki pedicure {city.name}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8">
                {sortedInstructors.map((instructor: User) => (
                  <UserCard key={instructor.uid} user={instructor} cityParam={city.id} />
                ))}
              </div>
            </div>
          )}

          {/* Training Offers List */}
          {trainingOffers.length > 0 && (
            <div className="flex flex-col gap-6 md:gap-8 mb-10">
              {trainingOffers.map((offer: TrainingOffer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl p-6 md:p-8 lg:p-10 border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="md:grid md:grid-cols-12 gap-8">
                    {offer.image && (
                      <div className="relative md:col-span-4 rounded-xl overflow-hidden bg-primary-50 flex items-center justify-center min-h-[220px] md:min-h-[260px]">
                        <Image
                          src={offer.image}
                          alt={offer.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className={`${offer.image ? "md:col-span-8" : "md:col-span-12"} flex flex-col justify-between`}>
                      <div>
                        <div className="flex flex-row items-start justify-between gap-3 mb-4">
                          <h3 className="text-3xl font-baloo font-bold text-zinc-800">
                            {offer.title}
                          </h3>
                          {offer.price > 0 && (
                            <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3.5 py-1.5 text-sm font-inter font-medium">
                              {offer.price} PLN
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-700 font-poppins mb-4">
                          {offer.description}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-4">
                          {offer.duration && (
                            <div className="flex items-center gap-2 text-sm text-neutral-700 font-inter">
                              <FaClock className="text-blue-500" />
                              <span>{offer.duration} godzin</span>
                            </div>
                          )}
                          {offer.instructor && (
                            <div className="flex items-center gap-2 text-sm text-neutral-700 font-inter">
                              <FaUser className="text-blue-500" />
                              <span>{offer.instructor}</span>
                            </div>
                          )}
                          {offer.maxParticipants && (
                            <div className="flex items-center gap-2 text-sm text-neutral-700 font-inter">
                              <FaUser className="text-blue-500" />
                              <span>Max {offer.maxParticipants} uczestników</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-neutral-700 font-inter">
                            <FaMapMarkerAlt className="text-blue-500" />
                            <span>{city.name}</span>
                          </div>
                        </div>
                        {offer.whatYouWillLearn && offer.whatYouWillLearn.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-bold text-lg mb-2">Czego się nauczysz:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {offer.whatYouWillLearn.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-neutral-700">
                                  <FaCheck className="text-green-500" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {offer.requirements && offer.requirements.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-bold text-lg mb-2">Wymagania:</h4>
                            <ul className="list-disc list-inside text-sm text-neutral-700">
                              {offer.requirements.map((req, idx) => (
                                <li key={idx}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {(offer.contactEmail || offer.contactPhone) && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <p className="text-sm text-neutral-600 mb-2">Kontakt:</p>
                          {offer.contactEmail && (
                            <a href={`mailto:${offer.contactEmail}`} className="text-blue-600 hover:underline">
                              {offer.contactEmail}
                            </a>
                          )}
                          {offer.contactPhone && (
                            <a href={`tel:${offer.contactPhone}`} className="text-blue-600 hover:underline ml-4">
                              {offer.contactPhone}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Promotion AD Card */}
          <div className="grid grid-cols-1 gap-8">
            <div className="group bg-white h-max rounded-2xl transition-all duration-300 overflow-hidden animate-fade-in-up border border-primary-200 hover:shadow-lg">
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
                        Prowadź szkolenia z Naily
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-primary-50 text-blue-700 px-3.5 py-1.5 text-xs md:text-sm font-inter font-medium">
                        Miesiąc za darmo
                      </span>
                    </div>

                    {/* AD Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      {[
                        "Rezerwacje online",
                        "Profesjonalny cennik",
                        "Większa widoczność",
                        "Prowadzenie szkoleń",
                        "Zarządzanie uczestnikami",
                        "0% prowizji",
                      ].map((feature: string, featureIndex: number) => (
                        <div
                          key={featureIndex}
                          className="flex items-center gap-2 text-sm text-neutral-700 font-inter font-normal leading-relaxed"
                        >
                          <FaCheck className="text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-8 md:mt-10 lg:mt-0 flex flex-col gap-3">
                    <span className="text-xs md:text-sm text-neutral-500 font-inter font-normal pr-0 md:pr-12">
                      Promocja tylko dla pierwszych 10 instruktorek w Twoim mieście — zajmij miejsce zanim zniknie.
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
      </section>

      {/* Earnings Potential Section */}
      <section className="py-16 sm:py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-200/50 mb-4 sm:mb-6">
              <FaChartLine className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-baloo font-bold text-zinc-800 mb-4 leading-tight">
              Ile zarobisz po kursie pedicure?
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 font-poppins max-w-3xl mx-auto leading-relaxed">
              Po ukończeniu profesjonalnego kursu pedicure możesz zarabiać od 2500 do 9000 zł miesięcznie, w zależności od liczby klientek i lokalizacji.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-green-200/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaDollarSign className="text-xl text-green-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-baloo font-bold text-zinc-800">
                  Początkująca stylistka
                </h3>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
                2 500 - 4 500 zł
              </div>
              <p className="text-sm sm:text-base text-zinc-600 font-poppins mb-4">
                miesięcznie przy 15-25 klientkach
              </p>
              <ul className="space-y-2 text-sm text-zinc-700">
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Pedicure klasyczny: 60-100 zł</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Pedicure hybrydowy: 100-150 zł</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Praca w salonie lub mobilnie</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-blue-300 relative">
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-xl text-blue-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-baloo font-bold text-zinc-800">
                  Doświadczona stylistka
                </h3>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                4 500 - 7 000 zł
              </div>
              <p className="text-sm sm:text-base text-zinc-600 font-poppins mb-4">
                miesięcznie przy 30-45 klientkach
              </p>
              <ul className="space-y-2 text-sm text-zinc-700">
                <li className="flex items-start gap-2">
                  <FaCheck className="text-blue-500 mt-1 flex-shrink-0" />
                  <span>Pedicure z zabiegami: 150-250 zł</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-blue-500 mt-1 flex-shrink-0" />
                  <span>Peeling, masaż, parafina: +50-100 zł</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-blue-500 mt-1 flex-shrink-0" />
                  <span>Stałe klientki i rezerwacje</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-purple-200/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaStar className="text-xl text-purple-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-baloo font-bold text-zinc-800">
                  Ekspertka / Instruktorka
                </h3>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">
                7 000 - 15 000 zł
              </div>
              <p className="text-sm sm:text-base text-zinc-600 font-poppins mb-4">
                miesięcznie + prowadzenie szkoleń
              </p>
              <ul className="space-y-2 text-sm text-zinc-700">
                <li className="flex items-start gap-2">
                  <FaCheck className="text-purple-500 mt-1 flex-shrink-0" />
                  <span>Własny salon lub studio</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-purple-500 mt-1 flex-shrink-0" />
                  <span>Prowadzenie kursów: 600-2500 zł</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-purple-500 mt-1 flex-shrink-0" />
                  <span>Premium klientki i eventy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Is It Worth It Section */}
      <section className="py-16 sm:py-20 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-baloo font-bold text-zinc-800 mb-4 leading-tight">
              Czy warto robić kurs pedicure w {city.name} w 2026?
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 font-poppins max-w-3xl mx-auto leading-relaxed">
              Branża beauty w Polsce rozwija się dynamicznie. Zapotrzebowanie na profesjonalne usługi pedicure rośnie każdego roku, szczególnie w sezonie letnim.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-blue-200">
              <h3 className="text-xl sm:text-2xl font-baloo font-bold text-zinc-800 mb-4 flex items-center gap-3">
                <FaCheck className="text-green-600 text-2xl" />
                Zalety kursu pedicure
              </h3>
              <ul className="space-y-3 text-sm sm:text-base text-zinc-700 font-poppins">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Wyższe zarobki:</strong> Średnia pensja stylistki pedicure to 4000-6000 zł miesięcznie</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Sezonowość:</strong> Większe zapotrzebowanie w sezonie letnim (maj-wrzesień)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Rozwój kariery:</strong> Możliwość otwarcia własnego salonu lub prowadzenia szkoleń</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Kreatywna praca:</strong> Codzienna możliwość tworzenia unikalnych stylizacji stóp</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Niski próg wejścia:</strong> Kurs trwa zwykle 2-5 dni, kosztuje 1000-2800 zł</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-purple-200">
              <h3 className="text-xl sm:text-2xl font-baloo font-bold text-zinc-800 mb-4 flex items-center gap-3">
                <FaChartLine className="text-purple-600 text-2xl" />
                Czas zwrotu inwestycji
              </h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="text-sm text-zinc-600 mb-1">Koszt kursu</div>
                  <div className="text-2xl font-bold text-purple-600">1 000 - 2 800 zł</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="text-sm text-zinc-600 mb-1">Średni zarobek miesięczny</div>
                  <div className="text-2xl font-bold text-purple-600">4 000 - 6 000 zł</div>
                </div>
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 text-white">
                  <div className="text-sm mb-1 opacity-90">Zwrot inwestycji</div>
                  <div className="text-2xl font-bold">1-2 miesiące</div>
                  <div className="text-sm mt-1 opacity-80">Przy pracy z 20-30 klientkami miesięcznie</div>
                </div>
              </div>
              <p className="text-sm text-zinc-600 mt-4 font-poppins">
                * Kalkulacja oparta na średnich cenach kursów i zarobków stylistek w Polsce w 2026 roku
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Graduate Testimonials Section */}
      <section className="py-16 sm:py-20 px-6 bg-gradient-to-b from-white via-slate-50/50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-200/50 mb-4 sm:mb-6">
              <FaGraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-baloo font-bold text-zinc-800 mb-4 leading-tight">
              Opinie absolwentek kursów pedicure
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 font-poppins max-w-3xl mx-auto leading-relaxed">
              Zobacz, co mówią stylistki, które ukończyły kursy pedicure i już pracują w zawodzie
            </p>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* Nearby Cities Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container">
          <h3 className="mb-20 text-4xl lg:text-5xl font-baloo font-bold text-neutral-900">
            Szukaj też w innych miastach
          </h3>
          <div className="flex flex-wrap gap-6">
            {nearbyCities.map((c) => (
              <Link
                key={c.id}
                href={`/kursy-pedicure/${c.id}`}
                className="group py-3 relative w-max text-xl text-black hover:border-blue-800 hover:text-blue-800"
              >
                {`Szkolenia ${c.name}`}
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-blue-800 group-hover:h-[6px] duration-100 rounded-full"></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <div className="py-20">
        <FAQ className="animate-fade-in-up" items={getSzkoleniaFaq(city.name)} />
      </div>
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
}) {
  const { city } = await params;
  const cityData: ICity = await getSingleCity(city);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://naily.pl";
  return {
    title: `Kurs pedicure ${cityData.name} 2026 - szkolenia pedicure hybryda`,
    description: `Kurs pedicure ${cityData.name} 2026. Ile kosztuje kurs stylizacji paznokci i szkolenie hybryda w ${cityData.name}? Sprawdź terminy, cennik i opinie absolwentek.`,
    keywords: `kurs pedicure ${cityData.name}, kurs pedicure ${cityData.name} 2026, szkolenie pedicure ${cityData.name}, szkolenia pedicure ${cityData.name}, szkolenie hybryda ${cityData.name}, pedicure ${cityData.name}, pedicure hybrydowy ${cityData.name}, cennik pedicure ${cityData.name}, ile kosztuje kurs stylizacji paznokci ${cityData.name}, szkolenie pedicure kosmetyczny ${cityData.name}, salon pedicure ${cityData.name}, opinie absolwentek kursów pedicure`,
    openGraph: {
      type: "website",
      title: `Kurs pedicure ${cityData.name} 2026`,
      description: `Kurs pedicure ${cityData.name} 2026: cennik, szkolenia pedicure hybryda i opinie absolwentek.`,
      siteName: "Naily",
      url: `${baseUrl}/kursy-pedicure/${cityData.id}`,
    },
    alternates: {
      canonical: `${baseUrl}/kursy-pedicure/${cityData.id}`,
    },
  };
}

function getSzkoleniaFaq(cityName: string): FaqItem[] {
  return [
    {
      id: "szkolenia-booking",
      question: `Jak zapisać się na szkolenie w ${cityName}?`,
      answer:
        "Skontaktuj się bezpośrednio z instruktorem/instruktorką poprzez podany kontakt email lub telefon. Większość szkoleń wymaga wcześniejszej rezerwacji. Możesz również zarezerwować miejsce przez platformę Naily, gdzie znajdziesz dostępne terminy i szczegóły każdego kursu pedicure.",
    },
    {
      id: "szkolenia-price",
      question: `Ile kosztuje kurs stylizacji paznokci w ${cityName}?`,
      answer:
        "Ceny kursów pedicure w 2026 roku wahają się od 1000 do 2800 złotych, w zależności od instruktora, długości kursu i zakresu materiału. Kurs podstawowy z pedicure klasycznym kosztuje zwykle 1000-1500 zł, kurs z pedicure hybrydowym 1500-2200 zł, a kompleksowy kurs z dodatkowymi zabiegami pielęgnacyjnymi (peeling, masaż, parafina) 2200-2800 zł. Szczegóły znajdziesz w opisie każdego szkolenia.",
    },
    {
      id: "szkolenia-certificate",
      question: `Czy kurs pedicure w ${cityName} kończy się certyfikatem?`,
      answer:
        "Tak, większość profesjonalnych szkoleń kończy się wydaniem certyfikatu ukończenia kursu. Certyfikat potwierdza Twoje umiejętności i może być pomocny przy szukaniu pracy w salonach lub przy otwieraniu własnej działalności. Niektóre kursy oferują również certyfikaty międzynarodowe. Szczegóły dotyczące certyfikacji znajdziesz w opisie szkolenia.",
    },
    {
      id: "szkolenia-level",
      question: `Jakie są wymagania wstępne do kursu pedicure w ${cityName}?`,
      answer:
        "Większość kursów podstawowych nie wymaga żadnego wcześniejszego doświadczenia - są przeznaczone dla początkujących. Kursy zaawansowane mogą wymagać ukończenia kursu podstawowego lub posiadania już pewnego doświadczenia w pracy z paznokciami. Sprawdź sekcję 'Wymagania' w opisie szkolenia, aby upewnić się, że kurs jest odpowiedni dla Twojego poziomu.",
    },
    {
      id: "szkolenia-earnings",
      question: `Ile zarobię po ukończeniu kursu pedicure w ${cityName}?`,
      answer:
        "Zarobki po kursie pedicure zależą od wielu czynników: liczby klientek, lokalizacji, doświadczenia i oferowanych usług. Początkujące stylistki zarabiają zwykle 2500-4500 zł miesięcznie przy 15-25 klientkach. Doświadczone stylistki z 30-45 klientkami mogą zarabiać 4500-7000 zł miesięcznie. Instruktorki prowadzące własne szkolenia mogą zarabiać 7000-15000 zł miesięcznie. Zwrot z inwestycji w kurs następuje zwykle po 1-2 miesiącach pracy. W sezonie letnim zarobki mogą być nawet o 30-50% wyższe.",
    },
    {
      id: "szkolenia-worth",
      question: `Czy warto robić kurs pedicure w ${cityName} w 2026?`,
      answer:
        "Tak, zdecydowanie warto! Branża beauty w Polsce rozwija się dynamicznie, a zapotrzebowanie na profesjonalne usługi pedicure rośnie każdego roku, szczególnie w sezonie letnim (maj-wrzesień). Kurs pedicure to stosunkowo niska inwestycja (1000-2800 zł), która zwraca się już po 1-2 miesiącach pracy. To elastyczna praca z możliwością rozwoju kariery - od pracy w salonie, przez własne studio, aż po prowadzenie szkoleń. W 2026 roku stylistki pedicure są bardzo poszukiwane, szczególnie te z umiejętnościami w pedicure hybrydowym i zabiegach pielęgnacyjnych stóp.",
    },
  ];
}





