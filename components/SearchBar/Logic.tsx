"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createLinkFromText } from "@/utils/createLinkFromText";
import { FaMagnifyingGlass } from "react-icons/fa6";

interface City {
  name: string;
  id: string;
}

export default function Logic({
  slugCity,
  variant = "stacked",
  baseRoute = "manicure",
}: {
  slugCity?: string;
  variant?: "inline" | "stacked";
  baseRoute?:
    | "manicure"
    | "kariera"
    | "szkolenia-manicure"
    | "szkolenia-pedicure"
    | "kursy-stylizacji-paznokci"
    | "kursy-pedicure";
}) {
  const [city, setCity] = useState<City>({
    name: "",
    id: "",
  });
  const [currentCitiesArray, setCurrentCitiesArray] = useState<City[]>([]);
  const [suppressFetch, setSuppressFetch] = useState<boolean>(false);
  const [resultSelected, setResultSelected] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const router = useRouter();
  // Debounce state updates
  const [debouncedCityName, setDebouncedCityName] = useState<string>(city.name);
  // Keep track of in-flight request to cancel stale ones
  const abortRef = useRef<AbortController | null>(null);
  // Track if city was initialized from slugCity prop (after redirect)
  const initializedFromSlugRef = useRef<boolean>(false);
  // Fetch cities with abort controller for cancelling previous requests
  const fetchCities = useCallback(
    async (query: string) => {
      try {
        // Cancel any previous request before starting a new one
        if (abortRef.current) {
          abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;
        setIsFetching(true);
        const cityLink = createLinkFromText(query);
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/cities/${cityLink}`, {

          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.length > 0 && data[0].name === city.name) {
          setCity({
            name: data[0].name,
            id: data[0].id,
          });
        }
        setCurrentCitiesArray(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching cities:", error);
        }
      } finally {
        setIsFetching(false);
      }
    },
    [city.name]
  );

  // Handle debounce logic - increased debounce time for better performance
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedCityName(city.name), 500);
    return () => clearTimeout(handler);
  }, [city.name]);

  // Cleanup on unmount: abort any in-flight request
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  // Fetch cities when debouncedCityName changes
  useEffect(() => {
    if (!debouncedCityName || resultSelected) {
      setCurrentCitiesArray([]);
      setIsFetching(false);
      return;
    }

    // Only search if we have at least 2 characters
    if (suppressFetch) {
      // Skip one fetch cycle right after a selection
      setSuppressFetch(false);
      setIsFetching(false);
      return;
    }
    
    // Don't fetch if city was initialized from slugCity (after redirect)
    if (initializedFromSlugRef.current) {
      setCurrentCitiesArray([]);
      setIsFetching(false);
      return;
    }
    
    if (debouncedCityName.length >= 2) {
      fetchCities(debouncedCityName);
    } else {
      setCurrentCitiesArray([]);
      setIsFetching(false);
    }
  }, [debouncedCityName, fetchCities, suppressFetch, resultSelected]);

  // Prefill current city when provided
  useEffect(() => {
    if (slugCity && !city.name) {
      initializedFromSlugRef.current = true;
      setCity({ name: slugCity, id: "" });
      // Clear the flag after a short delay to allow normal user interaction
      setTimeout(() => {
        initializedFromSlugRef.current = false;
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugCity]);

  // Service keywords to detect if user is searching for a service
  const SERVICE_KEYWORDS = [
    "manicure", "pedicure", "hybrydowy", "klasyczny", "przedłużanie",
    "zdobienie", "nail art", "akryl", "żel", "hybryda", "szyjka",
    "stylizacja", "paznokcie", "nail", "manicurzystka", "pedicurzystka"
  ];

  const hasServiceKeyword = (query: string): boolean => {
    const normalized = query.toLowerCase();
    return SERVICE_KEYWORDS.some(keyword => normalized.includes(keyword));
  };

  const search = () => {
    const query = city.name.trim();
    
    if (!query.length) {
      toast.error("Proszę wpisać miasto lub usługę.", {
        position: "top-center",
        draggable: true,
        autoClose: 5000,
      });
      return;
    }

    setIsNavigating(true);
    
    // For Szkolenia and Kariera pages, prioritize city route over service search
    if (
      baseRoute === "szkolenia-manicure" ||
      baseRoute === "szkolenia-pedicure" ||
      baseRoute === "kursy-stylizacji-paznokci" ||
      baseRoute === "kursy-pedicure" ||
      baseRoute === "kariera"
    ) {
      // If we have a city ID from dropdown selection, use it
      if (city.id) {
        router.push(`/${baseRoute}/${city.id}`);
      } 
      // If we have cities in the dropdown results, use the first one
      else if (currentCitiesArray.length > 0) {
        const matchedCity = currentCitiesArray[0];
        router.push(`/${baseRoute}/${matchedCity.id}`);
      }
      // Otherwise, try to extract city from query by removing service keywords
      else {
        // Remove service keywords and try to find city
        let cityQuery = query.toLowerCase();
        for (const keyword of SERVICE_KEYWORDS) {
          cityQuery = cityQuery.replace(new RegExp(keyword, 'gi'), '').trim();
        }
        // If there's still text left, try to use it as city
        if (cityQuery.length > 0) {
          const cityLink = createLinkFromText(cityQuery);
          router.push(`/${baseRoute}/${cityLink}`);
        } else {
          // Fallback to smart search
          router.push(`/wyniki?q=${encodeURIComponent(query)}`);
        }
      }
    } else {
      // For manicure (default) - use smart search if service keyword found
      if (hasServiceKeyword(query)) {
        router.push(`/wyniki?q=${encodeURIComponent(query)}`);
      } else if (city.id) {
        // Exact city match - go to city page based on baseRoute
        router.push(`/${baseRoute}/${city.id}`);
      } else if (currentCitiesArray.length > 0) {
        // Use first dropdown result
        const matchedCity = currentCitiesArray[0];
        router.push(`/${baseRoute}/${matchedCity.id}`);
      } else {
        // Try to create city link from query and go to city page
        const cityLink = createLinkFromText(query);
        router.push(`/${baseRoute}/${cityLink}`);
      }
    }
  };
  return (
    <div className="flex w-full relative">
      {variant === "inline" ? (
        <div className="flex w-full items-center gap-4">
          {/* Input */}
          <div className="relative flex-1 group">
            <input
              type="text"
              name="city"
              value={city.name}
              onChange={(e) => {
                setResultSelected(false);
                initializedFromSlugRef.current = false; // Clear flag on user input
                setCity({ ...city, name: e.target.value });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  search();
                }
              }}
              placeholder={slugCity || "np. Warszawa, manicure, Warszawa manicure"}
              disabled={isNavigating}
              className="w-full bg-white border border-neutral-300 rounded-full placeholder:text-neutral-500 text-zinc-800 pl-12 pr-12 py-4 text-base focus:outline-none transition-all duration-300"
              autoComplete="off"
              list="no-autocomplete"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
              <FaMagnifyingGlass className="w-4 h-4" />
            </div>
            {isFetching && !isNavigating && (
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 animate-spin"
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
                normalize(currentCitiesArray[0].name).toLowerCase() ===
                  normalize(city.name);
              return (
                currentCitiesArray.length > 0 &&
                !onlySameSingle &&
                !resultSelected &&
                !isNavigating
              );
            })() && (
              <div className="z-[60] absolute left-0 right-0 top-full mt-2 animate-slide-in-down">
                <ul className="max-h-[200px] bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden overflow-y-auto">
                  {currentCitiesArray.map((c, index) => (
                    <li
                      key={index}
                      className="group px-4 py-3 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-all duration-200 border-b border-neutral-100 last:border-b-0 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setCity({ ...city, name: c.name, id: c.id });
                        setCurrentCitiesArray([]);
                        setSuppressFetch(true);
                        setResultSelected(true);
                        setIsNavigating(true);
                        router.push(`/${baseRoute}/${c.id}`);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{c.name}</span>
                        <svg
                          className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* Button */}
          <button
            type="button"
            className="rounded-full font-semibold p-3 text-base bg-blue-600 text-white hover:bg-blue-700 transition-all px-6 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={search}
            disabled={!city.name.length || isNavigating}
          >
            {isNavigating ? "..." : "Szukaj"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col w-full">
          {/* Stacked (default) */}
          <div className="relative lg:w-3/4 group">
            <input
              type="text"
              name="city"
              value={city.name}
              onChange={(e) => {
                setResultSelected(false);
                initializedFromSlugRef.current = false; // Clear flag on user input
                setCity({ ...city, name: e.target.value });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  search();
                }
              }}
              placeholder={slugCity || "np. Warszawa, manicure, Warszawa manicure"}
              disabled={isNavigating}
              className="w-full bg-white border border-neutral-300 rounded-full placeholder:text-neutral-500 text-zinc-800 pl-16 pr-12 py-5 text-base lg:text-xl focus:outline-none transition-all duration-300"
              autoComplete="off"
              list="no-autocomplete"
            />
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-neutral-500 transition-colors duration-200">
              <FaMagnifyingGlass className="w-5 h-5" />
            </div>
            {isFetching && !isNavigating && (
              <svg
                className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 animate-spin"
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
                normalize(currentCitiesArray[0].name).toLowerCase() ===
                  normalize(city.name);
              return (
                currentCitiesArray.length > 0 &&
                !onlySameSingle &&
                !resultSelected &&
                !isNavigating
              );
            })() && (
              <div className="z-[60] absolute left-0 right-0 top-full mt-2 animate-slide-in-down">
                <ul className="max-h-[200px] bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden overflow-y-auto">
                  {currentCitiesArray.map((c, index) => (
                    <li
                      key={index}
                      className="group px-4 py-3 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-all duration-200 border-b border-neutral-100 last:border-b-0 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setCity({ ...city, name: c.name, id: c.id });
                        setCurrentCitiesArray([]);
                        setSuppressFetch(true);
                        setResultSelected(true);
                        setIsNavigating(true);
                        router.push(`/${baseRoute}/${c.id}`);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{c.name}</span>
                        <svg
                          className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <button
            type="button"
            className="group relative mt-4 rounded-full font-semibold z-[50] p-3 text-base lg:text-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800  transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99] lg:w-max max-w-full px-8 disabled:cursor-not-allowed"
            onClick={search}
            disabled={!city.name.length || isNavigating}
          >
            <span className="flex items-center justify-center gap-2">
              {isNavigating && (
                <svg
                  className="w-5 h-5 animate-spin text-white"
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
              {isNavigating ? "Przekierowuję..." : "Znajdź specjalistkę"}
            </span>
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      )}
    </div>
  );
}
