import { Metadata, Viewport } from "next";
import Link from "next/link";
import { getCities } from "@/utils/getCities";
import { ICity } from "@/types";
import Logic from "@/components/SearchBar/Logic";

export const revalidate = 21600;

export default async function KursyPedicurePage() {
  const allCities = await getCities();
  const cities = allCities.filter((city: ICity) => city.type === "city");

  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 px-6 bg-purple-50">
        <div className="container">
          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-baloo font-bold text-black mb-4">
              Kursy pedicure w Polsce
            </h1>
            <p className="text-gray-500 max-w-3xl font-poppins font-normal text-lg mb-6">
              Znajdź kurs pedicure i szkolenia pedicure w swoim mieście. Sprawdź terminy, cennik
              i dostępnych instruktorów w całej Polsce.
            </p>
            <div className="mt-6">
              <Logic slugCity="" variant="inline" baseRoute="kursy-pedicure" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {cities.map((city: ICity) => (
              <Link
                key={city.id}
                href={`/kursy-pedicure/${city.id}`}
                className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200"
              >
                <h2 className="text-xl font-baloo font-bold text-zinc-800 mb-2 group-hover:text-blue-600 transition-colors">
                  Kurs pedicure {city.name}
                </h2>
                <p className="text-neutral-600 text-sm font-poppins">
                  Sprawdź dostępne szkolenia pedicure w {city.name}
                </p>
              </Link>
            ))}
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
  title: "Kursy pedicure i szkolenia pedicure w Polsce",
  description:
    "Znajdź kurs pedicure i szkolenia pedicure w całej Polsce. Wszystkie miasta, aktualne terminy i cennik kursów.",
  keywords:
    "kursy pedicure, kurs pedicure, szkolenia pedicure, kurs pedicure kosmetyczny, cennik kursów pedicure",
  openGraph: {
    title: "Kursy pedicure i szkolenia pedicure w Polsce",
    description: "Kurs pedicure i szkolenia pedicure - wszystkie miasta i aktualne terminy.",
    type: "website",
  },
};

