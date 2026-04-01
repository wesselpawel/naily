"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { createLinkFromText } from "@/utils/createLinkFromText";
import { FaChevronDown } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";

type City = {
  name: string;
  id: string;
};

type SearchType = "kursyStylizacji" | "kursyPedicure" | "kariera";
type HeaderSearchVariant = "default" | "desktopHeader" | "mobileMenu";

const searchTypeLabels: Record<SearchType, string> = {
  kursyStylizacji: "Kurs stylizacji paznokci",
  kursyPedicure: "Kurs pedicure",
  kariera: "Oferty pracy",
};

const searchTypeStyles: Record<
  SearchType,
  {
    pill: string;
    badge: string;
    button: string;
    ring: string;
  }
> = {
  kursyStylizacji: {
    pill: "bg-blue-600 text-white",
    badge: "bg-blue-100 text-blue-700",
    button: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
    ring: "focus:ring-blue-200",
  },
  kursyPedicure: {
    pill: "bg-green-600 text-white",
    badge: "bg-green-100 text-green-700",
    button: "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
    ring: "focus:ring-green-200",
  },
  kariera: {
    pill: "bg-purple-600 text-white",
    badge: "bg-purple-100 text-purple-700",
    button:
      "from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800",
    ring: "focus:ring-purple-200",
  },
};

const searchTypeOptions: SearchType[] = [
  "kursyStylizacji",
  "kursyPedicure",
  "kariera",
];

