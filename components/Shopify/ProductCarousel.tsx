"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type Product = {
  id: string | number;
  title: string;
  image: string | null;
  price: string | number | null;
  handle?: string | null;
};

export default function ProductCarousel({
  title,
  query,
}: {
  title: string;
  query: string; // query string for /api/shopify/products e.g. "?limit=12&product_type=Gel"
}) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/shopify/products${query}`)
      .then((r) => r.json())
      .then((d) => setItems(d?.products || []))
      .catch(() => setItems([]));
  }, [query]);

  if (items.length === 0) return null;

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {items.map((p) => (
          <a
            key={p.id}
            href={p.handle ? `/shop/${p.handle}` : "#"}
            className="min-w-[180px] max-w-[180px] rounded-lg border hover:shadow transition-all"
          >
            <div className="relative w-full h-[140px] bg-neutral-50">
              <Image
                src={
                  typeof p.image === "string" &&
                  (p.image.startsWith("http://") ||
                    p.image.startsWith("https://") ||
                    p.image.startsWith("/"))
                    ? p.image
                    : "/services.png"
                }
                alt={p.title}
                fill
                sizes="180px"
                className="object-cover rounded-t-lg"
              />
            </div>
            <div className="p-2">
              <div className="text-sm font-medium line-clamp-2">{p.title}</div>
              {p.price && (
                <div className="text-rose-600 font-semibold text-sm mt-1">
                  {Number(p.price).toLocaleString("pl-PL", {
                    style: "currency",
                    currency: "PLN",
                  })}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


