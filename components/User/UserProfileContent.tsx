"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaClock,
  FaTag,
  FaImages,
  FaStar,
  FaCalendarAlt,
  FaUser,
  FaGem,
} from "react-icons/fa";
import { MdSpa } from "react-icons/md";
import { FaUserNinja } from "react-icons/fa6";
import { User, IService } from "@/types";
import ReservationButton from "@/app/zarezerwuj/[slug]/ReservationButton";
import ReservationModal from "@/app/zarezerwuj/[slug]/ReservationModal";
import OpinionsSection from "@/components/User/OpinionsSection";
import ImageCarousel from "@/components/User/ImageCarousel";

const PROFILE_HERO_FALLBACK = "/woman.png";

function isUsableImageUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  const t = url.trim();
  if (!t) return false;
  return (
    t.startsWith("http://") ||
    t.startsWith("https://") ||
    t.startsWith("/")
  );
}

/** Banner: explicit user background → else first portfolio shot → else woman.png (matches city landing) */
export function resolveProfileHeroImage(
  bannerUrl?: string | null,
  portfolioFirstUrl?: string | null
): string {
  if (isUsableImageUrl(bannerUrl)) return bannerUrl.trim();
  if (isUsableImageUrl(portfolioFirstUrl)) return portfolioFirstUrl.trim();
  return PROFILE_HERO_FALLBACK;
}

interface UserProfileContentProps {
  user: User;
  portfolio: Array<{ id: string; url?: string; title?: string }>;
  variant?: "popup" | "fullpage";
  showContact?: boolean;
}

function profileOpinionsClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  user: User
) {
  const slug = user.userSlugUrl || user.uid;
  if (!slug) return;
  const targetPath = `/zarezerwuj/${slug}`;
  if (typeof window === "undefined") return;
  if (window.location.pathname === targetPath) {
    e.preventDefault();
    setTimeout(() => {
      const el = document.getElementById("opinie");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", `${targetPath}#opinie`);
      }
    }, 100);
  }
}

