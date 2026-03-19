import { Metadata, Viewport } from "next";
import { Suspense } from "react";
import SearchResults from "@/components/SearchBar/SearchResults";

export const dynamic = "force-dynamic";

export default function WynikiPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 px-6 bg-purple-50">
        <div className="container">
          <Suspense fallback={<div className="text-center py-8">Ładowanie wyników...</div>}>
            <SearchResultsWrapper searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

async function SearchResultsWrapper({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  
  return <SearchResults query={query} />;
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e40af",
};

export const metadata: Metadata = {
  title: "Wyniki wyszukiwania - Naily",
  description: "Znajdź najlepsze salony i specjalistki manicure w Polsce",
};




















