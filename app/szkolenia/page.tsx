import { Metadata, Viewport } from "next";
import Link from "next/link";
import { getCities } from "@/utils/getCities";
import { ICity } from "@/types";
import Logic from "@/components/SearchBar/Logic";

// Enable ISR: Revalidate every 6 hours to keep city list fresh while maintaining fast static pages
export const revalidate = 21600; // 6 hours

export default async function SzkoleniaPage() {
  // Get cities excluding villages
  const allCities = await getCities();
  const cities = allCities.filter((city: ICity) => city.type === "city");

  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 px-6 bg-purple-50">
        <div className="container">
          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-baloo font-bold text-black mb-4">
              Kursy stylizacji paznokci w Polsce
            </h1>
            <p className="text-gray-500 max-w-3xl font-poppins font-normal text-lg mb-6">
              Znajdź kurs stylizacji paznokci, szkolenia manicure i szkolenia pedicure w swoim mieście.
              Sprawdź terminy, cennik i instruktorki - bez ograniczenia do kilku lokalizacji.
            </p>
            <div className="mt-6">
              <Logic slugCity="" variant="inline" baseRoute="kursy-stylizacji-paznokci" />
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl lg:text-3xl font-baloo font-bold text-zinc-900 mb-6">
              Kursy stylizacji paznokci i szkolenia manicure
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city: ICity) => (
                <Link
                  key={`m-${city.id}`}
                  href={`/kursy-stylizacji-paznokci/${city.id}`}
                  className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200"
                >
                  <h3 className="text-xl font-baloo font-bold text-zinc-800 mb-2 group-hover:text-blue-600 transition-colors">
                    Kurs stylizacji paznokci {city.name}
                  </h3>
                  <p className="text-neutral-600 text-sm font-poppins">
                    Sprawdź dostępne szkolenia manicure w {city.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl lg:text-3xl font-baloo font-bold text-zinc-900 mb-6">
              Szkolenia pedicure
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city: ICity) => (
                <Link
                  key={`p-${city.id}`}
                  href={`/kursy-pedicure/${city.id}`}
                  className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200"
                >
                  <h3 className="text-xl font-baloo font-bold text-zinc-800 mb-2 group-hover:text-blue-600 transition-colors">
                    Kurs pedicure {city.name}
                  </h3>
                  <p className="text-neutral-600 text-sm font-poppins">
                    Sprawdź dostępne szkolenia pedicure w {city.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
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

export const metadata: Metadata = {
  title: "Kursy stylizacji paznokci, szkolenia manicure i pedicure",
  description:
    "Kursy stylizacji paznokci w całej Polsce: szkolenia manicure i pedicure w każdym mieście z bazy. Sprawdź cennik, terminy i certyfikowane kursy.",
  keywords:
    "kursy stylizacji paznokci, kurs stylizacji paznokci, szkolenia manicure, szkolenia pedicure, kurs manicure, kurs pedicure, ile kosztuje kurs stylizacji paznokci",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_URL || "https://naily.pl"}/kursy-stylizacji-paznokci`,
  },
  openGraph: {
    title: "Kursy stylizacji paznokci, szkolenia manicure i pedicure",
    description:
      "Znajdź kurs stylizacji paznokci, szkolenia manicure i pedicure w swoim mieście.",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_URL || "https://naily.pl"}/kursy-stylizacji-paznokci`,
  },
};

