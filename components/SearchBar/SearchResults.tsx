"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, ICity } from "@/types";
import UserCard from "@/components/CityPage/UserCard";
import Logic from "./Logic";
import Link from "next/link";
import { createLinkFromText } from "@/utils/createLinkFromText";

export default function SearchResults({ query: initialQuery }: { query: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [users, setUsers] = useState<User[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setUsers([]);
      setCities([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      
      if (!response.ok) throw new Error("Search failed");
      
      const data = await response.json();
      setUsers(data.users || []);
      setCities(data.cities || []);
    } catch (error) {
      console.error("Search error:", error);
      setUsers([]);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    router.push(`/wyniki?q=${encodeURIComponent(searchQuery)}`);
    performSearch(searchQuery);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl lg:text-5xl font-baloo font-bold text-black mb-4">
          Wyniki wyszukiwania
        </h1>
        <div className="mt-6">
          <Logic slugCity={query} variant="inline" />
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Szukam...</p>
        </div>
      )}

      {!loading && searched && (
        <>
          {users.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  Znaleziono <strong>{users.length}</strong> {users.length === 1 ? "specjalistkę" : "specjalistek"}
                  {query && ` dla "${query}"`}
                </p>
              </div>

              {/* Show cities if multiple cities found */}
              {cities.length > 1 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Wyniki z {cities.length} miast:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cities.map((city) => (
                      <Link
                        key={city.id}
                        href={`/kursy-stylizacji-paznokci/${city.id}`}
                        className="px-3 py-1 bg-white text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                      >
                        {city.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-6 md:gap-8">
                {users.map((user) => {
                  const cityLink = createLinkFromText(user.location?.address || "");
                  return (
                    <UserCard key={user.uid} user={user} cityParam={cityLink} />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                Nie znaleziono wyników dla &quot;{query}&quot;
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Spróbuj wyszukać po nazwie miasta lub słowach z branży (np. &quot;Warszawa&quot;, &quot;kurs stylizacji&quot;, &quot;szkolenie pedicure&quot;)
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/szkolenia"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Szukaj szkoleń
                </Link>
                <Link
                  href="/oferty-pracy-manicure"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Oferty pracy manicure
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {!searched && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Wpisz zapytanie wyszukiwania powyżej</p>
          <p className="text-gray-500 text-sm">
            Możesz szukać po nazwie miasta, usłudze lub kombinacji (np. &quot;Warszawa manicure&quot;)
          </p>
        </div>
      )}
    </div>
  );
}

