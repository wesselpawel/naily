import { FaTags } from "react-icons/fa";
import PricingTable, { type PricingItem } from "@/components/CityPage/PricingTable";

interface PricingSectionProps {
  pricingItems: PricingItem[];
  serviceType: "manicure" | "pedicure";
}

export default function PricingSection({
  pricingItems,
  serviceType,
}: PricingSectionProps) {
  const serviceName = serviceType === "manicure" ? "Manicure" : "Pedicure";

  return (
    <section className="relative py-20 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-blue-200/20 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-purple-200/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-100/10 blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-200/50 mb-4 sm:mb-6 shadow-sm">
            <FaTags className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-baloo font-bold text-neutral-900 mb-3 leading-tight">
            Cennik usług {serviceName.toLowerCase()}
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 font-poppins max-w-2xl mx-auto">
            Sprawdź szczegółowy cennik wszystkich usług {serviceName.toLowerCase()}. 
            Ceny mogą się różnić w zależności od stylistki i zakresu usługi.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 blur-sm"></div>
          <div className="relative bg-white rounded-xl shadow-xl border border-neutral-200/50 p-6 sm:p-8">
            <PricingTable items={pricingItems} />
          </div>
        </div>
      </div>
    </section>
  );
}








