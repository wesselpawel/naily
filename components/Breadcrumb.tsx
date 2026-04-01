"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaChevronRight } from "react-icons/fa";

interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function Breadcrumb() {
  const pathname = usePathname();

  // Don't show breadcrumb on home page or dashboard
  if (pathname === "/" || pathname?.startsWith("/dashboard")) {
    return null;
  }

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: "Strona główna", href: "/" }
    ];

    if (!pathname) return items;

    const segments = pathname.split("/").filter(Boolean);

    segments.forEach((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      
      // Map segment to readable label
      let label = segment;
      
      // Handle special routes
      if (segment === "manicure") {
        label = "Manicure";
      } else if (segment === "pedicure") {
        label = "Pedicure";
      } else if (segment === "kursy-stylizacji-paznokci") {
        label = "Kursy stylizacji paznokci";
      } else if (segment === "kursy-pedicure") {
        label = "Kursy pedicure";
      } else if (segment === "szkolenia-manicure") {
        label = "Szkolenia Manicure";
      } else if (segment === "szkolenia-pedicure") {
        label = "Szkolenia Pedicure";
      } else if (
        segment === "oferty-pracy-manicure" ||
        segment === "kariera"
      ) {
        label = "Oferty pracy manicure";
      } else if (segment === "blog") {
        label = "Blog";
      } else if (segment === "kategoria") {
        label = "Kategoria";
      } else if (segment === "zarezerwuj") {
        label = "Rezerwacja";
      } else if (segment === "szkolenia") {
        label = "Szkolenia";
      } else if (segment === "wyniki") {
        label = "Wyniki";
      } else if (segment === "influencer-program") {
        label = "Program Partnerski";
      } else if (segment === "kreator-profilu") {
        label = "Kreator Profilu";
      } else {
        // Capitalize first letter and replace hyphens with spaces
        label = segment
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }

      items.push({ label, href });
    });

    return items;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show if only home breadcrumb
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-white border-b border-gray-200/50 shadow-sm"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 py-3 text-sm">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return (
              <li key={item.href} className="flex items-center">
                {index === 0 ? (
                  <Link
                    href={item.href}
                    className="flex items-center text-gray-500 hover:text-blue-600 transition-colors duration-200"
                    aria-label="Strona główna"
                  >
                    <FaHome className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <FaChevronRight className="w-3 h-3 text-gray-400 mx-2 flex-shrink-0" />
                    {isLast ? (
                      <span
                        className="font-medium text-gray-900 font-poppins"
                        aria-current="page"
                      >
                        {item.label}
                      </span>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-gray-500 hover:text-blue-600 transition-colors duration-200 font-poppins"
                      >
                        {item.label}
                      </Link>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}