export default function HeaderSearch({
  placeholder = "Miasto",
  showSearchType = false,
  defaultSearchType = "kursyStylizacji",
  variant = "default",
}: {
  placeholder?: string;
  showSearchType?: boolean;
  defaultSearchType?: SearchType;
  variant?: HeaderSearchVariant;
}) {
  const [city, setCity] = useState<City>({ name: "", id: "" });
  const [currentCitiesArray, setCurrentCitiesArray] = useState<City[]>([]);
  const [suppressFetch, setSuppressFetch] = useState<boolean>(false);
  const [resultSelected, setResultSelected] = useState<boolean>(false);
  const [debouncedCityName, setDebouncedCityName] = useState<string>("");
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [searchType, setSearchType] = useState<SearchType>(defaultSearchType);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchCities = useCallback(async (query: string) => {
    try {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsFetching(true);
      const cityLink = createLinkFromText(query);
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/cities/${cityLink}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) setCurrentCitiesArray(data);
    } catch (err: unknown) {
      const error = err as { name?: string } | undefined;
      if (error?.name !== "AbortError") {
        console.error("HeaderSearch fetch error", err);
      }
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCityName(city.name), 400);
    return () => clearTimeout(t);
  }, [city.name]);

  useEffect(() => {
    if (!debouncedCityName || resultSelected) {
      setCurrentCitiesArray([]);
      setIsFetching(false);
      return;
    }
    if (suppressFetch) {
      setSuppressFetch(false);
      setIsFetching(false);
      return;
    }
    if (debouncedCityName.length >= 2) fetchCities(debouncedCityName);
    else {
      setCurrentCitiesArray([]);
      setIsFetching(false);
    }
  }, [debouncedCityName, fetchCities, suppressFetch, resultSelected]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Reset navigating state when route changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const getSearchPath = (type: SearchType, citySlug: string): string => {
    switch (type) {
      case "kursyStylizacji":
        return `/kursy-stylizacji-paznokci/${citySlug}`;
      case "kursyPedicure":
        return `/kursy-pedicure/${citySlug}`;
      case "kariera":
        return `/oferty-pracy-manicure/${citySlug}`;
      default:
        return `/kursy-stylizacji-paznokci/${citySlug}`;
    }
  };

  const search = () => {
    if (!city.name.length) {
      toast.error("Proszę wybrać miasto.");
      return;
    }
    setIsNavigating(true);
    // Use city.id if available (from dropdown selection), otherwise create link from name
    const citySlug = city.id || createLinkFromText(city.name);
    const path = getSearchPath(searchType, citySlug);
    router.push(path);
  };

  const isMobileMenu = variant === "mobileMenu";
  const isDesktopHeader = variant === "desktopHeader";
  const activeSearchTypeStyles = searchTypeStyles[searchType];
  const showSuggestions = (() => {
    const normalize = (s: string) => s.trim().toLowerCase();
    const onlySameSingle =
      currentCitiesArray.length === 1 &&
      normalize(currentCitiesArray[0].name) === normalize(city.name);
    return (
      currentCitiesArray.length > 0 &&
      !onlySameSingle &&
      !resultSelected &&
      !isNavigating
    );
  })();

  return (
    <div
      className={`relative h-full w-full ${
        isMobileMenu
          ? ""
          : isDesktopHeader
            ? ""
            : "flex items-end justify-end md:max-w-[400px]"
      }`}
    >
      <div
        className={`relative w-full ${
          isMobileMenu
            ? "rounded-3xl border border-neutral-200 bg-white/95 p-3 shadow-lg"
            : isDesktopHeader
              ? "rounded-full border border-neutral-200 bg-white px-2 py-2 shadow-sm"
              : "flex gap-2"
        }`}
      >
        {isMobileMenu ? (
          <>
            {showSearchType && (
              <div className="mb-3" ref={dropdownRef}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Szukaj w kategorii
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${activeSearchTypeStyles.badge}`}
                  >
                    {searchTypeLabels[searchType]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left text-sm font-semibold text-zinc-800 transition focus:outline-none focus:ring-4 ${activeSearchTypeStyles.ring}`}
                >
                  <span className="pr-3">{searchTypeLabels[searchType]}</span>
                  <FaChevronDown
                    className={`h-3.5 w-3.5 flex-shrink-0 text-neutral-500 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-2xl">
                    {searchTypeOptions.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setSearchType(type);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition-colors ${
                          searchType === type
                            ? "bg-blue-50 font-semibold text-blue-700"
                            : "text-zinc-700 hover:bg-neutral-50"
                        }`}
                      >
                        <span>{searchTypeLabels[type]}</span>
                        {searchType === type && (
                          <span className="text-xs font-semibold">Aktywne</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <FaMagnifyingGlass className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={city.name}
                onChange={(e) => {
                  setResultSelected(false);
                  setCity({ ...city, name: e.target.value });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    search();
                  }
                }}
                placeholder={placeholder}
                disabled={isNavigating}
                className="block h-12 w-full rounded-2xl border border-neutral-200 bg-white pl-11 pr-11 text-sm text-zinc-800 shadow-sm transition focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                autoComplete="off"
              />
              {isFetching && !isNavigating && (
                <svg
                  className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <circle
                    className="opacity-90"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="60"
                    strokeDashoffset="40"
                  />
                </svg>
              )}
            </div>

            <button
              type="button"
              onClick={search}
              disabled={!city.name.length || isNavigating}
              className={`mt-3 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r px-4 text-sm font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 ${activeSearchTypeStyles.button}`}
            >
              {isNavigating ? "Przekierowuję..." : "Szukaj"}
            </button>
          </>
        ) : isDesktopHeader ? (
          <div className="flex w-full items-center gap-2">
            {showSearchType && (
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition focus:outline-none focus:ring-4 ${activeSearchTypeStyles.pill} ${activeSearchTypeStyles.ring}`}
                >
                  <span className="max-w-[180px] truncate text-sm">
                    {searchTypeLabels[searchType]}
                  </span>
                  <FaChevronDown
                    className={`h-3.5 w-3.5 flex-shrink-0 text-white transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isDropdownOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-neutral-200 bg-white p-2 shadow-2xl">
                    {searchTypeOptions.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setSearchType(type);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full rounded-xl px-4 py-3 text-left text-sm transition-colors ${
                          searchType === type
                            ? "bg-blue-50 font-semibold text-blue-700"
                            : "text-zinc-700 hover:bg-neutral-50"
                        }`}
                      >
                        {searchTypeLabels[type]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="relative min-w-0 flex-1">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <FaMagnifyingGlass className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={city.name}
                onChange={(e) => {
                  setResultSelected(false);
                  setCity({ ...city, name: e.target.value });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    search();
                  }
                }}
                placeholder={placeholder}
                disabled={isNavigating}
                className="block h-11 w-full rounded-full bg-transparent pl-11 pr-12 text-sm text-zinc-800 placeholder:text-neutral-400 focus:outline-none disabled:opacity-60"
                autoComplete="off"
              />
              {isFetching && !isNavigating && (
                <svg
                  className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <circle
                    className="opacity-90"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="60"
                    strokeDashoffset="40"
                  />
                </svg>
              )}
            </div>

            <button
              type="button"
              onClick={search}
              disabled={!city.name.length || isNavigating}
              className="shrink-0 rounded-full bg-neutral-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isNavigating ? "Przekierowuję..." : "Szukaj"}
            </button>
          </div>
        ) : (
          <>
            <div className="">
              {showSearchType && (
                <div
                  className="absolute left-1 top-1/2 -translate-y-1/2 cursor-pointer md:left-2"
                  ref={dropdownRef}
                >
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center rounded-full px-1.5 py-2 text-[10px] transition-colors whitespace-nowrap focus:outline-none md:px-2 md:py-1 md:text-xs ${activeSearchTypeStyles.pill}`}
                  >
                    <span className="font-bold text-white">
                      {searchTypeLabels[searchType]}
                    </span>
                  </div>
                  {isDropdownOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-lg border border-neutral-200 bg-white shadow-xl">
                      {searchTypeOptions.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setSearchType(type);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            searchType === type
                              ? "bg-blue-50 font-semibold text-blue-700"
                              : "text-zinc-700 hover:bg-blue-50"
                          }`}
                        >
                          {searchTypeLabels[type]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <input
                type="text"
                value={city.name}
                onChange={(e) => {
                  setResultSelected(false);
                  setCity({ ...city, name: e.target.value });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    search();
                  }
                }}
                placeholder={placeholder}
                disabled={isNavigating}
                className="block h-10 w-full rounded-full border border-neutral-200 bg-white py-1.5 pl-18 text-xs shadow-sm focus:outline-none disabled:opacity-60 md:py-2 md:pl-24 md:text-sm"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={search}
                disabled={!city.name.length || isNavigating}
                className="absolute right-1.5 top-1/2 w-max -translate-y-1/2 md:right-2"
              >
                <div
                  className={`cursor-pointer rounded-full px-2 py-2 text-[10px] md:px-3 md:py-1 md:text-xs ${
                    city.name.length && !isNavigating
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  {isNavigating ? "Przekierowuję..." : "Szukaj"}
                </div>
              </button>
            </div>

            {isFetching && !isNavigating && (
              <svg
                className="absolute right-16 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-blue-600 md:right-20 md:h-4 md:w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <circle
                  className="opacity-90"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="60"
                  strokeDashoffset="40"
                />
              </svg>
            )}
          </>
        )}

        {showSuggestions && (
          <div
            className={`absolute left-0 right-0 z-[90] w-full ${
              isMobileMenu ? "top-full mt-3" : "top-full mt-2"
            }`}
          >
            <ul
              className={`overflow-hidden overflow-y-auto border border-neutral-200 bg-white/95 shadow-xl ${
                isMobileMenu
                  ? "max-h-72 rounded-2xl backdrop-blur-xl"
                  : "max-h-56 rounded-xl backdrop-blur-md"
              }`}
            >
              {currentCitiesArray.map((c, index) => (
                <li
                  key={`${c.id}-${index}`}
                  className={`cursor-pointer border-b border-neutral-100 text-sm text-zinc-700 last:border-0 hover:bg-blue-50 hover:text-blue-700 ${
                    isMobileMenu ? "px-4 py-3" : "px-3 py-2"
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setCity({ ...city, name: c.name, id: c.id });
                    setCurrentCitiesArray([]);
                    setSuppressFetch(true);
                    setResultSelected(true);
                    setIsNavigating(true);
                    const path = getSearchPath(searchType, c.id);
                    router.push(path);
                  }}
                >
                  {c.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
