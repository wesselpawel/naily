"use client";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { setUser, initialState } from "@/redux/slices/user";
import DownloadApp from "./Navigation/DownloadApp";
import { useEffect, useState, useRef, useCallback } from "react";
import { isFeatureEnabled } from "@/lib/featureFlags";
import {
  FaGem,
  FaUser,
  FaSignOutAlt,
  FaTimes,
  FaHome,
  FaBookOpen,
  FaBell,
  FaExternalLinkAlt,
  FaBars,
  FaChevronDown,
  FaLongArrowAltRight,
  FaGraduationCap,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import LoginRegisterPopup from "./User/LoginRegisterPopup";
import Image from "next/image";
import logo from "@/public/naily-logo2.png";
import HeaderSearch from "@/components/SearchBar/HeaderSearch";
import { usePathname, useRouter } from "next/navigation";
import { FaArrowRight, FaChevronRight } from "react-icons/fa6";

declare global {
  interface Window {
    openLoginRegisterPopup?: (
      _tab?: "login" | "register",
      _accountType?: "salon" | "individual"
    ) => void;
  }
}

// Minimal type for the non-standard PWA install event
type NavBeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  platforms?: string[];
};

export default function Header({
  landing,
  isUserProfile,
}: {
  landing?: boolean;
  isUserProfile?: boolean;
}) {
  const { user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [loginPopupTab, setLoginPopupTab] = useState<"login" | "register">(
    "login"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDashboardRoute, setIsDashboardRoute] = useState(false);
  const [dashboardMenuOpen, setDashboardMenuOpen] = useState(false);
  const [dashboardNotificationCount, setDashboardNotificationCount] =
    useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollYRef = useRef(0);
  const isTickingRef = useRef(false);
  const [, /* pwaPrompt */ setPwaPrompt] =
    useState<NavBeforeInstallPromptEvent | null>(null);
  const [defaultAccountType, setDefaultAccountType] = useState<
    "salon" | "individual" | undefined
  >(undefined);
  const [isEarnMenuOpen, setIsEarnMenuOpen] = useState(false);
  const earnMenuRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = useCallback(() => {
    if (isTickingRef.current) return;
    isTickingRef.current = true;
    window.requestAnimationFrame(() => {
      const currentY = window.scrollY || window.pageYOffset || 0;
      const delta = currentY - lastScrollYRef.current;
      const atTopNow = currentY <= 8;
      setIsAtTop(atTopNow);

      if (!isMobileMenuOpen) {
        if (atTopNow) {
          setIsHeaderVisible(true);
        } else if (delta > 6) {
          setIsHeaderVisible(false);
        } else if (delta < -6) {
          setIsHeaderVisible(true);
        }
      } else {
        setIsHeaderVisible(true);
      }

      lastScrollYRef.current = currentY;
      isTickingRef.current = false;
    });
  }, [isMobileMenuOpen]);

  // Close "Zarabiaj z Naily" dropdown on outside click / ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isEarnMenuOpen) return;
      const target = event.target as HTMLElement;
      if (earnMenuRef.current && !earnMenuRef.current.contains(target)) {
        setIsEarnMenuOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsEarnMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isEarnMenuOpen]);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY || 0;
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    } as EventListenerOptions);
    return () =>
      window.removeEventListener("scroll", handleScroll as EventListener);
  }, [handleScroll]);

  // Capture PWA install prompt for custom triggers (mobile menu & bottom bar)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPwaPrompt(e as unknown as NavBeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener
      );
  }, []);

  // Dashboard bridge: detect route and subscribe to dashboard state
  useEffect(() => {
    try {
      const path = window.location?.pathname || "";
      setIsDashboardRoute(
        path === "/dashboard" || path.startsWith("/dashboard")
      );
    } catch (_e) {}

    const handleMenuState = (e: Event) => {
      const ce = e as CustomEvent<boolean>;
      setDashboardMenuOpen(Boolean(ce.detail));
    };
    const handleNotificationCount = (e: Event) => {
      const ce = e as CustomEvent<number>;
      setDashboardNotificationCount(Number(ce.detail) || 0);
    };

    window.addEventListener(
      "dashboard:menu-state",
      handleMenuState as unknown as EventListener
    );
    window.addEventListener(
      "dashboard:notification-count",
      handleNotificationCount as unknown as EventListener
    );

    return () => {
      window.removeEventListener(
        "dashboard:menu-state",
        handleMenuState as unknown as EventListener
      );
      window.removeEventListener(
        "dashboard:notification-count",
        handleNotificationCount as unknown as EventListener
      );
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".mobile-menu") &&
        !target.closest(".mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileMenuOpen]);

  const logout = async () => {
    try {
      await signOut(auth);
      dispatch(setUser(initialState.user));
      
      // Clear UID cookie
      document.cookie = "uid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      setIsMobileMenuOpen(false);
      
      // Redirect to landing page
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleViewPublicProfile = () => {
    try {
      if (user?.userSlugUrl) {
        window.open(`/zarezerwuj/${user.userSlugUrl}`, "_blank");
      } else if (user?.uid) {
        window.open(`/zarezerwuj/${user.uid}`, "_blank");
      }
    } catch (_e) {}
  };

  const openLoginPopup = (
    tab: "login" | "register" = "login",
    accountType?: "salon" | "individual"
  ) => {
    setLoginPopupTab(tab);
    if (accountType) setDefaultAccountType(accountType);
    setIsLoginPopupOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeLoginPopup = () => {
    setIsLoginPopupOpen(false);
  };

  const toggleMobileMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    if (isDashboardRoute) {
      try {
        window.dispatchEvent(new Event("dashboard:toggle-menu"));
      } catch (_e) {}
    } else {
      setIsMobileMenuOpen((prev) => !prev);
    }
  };

  const openLoginPopupRef = useRef(openLoginPopup);
  openLoginPopupRef.current = openLoginPopup;

  useEffect(() => {
    window.openLoginRegisterPopup = (...args) =>
      openLoginPopupRef.current(...args);
    return () => {
      window.openLoginRegisterPopup = undefined;
    };
  }, []);
  const pathname = usePathname();
  return (
    <>
      <header
        className={`${pathname.includes("/zarezerwuj") ? "bg-white" : ""} ${pathname === "/login" ? "fixed" : "sticky"} ${
          pathname === "/login" && "bg-transparent"
        } top-0 left-0 right-0 z-[100] ${pathname === "/" && "bg-white"} ${
          (pathname.includes("/manicure/") ||
            pathname.includes("/pedicure/") ||
            pathname.includes("/kursy-stylizacji-paznokci") ||
            pathname.includes("/kursy-pedicure")) &&
          "bg-purple-50"
        } 
        ${pathname.includes("/szkolenia") && "bg-purple-50"}
        ${pathname.includes("/kariera") && "bg-purple-50"}
        ${pathname === "/influencer-program" && "bg-purple-50"}
        ${pathname === "/kreator-profilu" && "bg-white"}
        `}
      >
        {/* Main Header */}
        <div className="">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex py-2.5 sm:py-3 lg:py-6 justify-between items-center gap-3 sm:gap-4">
              <div className="flex flex-row w-full lg:w-auto justify-between items-center min-w-0">
                {/* Mobile Menu Button */}
                <div className="w-max flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
                  <button
                    onClick={toggleMobileMenu}
                    className="lg:hidden mobile-menu-button focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg p-1 transition-all duration-200 active:scale-95 flex-shrink-0"
                    aria-label="Otwórz menu"
                  >
                    <FaBars
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${
                        pathname === "/login" ? "text-white" : "text-zinc-800"
                      }`}
                    />
                  </button>
                  <Link href="/" className="flex-shrink-0">
                    <Image
                      src={logo}
                      alt="Logo Naily.pl - Pierwszej strony internetowej poświęconej manicurzystkom i pedicurzystkom"
                      width={200}
                      height={150}
                      className="h-auto w-20 sm:w-24 lg:w-28 max-w-full"
                      priority
                    />
                  </Link>
                </div>
                <div className="lg:hidden flex-shrink-0">
                  <DownloadApp />
                </div>
              </div>
              {/* Desktop Navigation */}
              <div className="hidden lg:flex rounded-xl p-2 h-max space-x-6 xl:space-x-8 px-3 items-center w-full justify-between">
                <nav className="flex items-center space-x-6 xl:space-x-8 flex-1">
                  {/* Primary Navigation Items */}
                  

                  {isFeatureEnabled("affiliate") && (
                  <div className="relative" ref={earnMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsEarnMenuOpen((prev) => !prev)}
                      aria-haspopup="menu"
                      aria-expanded={isEarnMenuOpen}
                      className={`py-2.5 px-5 rounded-full border-2 ${
                        pathname === "/login"
                          ? "border-white/80 bg-white/10"
                          : "border-blue-600 bg-blue-600"
                      } flex items-center gap-2 text-base transition-all duration-200 font-semibold whitespace-nowrap ${
                        pathname === "/login" ? "text-white" : "text-white"
                      } focus:outline-none hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]`}
                    >
                      Zarabiaj z Naily <FaChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {isEarnMenuOpen && (
                      <div className="absolute left-0 mt-2 w-72 rounded-xl border border-neutral-200 bg-white shadow-xl p-2 z-50">
                        {user?.uid ? (
                          <Link
                            href="/dashboard"
                            onClick={() => setIsEarnMenuOpen(false)}
                            className="block w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-zinc-800 font-medium text-sm transition-colors"
                          >
                            Zarabiaj jako stylistka
                          </Link>
                        ) : (
                          <Link
                            href="/kreator-profilu"
                            onClick={() => setIsEarnMenuOpen(false)}
                            className="block w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-zinc-800 font-medium text-sm transition-colors"
                          >
                            Zarabiaj jako stylistka
                          </Link>
                        )}
                        <Link
                          href="/influencer-program"
                          onClick={() => setIsEarnMenuOpen(false)}
                          className="block px-4 py-3 rounded-lg hover:bg-blue-50 text-zinc-800 font-medium text-sm transition-colors"
                        >
                          Zarabiaj jako influencer
                        </Link>
                      </div>
                    )}
                  </div>
                  )}
                  {isDashboardRoute && (
                    <button
                      onClick={() => {
                        try {
                          window.dispatchEvent(
                            new CustomEvent("dashboard:set-tab", {
                              detail: "notifications",
                            })
                          );
                        } catch (_e) {}
                      }}
                      className={`text-base transition-colors duration-200 font-semibold whitespace-nowrap hover:opacity-80 ${
                        pathname === "/login" ? "text-white" : "text-zinc-800"
                      }`}
                      title="Powiadomienia"
                      aria-label="Powiadomienia"
                    >
                      Powiadomienia
                      {dashboardNotificationCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-semibold w-5 h-5">
                          {dashboardNotificationCount}
                        </span>
                      )}
                    </button>
                  )}
                </nav>

                {/* Search Bar */}
                <div className="flex items-center mx-4 flex-shrink-0">
                  <HeaderSearch 
                    placeholder="Szukaj miasta..." 
                    showSearchType={true}
                    defaultSearchType="manicure"
                  />
                </div>
                <Link
                    href="/szkolenia"
                    className={`text-base transition-colors duration-200 font-semibold whitespace-nowrap hover:opacity-80 ${
                      pathname === "/login" ? "text-white" : "text-zinc-800"
                    }`}
                  >
                    Szkolenia
                  </Link>
                 
                {/* User Actions - Secondary Navigation */}
                <div className="flex items-center space-x-4 xl:space-x-6 ml-4 pl-4 xl:pl-6 border-l border-neutral-200">
                  {user?.uid ? (
                    <>
                      {isDashboardRoute ? (
                        <>
                          <button
                            onClick={() => {
                              try {
                                window.dispatchEvent(
                                  new CustomEvent("dashboard:set-tab", {
                                    detail: "settings",
                                  })
                                );
                              } catch (_e) {}
                            }}
                            className={`text-sm transition-colors duration-200 font-medium whitespace-nowrap hover:opacity-80
                            ${
                              pathname === "/login"
                                ? "text-white/90"
                                : "text-zinc-600"
                            }`}
                          >
                            Ustawienia
                          </button>
                          <button
                            onClick={handleViewPublicProfile}
                            className={`text-base transition-colors duration-200 font-semibold whitespace-nowrap hover:opacity-80
                            ${
                              pathname === "/login"
                                ? "text-white/90"
                                : "text-zinc-600"
                            } flex items-center gap-2`}
                            title="Zobacz profil publiczny"
                          >
                             <FaUser className="text-sm"/>
                            Moje konto
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/dashboard"
                            className={`text-base transition-colors duration-200 font-semibold whitespace-nowrap hover:opacity-80 ${
                              pathname === "/login"
                                ? "text-white/90"
                                : "text-zinc-600"
                            } flex items-center gap-2`}
                          >
                             <FaUser className="text-sm"/>
                            Moje konto
                          </Link>
                        </>
                      )}
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className={`text-base transition-colors duration-200 font-semibold whitespace-nowrap hover:opacity-80 ${
                        pathname === "/login" ? "text-white" : "text-blue-600"
                      }`}
                    >
                      Zaloguj
                    </Link>
                  )}
                </div>
                <div className="ml-4 pl-4 xl:pl-6 border-l border-neutral-200">
                <DownloadApp />
                </div>
              </div>

              {/* Right actions on mobile when on dashboard */}
              {isDashboardRoute && (
                <div className="flex lg:hidden items-center gap-2">
                  <button
                    onClick={() => {
                      try {
                        window.dispatchEvent(
                          new CustomEvent("dashboard:set-tab", {
                            detail: "notifications",
                          })
                        );
                      } catch (_e) {}
                    }}
                    aria-label="Powiadomienia"
                    className="relative p-2 text-white/90"
                  >
                    <FaBell className="h-5 w-5" />
                    {dashboardNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-600 text-white text-[10px] leading-4 text-center">
                        {dashboardNotificationCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handleViewPublicProfile}
                    aria-label="Zobacz profil publiczny"
                    title="Zobacz profil publiczny"
                    className="p-2 text-white/90"
                  >
                    <FaExternalLinkAlt className="h-5 w-5" />
                  </button>
                  <button
                    onClick={logout}
                    aria-label="Wyloguj"
                    title="Wyloguj"
                    className="p-2 text-white/90"
                  >
                    <FaSignOutAlt className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu (site-wide). Hidden on dashboard where dashboard drawer is used */}

        {/* Bottom Navigation - Always visible on Mobile */}
      </header>
      {/* Enhanced Backdrop */}
      {!isDashboardRoute && (
        <div
          onClick={toggleMobileMenu}
          className={`fixed z-[110] inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={!isMobileMenuOpen}
        />
      )}
      {!isDashboardRoute && (
        <div
          className={`mobile-menu fixed top-0 h-full w-80 bg-white shadow-2xl transform transition-all duration-300 ease-out z-[120] lg:hidden ${
            isMobileMenuOpen 
              ? "left-0 translate-x-0 opacity-100 visible pointer-events-auto overflow-y-auto" 
              : "-left-full -translate-x-full opacity-0 invisible pointer-events-none overflow-hidden"
          }`}
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside menu from closing it
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="h-full flex flex-col">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center gap-3">
                <Image
                  src={logo}
                  alt="Logo Naily.pl"
                  width={100}
                  height={50}
                  className="h-16 w-auto"
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(false);
                }}
                className="h-10 w-10 flex items-center justify-center text-neutral-600 hover:text-blue-600 hover:bg-neutral-100 transition-colors rounded-full"
                aria-label="Zamknij menu"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* Enhanced Navigation Links */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Header Search (mobile) */}
              <div className="mb-6">
                <HeaderSearch 
                  placeholder="Szukaj miasta..." 
                  showSearchType={true}
                  defaultSearchType="manicure"
                />
              </div>
              
              {/* Login CTA - Prominent at top when not logged in */}
              {!user?.uid && (
                <Link
                  href="/login"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full mb-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-base transition-all duration-200 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  <FaUser className="text-base" />
                  <span>Zaloguj się</span>
                  <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              
              {/* Primary Navigation Section */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 px-2">
                  Nawigacja
                </h3>
                <nav className="space-y-1">
                  <Link
                    href="/"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-4 p-3.5 rounded-xl text-zinc-800 hover:bg-purple-50 hover:text-blue-700 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors flex-shrink-0">
                      <FaHome className="text-base text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-base block leading-tight">Strona główna</span>
                      <p className="text-xs text-neutral-500 mt-0.5 leading-tight">
                        Powrót do strony głównej
                      </p>
                    </div>
                    <FaChevronRight className="text-neutral-300 group-hover:text-blue-700 transition-colors flex-shrink-0 text-xs" />
                  </Link>

                  <Link
                    href="/szkolenia"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-4 p-3.5 rounded-xl text-zinc-800 hover:bg-purple-50 hover:text-blue-700 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors flex-shrink-0">
                      <FaGraduationCap className="text-base text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-base block leading-tight">Szkolenia</span>
                      <p className="text-xs text-neutral-500 mt-0.5 leading-tight">
                        Szkolenia instruktorek
                      </p>
                    </div>
                    <FaChevronRight className="text-neutral-300 group-hover:text-blue-700 transition-colors flex-shrink-0 text-xs" />
                  </Link>

                  <Link
                    href="/kariera"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-4 p-3.5 rounded-xl text-zinc-800 hover:bg-purple-50 hover:text-blue-700 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors flex-shrink-0">
                      <FaGem className="text-base text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-base block leading-tight">Oferty pracy manicure</span>
                      <p className="text-xs text-neutral-500 mt-0.5 leading-tight">
                        Oferty pracy w salonach
                      </p>
                    </div>
                    <FaChevronRight className="text-neutral-300 group-hover:text-blue-700 transition-colors flex-shrink-0 text-xs" />
                  </Link>

                  {isFeatureEnabled("blog") && (
                  <Link
                    href="/blog"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-4 p-3.5 rounded-xl text-zinc-800 hover:bg-purple-50 hover:text-blue-700 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors flex-shrink-0">
                      <FaBookOpen className="text-base text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-base block leading-tight">Blog</span>
                      <p className="text-xs text-neutral-500 mt-0.5 leading-tight">
                        Artykuły i porady
                      </p>
                    </div>
                    <FaChevronRight className="text-neutral-300 group-hover:text-blue-700 transition-colors flex-shrink-0 text-xs" />
                  </Link>
                  )}

                  {user?.uid && (
                    <Link
                      href="/dashboard"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-4 p-3.5 rounded-xl text-zinc-800 hover:bg-purple-50 hover:text-blue-700 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors flex-shrink-0">
                        <MdDashboard className="text-base text-blue-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-base block leading-tight">Dashboard</span>
                        <p className="text-xs text-neutral-500 mt-0.5 leading-tight">
                          Panel użytkownika
                        </p>
                      </div>
                      <FaChevronRight className="text-neutral-300 group-hover:text-blue-700 transition-colors flex-shrink-0 text-xs" />
                    </Link>
                  )}
                </nav>
              </div>
            </div>

            {/* Enhanced User Section */}
            {user?.uid && (
              <div className="p-6 border-t-2 border-neutral-200 bg-gradient-to-b from-purple-50/50 to-white">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-neutral-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-blue-700 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-zinc-800 truncate leading-tight">
                        {user.name || "Użytkownik"}
                      </p>
                      <p className="text-xs text-neutral-500 truncate leading-tight mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPublicProfile();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-blue-700 shadow-md hover:shadow-lg"
                  >
                    Zobacz profil
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      logout();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-zinc-800 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group border border-neutral-200"
                  >
                    <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors flex-shrink-0">
                      <FaSignOutAlt className="text-sm text-neutral-600 group-hover:text-red-600" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <span className="font-semibold text-sm block leading-tight">Wyloguj</span>
                      <p className="text-xs text-neutral-500 mt-0.5 leading-tight">Zamknij sesję</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login/Register Popup */}
      <LoginRegisterPopup
        isOpen={isLoginPopupOpen}
        onClose={closeLoginPopup}
        defaultTab={loginPopupTab}
        defaultAccountType={defaultAccountType}
      />
    </>
  );
}
