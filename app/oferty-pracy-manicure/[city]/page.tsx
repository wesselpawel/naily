import Link from "next/link";
import { ICity } from "@/types";
import { getSingleCity } from "@/utils/getSingleCity";
import { getCities } from "@/utils/getCities";
import { Viewport } from "next";
import { notFound } from "next/navigation";
import FAQ, { type FaqItem } from "@/components/FAQ/FAQ";
import { FaMapMarkerAlt, FaBriefcase, FaEnvelope, FaPhone } from "react-icons/fa";
import Logic from "@/components/SearchBar/Logic";
import { fetchJobOffersByCity } from "@/firebase";
import { JobOffer } from "@/types";
import { getUserById } from "@/firebase";

export const revalidate = 3600;

export default async function OfertyPracyManicureCityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const cityParam = (await params).city;
  const city = await getSingleCity(cityParam);

  if (city?.error) {
    notFound();
  }

  const jobOffers = (await fetchJobOffersByCity(city.id)) as JobOffer[];

  const jobOffersWithSalonDetails = await Promise.all(
    jobOffers.map(async (offer: JobOffer) => {
      if (offer.salonId) {
        try {
          const salon = (await getUserById(offer.salonId)) as {
            logo?: string;
            description?: string;
          } | null;
          return {
            ...offer,
            salonLogo: salon?.logo,
            salonDescription: salon?.description,
          };
        } catch {
          return offer;
        }
      }
      return offer;
    })
  );

  const allCities: ICity[] = await getCities();
  const citiesOnly = allCities.filter((c) => c.type === "city");
  const nearbyCities = citiesOnly
    .filter((c) => c.id !== city.id)
    .slice(0, 18);

  return (
    <div className="min-h-screen bg-white">
      <section className="pb-20 px-6 bg-purple-50">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-baloo font-bold text-black mb-4">
              Oferty pracy manicure {city.name}
            </h2>
            <p className="text-gray-500 max-w-2xl font-poppins font-normal">
              Znajdź aktualne oferty pracy manicure i pedicure w {city.name}. Sprawdź ogłoszenia
              salonów i warunki zatrudnienia.
            </p>
            <div className="mt-6">
              <Logic
                slugCity={city.name}
                variant="inline"
                baseRoute="oferty-pracy-manicure"
              />
            </div>
          </div>

          {jobOffersWithSalonDetails.length > 0 ? (
            <div className="flex flex-col gap-6 md:gap-8 mb-10">
              {jobOffersWithSalonDetails.map(
                (
                  offer: JobOffer & {
                    salonLogo?: string;
                    salonDescription?: string;
                  }
                ) => (
                  <div
                    key={offer.id}
                    className="bg-white rounded-2xl p-6 md:p-8 lg:p-10 border border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col gap-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-3xl font-baloo font-bold text-zinc-800 mb-2">
                            {offer.title}
                          </h3>
                          <p className="text-lg text-neutral-600 font-poppins mb-4">
                            {offer.salonName}
                          </p>
                          {offer.salonDescription && (
                            <p className="text-neutral-700 font-poppins mb-4">
                              {offer.salonDescription}
                            </p>
                          )}
                          <p className="text-neutral-700 font-poppins">
                            {offer.description}
                          </p>
                        </div>
                        {offer.salary && (
                          <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 px-4 py-2 text-lg font-inter font-semibold whitespace-nowrap">
                            {offer.salary}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {offer.employmentType && (
                          <div className="flex items-center gap-2 text-sm text-neutral-700 font-inter">
                            <FaBriefcase className="text-blue-500" />
                            <span className="capitalize">
                              {offer.employmentType === "full-time"
                                ? "Pełny etat"
                                : offer.employmentType === "part-time"
                                  ? "Część etatu"
                                  : offer.employmentType === "contract"
                                    ? "Umowa zlecenie"
                                    : offer.employmentType === "internship"
                                      ? "Staż"
                                      : offer.employmentType}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-neutral-700 font-inter">
                          <FaMapMarkerAlt className="text-blue-500" />
                          <span>{offer.location || city.name}</span>
                        </div>
                      </div>

                      {offer.requirements && offer.requirements.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-bold text-lg mb-2">Wymagania:</h4>
                          <ul className="list-disc list-inside text-sm text-neutral-700 space-y-1">
                            {offer.requirements.map((req, idx) => (
                              <li key={idx}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {offer.benefits && offer.benefits.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-bold text-lg mb-2">Benefity:</h4>
                          <ul className="list-disc list-inside text-sm text-neutral-700 space-y-1">
                            {offer.benefits.map((benefit, idx) => (
                              <li key={idx}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {(offer.contactEmail || offer.contactPhone) && (
                        <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-4">
                          {offer.contactEmail && (
                            <a
                              href={`mailto:${offer.contactEmail}`}
                              className="flex items-center gap-2 text-blue-600 hover:underline font-medium"
                            >
                              <FaEnvelope />
                              {offer.contactEmail}
                            </a>
                          )}
                          {offer.contactPhone && (
                            <a
                              href={`tel:${offer.contactPhone}`}
                              className="flex items-center gap-2 text-blue-600 hover:underline font-medium"
                            >
                              <FaPhone />
                              {offer.contactPhone}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <p className="text-neutral-600 text-lg font-poppins">
                Brak aktualnych ofert pracy w {city.name}. Sprawdź ponownie później lub zobacz
                oferty w innych miastach.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="container">
          <h3 className="mb-20 text-4xl lg:text-5xl font-baloo font-bold text-neutral-900">
            Szukaj też w innych miastach
          </h3>
          <div className="flex flex-wrap gap-6">
            {nearbyCities.map((c) => (
              <Link
                key={c.id}
                href={`/oferty-pracy-manicure/${c.id}`}
                className="group py-3 relative w-max text-xl text-black hover:border-blue-800 hover:text-blue-800"
              >
                {`Praca ${c.name}`}
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-blue-800 group-hover:h-[6px] duration-100 rounded-full"></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="py-20">
        <FAQ className="animate-fade-in-up" items={ofertyPracyFaq} />
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
  const cityData = await getSingleCity(city);
  if (!cityData || "error" in cityData) {
    return {
      title: "404 | Naily",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://naily.pl";
  return {
    title: `Oferty pracy manicure ${cityData.name} - ogłoszenia salonów`,
    description: `Oferty pracy manicure i pedicure w ${cityData.name}. Sprawdź aktualne ogłoszenia salonów i aplikuj bezpośrednio.`,
    keywords: `oferty pracy manicure ${cityData.name}, praca manicure ${cityData.name}, praca stylistka paznokci ${cityData.name}, oferty pracy pedicure ${cityData.name}, praca manicurzystka ${cityData.name}`,
    openGraph: {
      type: "website",
      title: `Oferty pracy manicure ${cityData.name}`,
      description: `Sprawdź oferty pracy manicure i pedicure w ${cityData.name}.`,
      siteName: "Naily",
    },
    alternates: {
      canonical: `${baseUrl}/oferty-pracy-manicure/${cityData.id}`,
    },
  };
}

const ofertyPracyFaq: FaqItem[] = [
  {
    id: "oferty-pracy-apply",
    question: "Jak aplikować na ofertę pracy?",
    answer:
      "Skontaktuj się bezpośrednio z salonem poprzez podany kontakt email lub telefon. Przygotuj swoje CV i portfolio z przykładami prac.",
  },
  {
    id: "oferty-pracy-experience",
    question: "Czy potrzebuję doświadczenia?",
    answer:
      "Wymagania różnią się w zależności od oferty. Niektóre salony szukają osób z doświadczeniem, inne oferują szkolenia dla początkujących. Sprawdź sekcję 'Wymagania' w każdej ofercie.",
  },
  {
    id: "oferty-pracy-salary",
    question: "Jakie są zarobki?",
    answer:
      "Zarobki w branży manicure różnią się w zależności od lokalizacji, doświadczenia i typu zatrudnienia. Szczegóły znajdziesz w opisie każdej oferty.",
  },
  {
    id: "oferty-pracy-benefits",
    question: "Jakie benefity oferują salony?",
    answer:
      "Benefity różnią się w zależności od salonu. Mogą obejmować szkolenia, premie, elastyczne godziny pracy i inne. Sprawdź sekcję 'Benefity' w opisie oferty.",
  },
];
