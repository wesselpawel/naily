"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { createLinkFromText } from "@/utils/createLinkFromText";
import { FaChevronDown } from "react-icons/fa";

type City = {
  name: string;
  id: string;
};

type SearchType = "manicure" | "pedicure" | "szkolenia" | "kariera";

const searchTypeLabels: Record<SearchType, string> = {
  manicure: "Manicure",
  pedicure: "Pedicure",
  szkolenia: "Szkolenia",
  kariera: "Oferty pracy",
};

export default function HeaderSearch({
  placeholder = "Miasto",
  showSearchType = false,
  defaultSearchType = "manicure",
}: {
  placeholder?: string;
  showSearchType?: boolean;
  defaultSearchType?: SearchType;
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
      case "manicure":
        return `/manicure/${citySlug}`;
      case "pedicure":
        return `/pedicure/${citySlug}`;
      case "szkolenia":
        return `/kursy-stylizacji-paznokci/${citySlug}`;
      case "kariera":
        return `/kariera/${citySlug}`;
      default:
        return `/manicure/${citySlug}`;
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

  return (
    <div className="relative w-full md:max-w-[400px] h-full flex items-end justify-end">
      <div className="gap-2 relative flex h-max w-full">
        <div className="">
        {showSearchType && (
          <div className="cursor-pointer absolute left-1 md:left-2 top-1/2 -translate-y-1/2" ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center rounded-full py-2 px-1.5 md:px-2 md:py-1 text-[10px] md:text-xs transition-colors whitespace-nowrap focus:outline-none
                ${searchType === "manicure" && "bg-blue-600 text-white"}
                ${searchType === "pedicure" && "bg-green-600 text-white"}
                ${searchType === "szkolenia" && "bg-yellow-600 text-white"}
                ${searchType === "kariera" && "bg-purple-600 text-white"}
                `}
            >
              <span className="font-bold text-white">{searchTypeLabels[searchType]}</span>
            </div>
            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-neutral-200 rounded-lg shadow-xl z-50">
                {(["manicure", "pedicure", "szkolenia", "kariera"] as SearchType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setSearchType(type);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      searchType === type ? "bg-blue-50 text-blue-700 font-semibold" : "text-zinc-700"
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
          className={`focus:outline-none border border-neutral-200 block w-full bg-white text-xs md:text-sm rounded-full pl-18 md:pl-24  py-1.5 md:py-2 shadow-sm disabled:opacity-60 h-10`}
          autoComplete="off"
        />
        <button 
            onClick={search}
        
        disabled={!city.name.length || isNavigating}
        className="w-max absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2">
          <div
            className={`cursor-pointer px-2 py-2 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs ${
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
            className="absolute right-16 md:right-20 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-blue-600 animate-spin"
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

        {(() => {
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
        })() && (
          <div className="absolute z-[90] left-0 right-0 top-full mt-2 w-full">
            <ul className="max-h-56 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-xl shadow-xl overflow-hidden overflow-y-auto">
              {currentCitiesArray.map((c, index) => (
                <li
                  key={`${c.id}-${index}`}
                  className="px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 cursor-pointer border-b border-neutral-100 last:border-0"
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
