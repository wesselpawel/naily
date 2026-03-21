import { getUserById, getUsers, db } from "@/firebase";
import { User } from "@/types";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { Metadata } from "next";
import UserProfileClientWrapper from "./UserProfileClientWrapper";

async function fetchUserBySlugOrUid(slug: string): Promise<User | null> {
  try {
    const all = (await getUsers()) as User[];
    const bySlug = all.find(
      (u) => (u as User & { userSlugUrl?: string })?.userSlugUrl === slug
    );
    if (bySlug) return bySlug as User;
    // fallback to uid
    const byUid = (await getUserById(slug)) as User | null;
    return byUid || null;
  } catch {
    return null;
  }
}

// Generate SEO metadata - use configured metadata or generate automatically
function generateSeoMetadata(user: User): { title: string; description: string; keywords: string } {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://naily.pl";
  const profileUrl = user.userSlugUrl 
    ? `${baseUrl}/zarezerwuj/${user.userSlugUrl}`
    : `${baseUrl}/zarezerwuj/${user.uid}`;

  // Use configured SEO metadata if available (use configured values, generate missing ones)
  if (user.metadata?.seoTitle || user.metadata?.seoDescription) {
    // Use configured values, but generate missing ones
    const configuredTitle = user.metadata.seoTitle;
    const configuredDescription = user.metadata.seoDescription;
    
    // If both are configured, use them
    if (configuredTitle && configuredDescription) {
      return {
        title: configuredTitle,
        description: configuredDescription,
        keywords: user.metadata.seoKeywords || "",
      };
    }
    
    // If only title is configured, use it and generate description
    if (configuredTitle && !configuredDescription) {
      // Generate description but use configured title
      const userName = user.name || "Stylistka paznokci";
      const userLocation = user.location?.address || "";
      const userDescription = user.description || "";
      
      let cityName = "";
      if (userLocation) {
        cityName = userLocation.split(/\d{2}-\d{3}/)[0].trim();
        const parts = cityName.split(",");
        if (parts.length > 1) {
          cityName = parts[parts.length - 1].trim();
        }
        cityName = cityName.replace(/^(ul\.|ulica|pl\.|plac|al\.|aleja)\s+/i, "").trim();
      }
      
      const isSpecialist = user.seek === true;
      const isSalon = user.seek === false;
      const userType = isSpecialist ? "Specjalistka" : isSalon ? "Salon" : "Stylistka";
      
      let description = "";
      if (userDescription) {
        const descPreview = userDescription.slice(0, 140).trim();
        if (cityName && descPreview.length < 120) {
          description = `${descPreview} ${cityName}.`;
        } else {
          description = descPreview;
        }
      } else {
        if (cityName) {
          description = `Profesjonalna ${userType.toLowerCase()} paznokci ${cityName}. Sprawdź cennik, portfolio i zarezerwuj wizytę online.`;
        } else {
          description = `Profesjonalna ${userType.toLowerCase()} paznokci. Sprawdź cennik, portfolio i zarezerwuj wizytę online.`;
        }
      }
      if (description.length > 160) {
        description = description.slice(0, 157) + "...";
      }
      
      return {
        title: configuredTitle,
        description,
        keywords: user.metadata.seoKeywords || "",
      };
    }
    
    // If only description is configured, use it and generate title
    if (!configuredTitle && configuredDescription) {
      const userName = user.name || "Stylistka paznokci";
      const userLocation = user.location?.address || "";
      
      let cityName = "";
      if (userLocation) {
        cityName = userLocation.split(/\d{2}-\d{3}/)[0].trim();
        const parts = cityName.split(",");
        if (parts.length > 1) {
          cityName = parts[parts.length - 1].trim();
        }
        cityName = cityName.replace(/^(ul\.|ulica|pl\.|plac|al\.|aleja)\s+/i, "").trim();
      }
      
      const isSpecialist = user.seek === true;
      const isSalon = user.seek === false;
      const userType = isSpecialist ? "Specjalistka" : isSalon ? "Salon" : "Stylistka";
      
      let title = `${userName} - ${userType} paznokci`;
      if (cityName) {
        title = `${userName} - ${userType} paznokci ${cityName}`;
      }
      if (title.length > 60) {
        title = title.slice(0, 57) + "...";
      }
      
      return {
        title,
        description: configuredDescription,
        keywords: user.metadata.seoKeywords || "",
      };
    }
  }

  // Generate metadata automatically based on user data
  const userName = user.name || "Stylistka paznokci";
  const userLocation = user.location?.address || "";
  const userDescription = user.description || "";
  
  // Extract city name from address
  let cityName = "";
  if (userLocation) {
    // Remove postal codes and extra whitespace
    cityName = userLocation.split(/\d{2}-\d{3}/)[0].trim();
    // If address contains commas, take the city part
    const parts = cityName.split(",");
    if (parts.length > 1) {
      cityName = parts[parts.length - 1].trim();
    }
    // Remove common address prefixes
    cityName = cityName.replace(/^(ul\.|ulica|pl\.|plac|al\.|aleja)\s+/i, "").trim();
  }

  // Determine if user is a specialist or salon
  const isSpecialist = user.seek === true;
  const isSalon = user.seek === false;
  const userType = isSpecialist ? "Specjalistka" : isSalon ? "Salon" : "Stylistka";

  // Generate title (max 60 characters)
  let title = `${userName} - ${userType} paznokci`;
  if (cityName) {
    title = `${userName} - ${userType} paznokci ${cityName}`;
  }
  // Truncate if too long
  if (title.length > 60) {
    title = title.slice(0, 57) + "...";
  }

  // Generate description (max 160 characters)
  let description = "";
  if (userDescription) {
    // Use first 140 chars of description + location if available
    const descPreview = userDescription.slice(0, 140).trim();
    if (cityName && descPreview.length < 120) {
      description = `${descPreview} ${cityName}.`;
    } else {
      description = descPreview;
    }
  } else {
    // Generate default description
    if (cityName) {
      description = `Profesjonalna ${userType.toLowerCase()} paznokci ${cityName}. Sprawdź cennik, portfolio i zarezerwuj wizytę online.`;
    } else {
      description = `Profesjonalna ${userType.toLowerCase()} paznokci. Sprawdź cennik, portfolio i zarezerwuj wizytę online.`;
    }
  }
  // Truncate if too long
  if (description.length > 160) {
    description = description.slice(0, 157) + "...";
  }

  // Generate keywords
  const keywords = [
    userName,
    userType.toLowerCase(),
    "paznokcie",
    "manicure",
    "pedicure",
    cityName,
    "stylistka paznokci",
    "salon paznokci",
  ]
    .filter(Boolean)
    .join(", ");

  return { title, description, keywords };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const user = await fetchUserBySlugOrUid(slug);
  
  if (!user) {
    return {
      title: "Profil nie znaleziony - Naily",
      description: "Profil użytkownika nie został znaleziony.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://naily.pl";
  const profileUrl = user.userSlugUrl 
    ? `${baseUrl}/zarezerwuj/${user.userSlugUrl}`
    : `${baseUrl}/zarezerwuj/${user.uid}`;

  const siteOrigin = baseUrl.replace(/\/$/, "");
  const pickOg = (u?: string | null) => {
    if (!u || typeof u !== "string") return `${siteOrigin}/woman.png`;
    const t = u.trim();
    if (t.startsWith("http://") || t.startsWith("https://")) return t;
    if (t.startsWith("/")) return `${siteOrigin}${t}`;
    return `${siteOrigin}/woman.png`;
  };
  const ogImageUrl = user.bannerUrl
    ? pickOg(user.bannerUrl)
    : user.logo
      ? pickOg(user.logo)
      : `${siteOrigin}/woman.png`;
  
  const seo = generateSeoMetadata(user);

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    authors: [
      {
        name: user.name || "Naily",
        url: profileUrl,
      },
    ],
    publisher: "naily.pl",
    alternates: {
      canonical: profileUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: profileUrl,
      siteName: "naily.pl",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${user.name} - Profil stylistki paznokci`,
        },
      ],
      locale: "pl_PL",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [ogImageUrl],
    },
  };
}

export default async function UserPublicProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await fetchUserBySlugOrUid(slug);
  let portfolio: Array<{ id: string; url?: string; title?: string }> = [];

  if (user?.uid) {
    // First, try to get portfolio from user document field (used by dashboard/admin)
    // Check both 'portfolio' (new) and 'portfolioImages' (legacy) fields
    const userPortfolio = (user as any).portfolio || user.portfolioImages || [];
    
    if (Array.isArray(userPortfolio) && userPortfolio.length > 0) {
      portfolio = userPortfolio.map((item: any) => ({
        id: item.id || item.src || uuidv4(),
        url: item.url || item.src,
        title: item.title || item.text || "",
        description: item.description || "",
        ...item,
      }));
    } else {
      // Fallback: try Firestore subcollection (legacy method)
    try {
      const colRef = collection(db, "users", user.uid, "portfolio");
      const q = query(colRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      portfolio = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    } catch (_) {
      portfolio = [];
      }
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-100 to-neutral-200">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-primary-600 text-lg font-semibold mb-2">
            Nie znaleziono profilu
          </div>
          <p className="text-neutral-600 mb-4">
            Profil użytkownika może nie istnieć lub został usunięty
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            Wróć do strony głównej
          </Link>
        </div>
      </div>
    );
  }

  return (
    <UserProfileClientWrapper user={user} portfolio={portfolio} />
  );
}
