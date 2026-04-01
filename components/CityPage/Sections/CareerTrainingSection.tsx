import Link from "next/link";
import { FaGem, FaStar, FaArrowRight } from "react-icons/fa";
import { ICity } from "@/types";

interface CareerTrainingSectionProps {
  city: ICity;
}

export default function CareerTrainingSection({ city }: CareerTrainingSectionProps) {
  return (
    <section className="py-12 px-6 bg-white">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <Link
            href={`/kursy-stylizacji-paznokci/${city.id}`}
            className="group bg-white rounded-xl p-8 lg:p-10 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300"
          >
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <FaGem className="text-2xl text-purple-700" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-baloo font-bold text-zinc-800 mb-3 group-hover:text-blue-600 transition-colors">
                  Szkolenia Manicure {city.name}
                </h3>
                <p className="text-neutral-600 text-base font-poppins leading-relaxed">
                  Znajdź najlepsze szkolenia z manicure w {city.name}. Profesjonalne kursy, 
                  certyfikaty i rozwój umiejętności.
                </p>
              </div>
              <div className="mt-auto pt-4">
                <span className="inline-flex items-center gap-2 text-blue-600 font-semibold font-poppins group-hover:gap-3 transition-all">
                  Instruktorki manicure {city.name}
                  <FaArrowRight className="text-sm" />
                </span>
              </div>
            </div>
          </Link>

          <Link
            href={`/oferty-pracy-manicure/${city.id}`}
            className="group bg-white rounded-xl p-8 lg:p-10 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300"
          >
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <FaStar className="text-2xl text-blue-700" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-baloo font-bold text-zinc-800 mb-3 group-hover:text-blue-600 transition-colors">
                  Pracuj w Salonie Manicure {city.name}
                </h3>
                <p className="text-neutral-600 text-base font-poppins leading-relaxed">
                  Znajdź najlepsze oferty pracy manicure w {city.name}. Aktualne ogłoszenia
                  salonów i rozwój w branży beauty.
                </p>
              </div>
              <div className="mt-auto pt-4">
                <span className="inline-flex items-center gap-2 text-blue-600 font-semibold font-poppins group-hover:gap-3 transition-all">
                  Zobacz oferty pracy
                  <FaArrowRight className="text-sm" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}








