import { ICity } from "@/types";
import Logic from "@/components/SearchBar/Logic";

interface CityHeroProps {
  city: ICity;
  serviceType: "manicure" | "pedicure";
}

export default function CityHero({ city, serviceType }: CityHeroProps) {
  const serviceName = serviceType === "manicure" ? "Manicure" : "Pedicure";

  return (
    <section className="pb-20 px-6 bg-purple-50">
      <div className="container">
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-baloo font-bold text-black mb-4">
            {serviceName} {city.name} - Cennik 2026
          </h1>
          <p className="text-gray-500 max-w-2xl font-poppins font-normal">
            Sprawdzone miejsca z najwyższymi ocenami klientek i profesjonalnym {serviceType}. 
            Sprawdź przewidywane ceny i katalog stylistek {serviceType} w swoim mieście.
          </p>
          <div className="mt-6">
            <Logic slugCity={city.name} variant="inline" />
          </div>
          <p className="text-gray-500 font-poppins text-sm mt-3">
            Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}
          </p>
        </div>
      </div>
    </section>
  );
}