// Export hero section as separate component
export function UserProfileHero({
  user,
  portfolio = [],
  variant = "popup",
  onReservationOpen,
}: {
  user: User;
  portfolio?: Array<{ id: string; url?: string; title?: string }>;
  variant?: "popup" | "fullpage";
  onReservationOpen?: () => void;
}) {
  const isFullPage = variant === "fullpage";
  const isIndividualSpecialist = user.seek === true;
  const isSalon = user.seek === false;

  const heroImageSrc = resolveProfileHeroImage(
    user.bannerUrl,
    portfolio[0]?.url
  );
  const profileSlug = user.userSlugUrl || user.uid;

  const avatarBlock = (size: "sm" | "lg") => (
    <div
      className={`relative shrink-0 ${
        size === "lg"
          ? "w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36"
          : "w-24 h-24 md:w-28 md:h-28"
      }`}
    >
      <Image
        src={user.logo || "/default-user.png"}
        alt={user.name}
        fill
        className="rounded-full object-cover border-4 border-white shadow-xl ring-2 ring-white/80"
        sizes={size === "lg" ? "144px" : "112px"}
        priority
      />
      {(user?.subscription?.status === "active" ||
        user?.premiumActive ||
        user?.active) && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-1 md:p-1.5 shadow-lg z-10 ring-2 ring-white">
          <FaCheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </div>
      )}
      {user?.premiumActive && (
        <div className="absolute -top-0.5 -right-0.5 bg-amber-400 rounded-full p-1 shadow-lg z-10 ring-2 ring-white">
          <FaGem className="w-3 h-3 text-amber-950" />
        </div>
      )}
    </div>
  );

  const titleAndMeta = (compact: boolean) => (
    <div>
      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
        <h1
          className={`font-baloo font-bold text-neutral-900 break-words ${
            compact
              ? "text-xl md:text-2xl"
              : "text-2xl md:text-3xl lg:text-4xl xl:text-[2.5rem]"
          }`}
        >
          {user.name}
        </h1>
        {user.emailVerified && (
          <FaCheckCircle
            className="text-blue-600 w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
            title="Zweryfikowany email"
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {isIndividualSpecialist ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 text-violet-800 px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-poppins font-medium">
            <FaUserNinja className="w-3 h-3 md:w-4 md:h-4" />
            Specjalistka
          </span>
        ) : isSalon ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-800 px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-poppins font-medium">
            <MdSpa className="w-3 h-3 md:w-4 md:h-4" />
            Salon
          </span>
        ) : null}
        {user?.premiumActive && (
          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-900 px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-poppins font-medium">
            Premium
          </span>
        )}
        {user?.seek && (
          <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-poppins font-medium">
            Przyjmuje nowe klientki
          </span>
        )}
      </div>

      {user.location?.address && (
        <div className="flex items-start gap-2 text-sm md:text-base text-neutral-600 mb-4 font-poppins">
          <FaMapMarkerAlt className="text-blue-600 flex-shrink-0 mt-0.5" />
          <span className="break-words">{user.location.address}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 md:px-3 md:py-1.5 bg-blue-50 rounded-xl border border-blue-100/80">
          <FaStar className="text-blue-600 w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
          <span className="text-blue-800 font-semibold text-xs md:text-sm font-poppins whitespace-nowrap">
            {user.services?.length || 0} usług
          </span>
        </div>
        {portfolio.length > 0 && (
          <div className="flex items-center gap-2 px-2.5 py-1 md:px-3 md:py-1.5 bg-violet-50 rounded-xl border border-violet-100/80">
            <FaImages className="text-violet-600 w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="text-violet-800 font-semibold text-xs md:text-sm font-poppins whitespace-nowrap">
              {portfolio.length} zdjęć
            </span>
          </div>
        )}
        {user.profileComments && user.profileComments.length > 0 && (
          <div className="flex items-center gap-2 px-2.5 py-1 md:px-3 md:py-1.5 bg-emerald-50 rounded-xl border border-emerald-100/80">
            <FaStar className="text-emerald-600 w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="text-emerald-800 font-semibold text-xs md:text-sm font-poppins whitespace-nowrap">
              {user.profileComments.length} opinii
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (isFullPage) {
    return (
      <>
        {/* Full-bleed hero — aligned with city landing / manicure hero */}
        <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-clip bg-slate-950">
          <section className="relative isolate min-h-[min(52svh,480px)] w-full overflow-hidden md:min-h-[min(80svh,820px)]">
            <Image
              src={heroImageSrc}
              alt=""
              fill
              priority
              className="object-cover object-[center_22%] md:object-[center_28%]"
              sizes="100vw"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-900/35 md:via-slate-950/55 md:to-slate-950/20"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent"
              aria-hidden
            />
            <div className="relative z-10 mx-auto flex h-full min-h-[min(20svh,480px)] max-w-[1600px] flex-col justify-end px-5 pb-10 pt-8 sm:px-8 md:min-h-[min(20svh,520px)] md:pb-14 lg:px-12">
              <p className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-200 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.85)]" />
                Profil na Naily
              </p>
              <p className="max-w-xl font-poppins text-sm text-slate-200/95 sm:text-base">
                Sprawdź cennik, portfolio i zarezerwuj wizytę u tej stylistki.
              </p>
            </div>
          </section>
        </div>

        {/* Overlapping profile card — contained width */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 md:-mt-72">
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.2)] sm:rounded-3xl sm:p-8 md:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
              <div className="flex flex-col items-center md:items-start -mt-20 md:-mt-24 md:w-auto">
                {avatarBlock("lg")}
              </div>
              <div className="min-w-0 flex-1 space-y-6 md:pt-2">
                {titleAndMeta(false)}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <ReservationButton
                    user={user}
                    onModalOpen={onReservationOpen}
                    className="rounded-full px-8 py-3.5 text-base shadow-lg shadow-blue-600/25"
                  />
                  {profileSlug ? (
                    <Link
                      href={`/zarezerwuj/${profileSlug}#opinie`}
                      onClick={(e) => profileOpinionsClick(e, user)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-neutral-200 bg-white px-6 py-3.5 text-center text-sm font-semibold text-blue-700 transition-colors hover:border-blue-200 hover:bg-blue-50/80 font-poppins"
                    >
                      <FaStar className="h-4 w-4 shrink-0 text-blue-600" />
                      Opinie i oceny
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* Popup / compact: single card, always show hero image (defaults to woman.png) */
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="relative w-full overflow-hidden bg-slate-900">
        <div className="relative h-48 w-full md:h-56">
          <Image
            src={heroImageSrc}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 896px"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
          <div className="absolute left-3 top-3 z-10 md:left-4 md:top-4">
            {avatarBlock("sm")}
          </div>
          <div className="absolute bottom-3 left-3 right-3 z-10 md:bottom-4 md:left-4 md:right-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <div className="min-w-0 flex-1">
                <ReservationButton user={user} onModalOpen={onReservationOpen} />
              </div>
              {profileSlug ? (
                <Link
                  href={`/zarezerwuj/${profileSlug}#opinie`}
                  onClick={(e) => profileOpinionsClick(e, user)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/90 bg-white/95 px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-md backdrop-blur-sm transition-colors hover:bg-white font-poppins sm:w-auto sm:px-6"
                >
                  <FaStar className="h-3.5 w-3.5" />
                  Opinie
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6">{titleAndMeta(true)}</div>
    </div>
  );
}

// Export main content section (description, services, portfolio, opinions)
export function UserProfileMainContent({
  user,
  portfolio,
  variant = "popup",
  onServiceClick,
}: {
  user: User;
  portfolio: Array<{ id: string; url?: string; title?: string }>;
  variant?: "popup" | "fullpage";
  onServiceClick?: (service: IService) => void;
}) {
  const isFullPage = variant === "fullpage";
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  return (
    <>
      {/* Description */}
      {user.description && (
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 md:p-8 mb-6 animate-fade-in">
          <h2 className="font-baloo text-xl md:text-2xl font-bold text-zinc-800 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaUser className="text-blue-600 w-5 h-5" />
            </div>
            O mnie
          </h2>
          <p className="text-neutral-700 whitespace-pre-line leading-relaxed break-words font-poppins text-sm md:text-base">
            {user.description}
          </p>
        </div>
      )}

      {/* Portfolio Gallery - Prominent Section */}
      {portfolio.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 md:p-8 mb-6 animate-fade-in animation-delay-200">
          <h2 className="font-baloo text-xl md:text-2xl font-bold text-zinc-800 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaImages className="text-purple-600 w-5 h-5" />
            </div>
            Portfolio ({portfolio.length})
          </h2>
          <div
            className={`grid gap-4 ${
              isFullPage
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-2 md:grid-cols-3"
            }`}
          >
            {portfolio.map((image, index) => (
              <button
                key={image.id || index}
                type="button"
                className="relative group cursor-pointer aspect-square overflow-hidden rounded-xl border-2 border-neutral-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setSelectedImageIndex(index)}
                aria-label={`Pokaż zdjęcie ${index + 1}${image.title ? `: ${image.title}` : ""}`}
              >
                <Image
                  src={image.url || ""}
                  alt={image.title || `Portfolio ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {image.title && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-white text-sm font-medium font-poppins text-center w-full line-clamp-2">
                      {image.title}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Image Carousel Modal */}
          <ImageCarousel
            images={portfolio}
            isOpen={selectedImageIndex !== null}
            onClose={() => setSelectedImageIndex(null)}
            initialIndex={selectedImageIndex || 0}
          />
        </div>
      )}

      {/* Services */}
      {!!user.services?.length && (
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 md:p-8 mb-6 animate-fade-in animation-delay-400 max-w-full overflow-hidden">
          <h2 className="font-baloo text-xl md:text-2xl font-bold text-zinc-800 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaStar className="text-green-600 w-5 h-5" />
            </div>
            Oferowane usługi ({user.services.length})
          </h2>
          <div className="grid gap-4 max-w-full">
            {user.services.map((service) => (
              <div
                key={service.flatten_name}
                onClick={() => onServiceClick?.(service)}
                className={`border-2 border-neutral-200 rounded-xl p-4 md:p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white group max-w-full overflow-hidden ${
                  onServiceClick ? "cursor-pointer" : ""
                }`}
                style={{ maxWidth: "100vw" }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 max-w-full">
                  <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                    <h3 className="font-baloo text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors break-words max-w-full">
                      {service.real_name}
                    </h3>
                    {service.description && (
                      <p className="text-sm text-neutral-600 mt-2 break-words font-poppins leading-relaxed max-w-full">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
                    {typeof service.price === "number" && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl border border-blue-100 whitespace-nowrap">
                        <FaTag className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-blue-700 font-bold text-base font-poppins">
                          {service.price} zł
                        </span>
                      </div>
                    )}
                    {service.duration && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-xl border border-neutral-100 whitespace-nowrap">
                        <FaClock className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                        <span className="text-neutral-700 font-semibold text-sm font-poppins">
                          {service.duration} min
                        </span>
                      </div>
                    )}
                    {onServiceClick && (
                      <>
                        <div className="hidden sm:flex items-center gap-2 text-blue-600 font-semibold text-xs font-poppins opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          <FaCalendarAlt className="w-3 h-3" />
                          <span>Zarezerwuj</span>
                        </div>
                        <div className="sm:hidden flex items-center gap-2 text-blue-600 font-semibold text-xs font-poppins">
                          <FaCalendarAlt className="w-3 h-3" />
                          <span className="whitespace-nowrap">Kliknij, aby zarezerwować</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opinions */}
      {user.uid && (
        <div id="opinie" className="mb-6 animate-fade-in animation-delay-600 scroll-mt-20">
          <OpinionsSection profileUid={user.uid as string} />
        </div>
      )}
    </>
  );
}

// Export contact section as separate component for sidebar use
export function UserProfileContact({ user }: { user: User }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 animate-fade-in animation-delay-600">
      <h3 className="font-baloo text-lg md:text-xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <FaCalendarAlt className="text-blue-600 w-5 h-5" />
        </div>
        Kontakt i rezerwacja
      </h3>

      <div className="space-y-4">
        {user.phoneNumber && (
          <a
            href={`tel:${user.phoneNumber}`}
            className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <FaPhone className="w-5 h-5 text-white" />
            </div>
            <span className="text-neutral-800 hover:text-blue-700 transition-colors font-semibold font-poppins text-base break-all min-w-0">
              {user.phoneNumber}
            </span>
          </a>
        )}

        {user.email && (
          <a
            href={`mailto:${user.email}`}
            className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 hover:border-purple-200 transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <FaEnvelope className="w-5 h-5 text-white" />
            </div>
            <span className="text-neutral-800 hover:text-purple-700 transition-colors font-semibold font-poppins text-base break-all min-w-0">
              {user.email}
            </span>
          </a>
        )}
      </div>
    </div>
  );
}

// Default export - combines all sections for popup use
export default function UserProfileContent({
  user,
  portfolio,
  variant = "popup",
  showContact = true,
  onServiceClick,
}: UserProfileContentProps & { onServiceClick?: (service: IService) => void }) {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<IService | null>(null);
  
  const handleServiceClick = (service: IService) => {
    setSelectedService(service);
    setIsReservationModalOpen(true);
    // Prevent scrolling on UserSlider when modal opens
    const sliderElement = document.querySelector('[data-user-slider="true"]') as HTMLElement;
    if (sliderElement) {
      sliderElement.style.overflow = "hidden";
      sliderElement.scrollTop = 0;
    }
  };
  
  const handleModalClose = () => {
    setIsReservationModalOpen(false);
    setSelectedService(null);
    // Restore scrolling
    const sliderElement = document.querySelector('[data-user-slider="true"]') as HTMLElement;
    if (sliderElement) {
      sliderElement.style.overflow = "auto";
    }
  };
  
  return (
    <>
      <UserProfileHero 
        user={user} 
        portfolio={portfolio} 
        variant={variant}
        onReservationOpen={() => {
          setIsReservationModalOpen(true);
          const sliderElement = document.querySelector('[data-user-slider="true"]') as HTMLElement;
          if (sliderElement) {
            sliderElement.style.overflow = "hidden";
            sliderElement.scrollTop = 0;
          }
        }}
      />
      <UserProfileMainContent 
        user={user} 
        portfolio={portfolio} 
        variant={variant} 
        onServiceClick={onServiceClick || handleServiceClick}
      />
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={handleModalClose}
        user={user}
        preselectedService={selectedService}
      />
      {showContact && variant === "popup" && (
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 md:p-8 mb-6">
          <h3 className="font-baloo text-lg md:text-xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaCalendarAlt className="text-blue-600 w-5 h-5" />
            </div>
            Kontakt i rezerwacja
          </h3>

          <div className="space-y-4">
            {user.phoneNumber && (
              <a
                href={`tel:${user.phoneNumber}`}
                className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FaPhone className="w-5 h-5 text-white" />
                </div>
                <span className="text-neutral-800 hover:text-blue-700 transition-colors font-semibold font-poppins text-base break-all min-w-0">
                  {user.phoneNumber}
                </span>
              </a>
            )}

            {user.email && (
              <a
                href={`mailto:${user.email}`}
                className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 hover:border-purple-200 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FaEnvelope className="w-5 h-5 text-white" />
                </div>
                <span className="text-neutral-800 hover:text-purple-700 transition-colors font-semibold font-poppins text-base break-all min-w-0">
                  {user.email}
                </span>
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
