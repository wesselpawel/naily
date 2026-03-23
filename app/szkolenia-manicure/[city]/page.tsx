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
import { fetchTrainingOffersByCity } from "@/firebase";
import { TrainingOffer, User } from "@/types";
import TestimonialsCarousel from "@/components/Testimonials/Carousel";
import { getCityUsers } from "@/utils/getCityUsers";
import { getUsers as getAllUsers } from "@/utils/getUsers";
import { createLinkFromText } from "@/utils/createLinkFromText";
import UserCard from "@/components/CityPage/UserCard";
import TrainingKeywordRichContent from "@/components/CityPage/SEO/TrainingKeywordRichContent";
import TrainingCityHero from "@/components/CityPage/Sections/TrainingCityHero";

// Enable ISR: Revalidate every hour to keep training offers fresh while maintaining fast static pages
// Pages are generated on-demand (on first request) and then cached - no need to pre-generate all at build time
export const revalidate = 3600; // 1 hour

export default async function SzkoleniaCityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const cityParam = (await params).city;
  const city = await getSingleCity(cityParam);

  if (city?.error) {
    return <NotFound />;
  }

  const isAugustow = String(cityParam).toLowerCase() === "augustow";

  // Fetch training offers for this city
  const trainingOffers = await fetchTrainingOffersByCity(city.id) as TrainingOffer[];

  // Fetch users (instructors) who offer manicure courses
  const cityUsers = await getCityUsers(city.id);
  const allUsers = await getAllUsers() as User[];
  
  // Filter users by trainingType: "manicure" or "both"
  const instructorUsers = [
    ...cityUsers.filter((user: User) => {
      const trainingType = user.trainingType || "none";
      return (trainingType === "manicure" || trainingType === "both") && 
             Boolean(user?.configured) && 
             Boolean(user?.settings?.publicProfile ?? true);
    }),
    ...allUsers.filter((user: User) => {
      const trainingType = user.trainingType || "none";
      const hasNoCity = !user?.location?.address || user.location.address.trim() === "";
      return (trainingType === "manicure" || trainingType === "both") &&
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
      <TrainingCityHero
        city={city}
        serviceType="manicure"
        baseRoute="kursy-stylizacji-paznokci"
        lastUpdated="02.01.2026"
      />
     
        
          <section className="relative py-14 sm:py-16 lg:py-20 px-5 sm:px-8 lg:px-12 bg-gradient-to-b from-white via-violet-50/30 to-violet-100/50 overflow-hidden">
            <div className="absolute -top-20 -left-10 w-56 h-56 bg-violet-300/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 right-0 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl" />

            <div className="relative mx-auto max-w-[1600px] grid grid-cols-1 gap-8 lg:gap-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-stretch rounded-3xl border border-zinc-200/80 bg-white/90 backdrop-blur p-5 sm:p-8 shadow-[0_16px_50px_-28px_rgba(30,41,59,0.45)]">
                <div className="relative w-full min-h-[260px] sm:min-h-[330px] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
                  <Image
                    src="/resource/20.jpg"
                    alt="Kurs stylizacji paznokci w Augustów"
                    fill
                    priority
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center">
                 
                  <h2 className="mt-4 font-baloo text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
                    Kurs stylizacji paznokci {city.name} - program i szkolenia manicure
                  </h2>
                  <p className="mt-4 text-base sm:text-lg text-neutral-600 font-poppins leading-relaxed">
                    Szukasz <b>kursu stylizacji paznokci</b> w {city.name}? Na naszej stronie znajdziesz <b>kursy i szkolenia manicure</b> (w tym <b>manicure
                    hybrydowy</b>) prowadzone przez sprawdzone instruktorki. Sprawdź <b>ile kosztuje kurs stylizacji paznokci w {city.name}</b>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-stretch rounded-3xl border border-violet-200/70 bg-gradient-to-r from-violet-50/70 to-white p-5 sm:p-8 shadow-[0_16px_50px_-28px_rgba(124,58,237,0.45)]">
                <div className="relative w-full min-h-[260px] sm:min-h-[330px] overflow-hidden rounded-2xl border border-violet-200 bg-violet-100">
                  <Image
                    src="/resource/6.jpg"
                    alt="Najczęściej wybierane szkolenia w Augustów"
                    fill
                    priority
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  
                  <h2 className="mt-4 font-baloo text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight">
                    Najczęściej wybierane szkolenia manicure w {city.name}
                  </h2>
                  <ul className="mt-5 space-y-3">
                    <li className="flex gap-3">
                      <span className="mt-0.5 h-6 w-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        ✓
                      </span>
                      <span className="text-base text-neutral-700 font-poppins leading-relaxed">
                        <b>Kurs manicure klasyczny {city.name}</b> - podstawy pracy, przygotowanie płytki i pierwsze stylizacje.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-0.5 h-6 w-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        ✓
                      </span>
                      <span className="text-base text-neutral-700 font-poppins leading-relaxed">
                        <b>Szkolenie manicure hybrydowy {city.name}</b> - trwałość, aplikacja i praca krok po kroku.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-0.5 h-6 w-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        ✓
                      </span>
                      <span className="text-base text-neutral-700 font-poppins leading-relaxed">
                        <b>Kurs stylizacji i zdobień {city.name}</b> - trendy, wzory i dobór produktów.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        
      <section className="pb-20 px-6 bg-purple-50">
        <div className="container">
        

          {/* Instructors Section */}
          {sortedInstructors.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl lg:text-4xl font-baloo font-bold text-neutral-900 mb-6">
                Instruktorki manicure {city.name}
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
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-100 via-blue-50 to-violet-100">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-[1600px]">
          <div className="px-5 sm:px-8 lg:px-12 text-center mb-10 sm:mb-12 lg:mb-14">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/80 backdrop-blur border border-white shadow-md mb-4 sm:mb-6">
              <FaChartLine className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-baloo font-bold text-zinc-800 mb-4 leading-tight">
              Ile zarobisz po kursie manicure?
            </h2>
            <p className="text-base sm:text-lg text-zinc-700 font-poppins max-w-3xl mx-auto leading-relaxed">
              Realne widełki dochodów po kursie to od 2 000 do 12 000 zł miesięcznie - w zależności od doświadczenia, liczby klientek i dodatkowych usług.
            </p>
          </div>

          <div className="px-5 sm:px-8 lg:px-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
            <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur p-4 text-center shadow-sm">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Średni koszt usług</p>
              <p className="text-2xl font-baloo font-bold text-zinc-800 mt-1">80-200 zł</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur p-4 text-center shadow-sm">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Próg zwrotu kursu</p>
              <p className="text-2xl font-baloo font-bold text-zinc-800 mt-1">1-2 mies.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur p-4 text-center shadow-sm">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Potencjał miesięczny</p>
              <p className="text-2xl font-baloo font-bold text-zinc-800 mt-1">2k-12k zł</p>
            </div>
          </div>

          <div className="px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="group rounded-3xl p-[1px] bg-gradient-to-b from-green-300/70 to-emerald-500/60">
              <div className="h-full rounded-3xl bg-white/95 backdrop-blur p-6 sm:p-8 shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <FaDollarSign className="text-xl text-green-600" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-baloo font-bold text-zinc-800">
                      Początkująca stylistka
                    </h3>
                  </div>
                  <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    START
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
                  2 000 - 4 000 zł
                </div>
                <p className="text-sm sm:text-base text-zinc-600 font-poppins mb-5">
                  miesięcznie przy 15-25 klientkach
                </p>
                <ul className="space-y-2.5 text-sm text-zinc-700">
                  <li className="flex items-start gap-2">
                    <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                    <span>Manicure klasyczny: 50-80 zł</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                    <span>Manicure hybrydowy: 80-120 zł</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                    <span>Praca w salonie lub mobilnie</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="group rounded-3xl p-[1px] bg-gradient-to-b from-blue-300 to-blue-600 shadow-xl">
              <div className="relative h-full rounded-3xl bg-gradient-to-b from-white to-blue-50/80 p-6 sm:p-8 transition-transform duration-300 group-hover:-translate-y-1">
                
                <div className="flex items-center gap-3 mb-5 mt-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FaChartLine className="text-xl text-blue-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-baloo font-bold text-zinc-800">
                    Doświadczona stylistka
                  </h3>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                  4 000 - 6 000 zł
                </div>
                <p className="text-sm sm:text-base text-zinc-600 font-poppins mb-5">
                  miesięcznie przy 30-40 klientkach
                </p>
                <ul className="space-y-2.5 text-sm text-zinc-700">
                  <li className="flex items-start gap-2">
                    <FaCheck className="text-blue-500 mt-1 flex-shrink-0" />
                    <span>Przedłużanie paznokci: 120-200 zł</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheck className="text-blue-500 mt-1 flex-shrink-0" />
                    <span>Zdobienia i wzory: +20-50 zł</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheck className="text-blue-500 mt-1 flex-shrink-0" />
                    <span>Stałe klientki i rezerwacje</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="group rounded-3xl p-[1px] bg-gradient-to-b from-purple-300/70 to-violet-500/70">
              <div className="h-full rounded-3xl bg-white/95 backdrop-blur p-6 sm:p-8 shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FaStar className="text-xl text-purple-600" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-baloo font-bold text-zinc-800">
                      Ekspertka / Instruktorka
                    </h3>
                  </div>
                  <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                    PRO
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">
                  6 000 - 12 000 zł
                </div>
                <p className="text-sm sm:text-base text-zinc-600 font-poppins mb-5">
                  miesięcznie + prowadzenie szkoleń
                </p>
                <ul className="space-y-2.5 text-sm text-zinc-700">
                  <li className="flex items-start gap-2">
                    <FaCheck className="text-purple-500 mt-1 flex-shrink-0" />
                    <span>Własny salon lub studio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheck className="text-purple-500 mt-1 flex-shrink-0" />
                    <span>Prowadzenie kursów: 500-2000 zł</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheck className="text-purple-500 mt-1 flex-shrink-0" />
                    <span>Premium klientki i eventy</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Is It Worth It Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-6 bg-gradient-to-b from-white via-slate-50/60 to-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-12">
            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wide uppercase">
              Analiza opłacalności
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-baloo font-bold text-zinc-800 leading-tight">
              Czy warto robić kurs manicure w {city.name} w 2026?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-zinc-600 font-poppins max-w-3xl mx-auto leading-relaxed">
              Branża beauty w Polsce rozwija się dynamicznie. Zapotrzebowanie na profesjonalne usługi manicure rośnie każdego roku.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="rounded-3xl p-[1px] bg-gradient-to-b from-blue-200 to-cyan-300 shadow-[0_16px_50px_-28px_rgba(14,116,144,0.45)]">
              <div className="h-full rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 sm:p-8 border border-blue-100">
                <h3 className="text-xl sm:text-2xl font-baloo font-bold text-zinc-800 mb-5 flex items-center gap-3">
                  <span className="inline-flex w-11 h-11 rounded-xl bg-white text-green-600 items-center justify-center shadow-sm">
                    <FaCheck className="text-2xl" />
                  </span>
                  Zalety kursu manicure
                </h3>
                <ul className="space-y-4 text-sm sm:text-base text-zinc-700 font-poppins">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Stabilne zarobki:</strong> Średnia pensja stylistki paznokci to 3500-5000 zł miesięcznie</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Elastyczne godziny:</strong> Możliwość pracy w salonie lub mobilnie</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Rozwój kariery:</strong> Możliwość otwarcia własnego salonu lub prowadzenia szkoleń</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Kreatywna praca:</strong> Codzienna możliwość tworzenia unikalnych stylizacji</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Niski próg wejścia:</strong> Kurs trwa zwykle 2-5 dni, kosztuje 800-2500 zł</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-3xl p-[1px] bg-gradient-to-b from-violet-200 to-fuchsia-300 shadow-[0_16px_50px_-28px_rgba(124,58,237,0.45)]">
              <div className="h-full rounded-3xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 sm:p-8 border border-violet-100">
                <h3 className="text-xl sm:text-2xl font-baloo font-bold text-zinc-800 mb-5 flex items-center gap-3">
                  <span className="inline-flex w-11 h-11 rounded-xl bg-white text-purple-600 items-center justify-center shadow-sm">
                    <FaChartLine className="text-2xl" />
                  </span>
                  Czas zwrotu inwestycji
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-violet-200/70 shadow-sm">
                    <div className="text-sm text-zinc-500 mb-1">Koszt kursu</div>
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600">800 - 2 500 zł</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-violet-200/70 shadow-sm">
                    <div className="text-sm text-zinc-500 mb-1">Średni zarobek miesięczny</div>
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600">3 500 - 5 000 zł</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 rounded-xl p-4 sm:p-5 text-white shadow-md">
                    <div className="text-sm mb-1 opacity-90">Zwrot inwestycji</div>
                    <div className="text-3xl font-bold leading-tight">1-2 miesiące</div>
                    <div className="text-sm mt-1 opacity-80">Przy pracy z 20-30 klientkami miesięcznie</div>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 mt-4 font-poppins">
                  * Kalkulacja oparta na średnich cenach kursów i zarobków stylistek w Polsce w 2026 roku
                </p>
              </div>
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
              Opinie absolwentek kursów manicure
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 font-poppins max-w-3xl mx-auto leading-relaxed">
              Zobacz, co mówią stylistki, które ukończyły kursy manicure i już pracują w zawodzie
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
                href={`/kursy-stylizacji-paznokci/${c.id}`}
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
    title: `Kurs stylizacji paznokci ${cityData.name} - Ile kosztuje?`,
    description: `Kurs stylizacji paznokci ${cityData.name}. Ile kosztuje kurs manicure i szkolenie ${cityData.name}? Sprawdź terminy, cennik i opinie absolwentek.`,
    keywords: `kurs stylizacji paznokci ${cityData.name}, kurs stylizacji paznokci ${cityData.name} 2026, kurs manicure ${cityData.name}, szkolenia manicure ${cityData.name}, szkolenie hybryda ${cityData.name}, manicure ${cityData.name}, manicure hybrydowy ${cityData.name}, cennik kurs manicure ${cityData.name}, ile kosztuje kurs stylizacji paznokci ${cityData.name}, salon manicure ${cityData.name}, opinie absolwentek kursów manicure`,
    openGraph: {
      type: "website",
      title: `Kurs stylizacji paznokci ${cityData.name} 2026`,
      description: `Kurs stylizacji paznokci ${cityData.name} 2026: cennik, szkolenia manicure hybryda i opinie absolwentek.`,
      siteName: "Naily",
      url: `${baseUrl}/kursy-stylizacji-paznokci/${cityData.id}`,
    },
    alternates: {
      canonical: `${baseUrl}/kursy-stylizacji-paznokci/${cityData.id}`,
    },
  };
}

function getSzkoleniaFaq(cityName: string): FaqItem[] {
  return [
    {
      id: "szkolenia-booking",
      question: `Jak zapisać się na szkolenie w ${cityName}?`,
      answer:
        "Skontaktuj się bezpośrednio z instruktorem/instruktorką poprzez podany kontakt email lub telefon. Większość szkoleń wymaga wcześniejszej rezerwacji. Możesz również zarezerwować miejsce przez platformę Naily, gdzie znajdziesz dostępne terminy i szczegóły każdego kursu.",
    },
    {
      id: "szkolenia-price",
      question: `Ile kosztuje kurs stylizacji paznokci w ${cityName}?`,
      answer:
        "Ceny kursów manicure w 2026 roku wahają się od 800 do 2500 złotych, w zależności od instruktora, długości kursu i zakresu materiału. Kurs podstawowy z manicure klasycznym kosztuje zwykle 800-1200 zł, kurs z manicure hybrydowym 1200-1800 zł, a kompleksowy kurs z przedłużaniem paznokci 1800-2500 zł. Szczegóły znajdziesz w opisie każdego szkolenia.",
    },
    {
      id: "szkolenia-certificate",
      question: `Czy kurs manicure w ${cityName} kończy się certyfikatem?`,
      answer:
        "Tak, większość profesjonalnych szkoleń kończy się wydaniem certyfikatu ukończenia kursu. Certyfikat potwierdza Twoje umiejętności i może być pomocny przy szukaniu pracy w salonach lub przy otwieraniu własnej działalności. Niektóre kursy oferują również certyfikaty międzynarodowe. Szczegóły dotyczące certyfikacji znajdziesz w opisie szkolenia.",
    },
    {
      id: "szkolenia-level",
      question: `Jakie są wymagania wstępne do kursu manicure w ${cityName}?`,
      answer:
        "Większość kursów podstawowych nie wymaga żadnego wcześniejszego doświadczenia - są przeznaczone dla początkujących. Kursy zaawansowane mogą wymagać ukończenia kursu podstawowego lub posiadania już pewnego doświadczenia w pracy z paznokciami. Sprawdź sekcję 'Wymagania' w opisie szkolenia, aby upewnić się, że kurs jest odpowiedni dla Twojego poziomu.",
    },
    {
      id: "szkolenia-earnings",
      question: `Ile zarobię po ukończeniu kursu manicure w ${cityName}?`,
      answer:
        "Zarobki po kursie manicure zależą od wielu czynników: liczby klientek, lokalizacji, doświadczenia i oferowanych usług. Początkujące stylistki zarabiają zwykle 2000-4000 zł miesięcznie przy 15-25 klientkach. Doświadczone stylistki z 30-40 klientkami mogą zarabiać 4000-6000 zł miesięcznie. Instruktorki prowadzące własne szkolenia mogą zarabiać 6000-12000 zł miesięcznie. Zwrot z inwestycji w kurs następuje zwykle po 1-2 miesiącach pracy.",
    },
    {
      id: "szkolenia-worth",
      question: `Czy warto robić kurs manicure w ${cityName} w 2026?`,
      answer:
        "Tak, zdecydowanie warto! Branża beauty w Polsce rozwija się dynamicznie, a zapotrzebowanie na profesjonalne usługi manicure rośnie każdego roku. Kurs manicure to inwestycja (800-2500 zł), która zwraca się zwykle po 1-2 miesiącach pracy. To elastyczna praca z możliwością rozwoju kariery - od pracy w salonie, przez własne studio, aż po prowadzenie szkoleń. W 2026 roku kursy z manicure hybrydowym i przedłużaniem paznokci są szczególnie poszukiwane.",
    },
  ];
}

