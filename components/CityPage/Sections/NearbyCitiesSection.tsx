import { ICity } from "@/types";
import Link from "next/link";

interface NearbyCitiesSectionProps {
  nearbyCities: ICity[];
  serviceType: "manicure" | "pedicure";
}

export default function NearbyCitiesSection({
  nearbyCities,
  serviceType,
}: NearbyCitiesSectionProps) {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="container">
        <h3 className="mb-20 text-4xl lg:text-5xl font-baloo font-bold text-neutral-900">
          Szukaj też w innych miastach
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
  );
}








