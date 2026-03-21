"use client";
import { useState, useEffect } from "react";
import { User, IService } from "@/types";
import { UserProfileHero, UserProfileMainContent, UserProfileContact } from "@/components/User/UserProfileContent";
import ReservationModal from "./ReservationModal";

export default function UserProfileClientWrapper({
  user,
  portfolio,
}: {
  user: User;
  portfolio: Array<{ id: string; url?: string; title?: string }>;
}) {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<IService | null>(null);

  // Handle hash navigation on page load
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#opinie") {
      setTimeout(() => {
        const opinionsSection = document.getElementById("opinie");
        if (opinionsSection) {
          opinionsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 500); // Delay to ensure page is fully rendered
    }
  }, []);
  
  const handleServiceClick = (service: IService) => {
    setSelectedService(service);
    setIsReservationModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsReservationModalOpen(false);
    setSelectedService(null);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80">
      {/* Full-width hero + overlapping card (see UserProfileHero fullpage) */}
      <div className="">
        <UserProfileHero
          user={user}
          portfolio={portfolio}
          variant="fullpage"
          onReservationOpen={() => setIsReservationModalOpen(true)}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <UserProfileMainContent 
              user={user} 
              portfolio={portfolio} 
              variant="fullpage"
              onServiceClick={handleServiceClick}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact & Booking */}
            <UserProfileContact user={user} />

            {/* Quick Stats */}
            <div className="animate-fade-in animation-delay-1000 rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-sm">
              <h3 className="mb-5 flex items-center gap-3 font-baloo text-xl font-bold text-neutral-900">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg text-white shadow-sm">
                  📊
                </span>
                Na skrót
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    n: user.services?.length || 0,
                    label: "Usługi",
                    className:
                      "border-blue-100 bg-gradient-to-br from-blue-50 to-white text-blue-700",
                  },
                  {
                    n: portfolio.length || 0,
                    label: "Portfolio",
                    className:
                      "border-violet-100 bg-gradient-to-br from-violet-50 to-white text-violet-700",
                  },
                  {
                    n: user.profileComments?.length || 0,
                    label: "Opinie",
                    className:
                      "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white text-emerald-700",
                  },
                  {
                    n: user.payments?.length || 0,
                    label: "Transakcje",
                    className:
                      "border-amber-100 bg-gradient-to-br from-amber-50 to-white text-amber-800",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-xl border p-3 text-center transition-shadow hover:shadow-md ${item.className}`}
                  >
                    <div className="text-2xl font-bold tabular-nums">{item.n}</div>
                    <div className="mt-0.5 text-xs font-medium text-neutral-600 font-poppins">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={handleModalClose}
        user={user}
        preselectedService={selectedService}
      />
    </div>
  );
}











