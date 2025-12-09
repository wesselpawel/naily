"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createLinkFromText } from "@/utils/createLinkFromText";

type City = {
  name: string;
  id: string;
};

export default function HeaderSearch({
  placeholder = "Miasto",
}: {
  placeholder?: string;
}) {
  const [city, setCity] = useState<City>({ name: "", id: "" });
  const [currentCitiesArray, setCurrentCitiesArray] = useState<City[]>([]);
  const [suppressFetch, setSuppressFetch] = useState<boolean>(false);
  const [resultSelected, setResultSelected] = useState<boolean>(false);
  const [debouncedCityName, setDebouncedCityName] = useState<string>("");
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const router = useRouter();

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

  const search = () => {
    if (!city.name.length) {
      toast.error("Proszę wybrać miasto.");
      return;
    }
    const cityLink = createLinkFromText(city.name);
    setIsNavigating(true);
    router.push(`/manicure-pedicure/${cityLink}`);
  };

  return (
    <div className="pl-4 relative w-full md:max-w-[320px] h-full flex items-end justify-end">
      <div className="gap-2 relative flex h-max">
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
          className="focus:outline-none border border-neutral-200 block w-full bg-white text-sm rounded-lg pl-10 pr-20 shadow-sm disabled:opacity-60"
          autoComplete="off"
        />
        <div className="w-max">
          <button
            onClick={search}
            disabled={!city.name.length || isNavigating}
            className={`px-3 rounded-lg text-xs ${
              city.name.length && !isNavigating
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isNavigating ? "Przekierowuję..." : "Szukaj"}
          </button>
        </div>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        {isFetching && !isNavigating && (
          <svg
            className="absolute right-20 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 animate-spin"
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
                    const cityLink = createLinkFromText(c.name);
                    setIsNavigating(true);
                    router.push(`/manicure-pedicure/${cityLink}`);
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
