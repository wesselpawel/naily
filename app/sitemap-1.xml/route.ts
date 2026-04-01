import { NextResponse } from "next/server";
import { getUsers } from "@/utils/getUsers";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour
export const runtime = "nodejs"; // Ensure Node.js runtime for server-side functions

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://naily.pl";

    // Use Promise.allSettled to prevent one failure from breaking the entire sitemap
    const [usersResult, postsResult] = await Promise.allSettled([
      getUsers(),
      // Prefer API list with real posts if available; fall back to samples util
      fetch(`${baseUrl}/api/posts/list`, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })
        .then((r) => {
          if (!r.ok) return [];
          return r.json();
        })
        .catch(() => []),
    ]);

    const users = usersResult.status === "fulfilled" ? usersResult.value : [];
    const posts = postsResult.status === "fulfilled" ? postsResult.value : [];

  const userEntries = Array.isArray(users)
    ? users
        .map((u: any) => {
          const slug = u?.userSlugUrl || u?.uid;
          if (!slug) return null;
          return {
            url: `${baseUrl}/zarezerwuj/${slug}`,
            changefreq: "weekly",
            priority: 0.8,
          };
        })
        .filter(Boolean)
    : [];

  const postEntries = Array.isArray(posts)
    ? posts
        .map((p: any) => {
          const slug = p?.slug || p?.url || p?.postId || p?.id;
          if (!slug) return null;
          return {
            url: `${baseUrl}/blog/${slug}`,
            changefreq: "weekly",
            priority: 0.7,
          };
        })
        .filter(Boolean)
    : [];

  const base = [
    { url: `${baseUrl}/`, changefreq: "weekly", priority: 1 },
    { url: `${baseUrl}/blog`, changefreq: "weekly", priority: 0.7 },
    { url: `${baseUrl}/szkolenia`, changefreq: "weekly", priority: 0.8 },
    { url: `${baseUrl}/oferty-pracy-manicure`, changefreq: "weekly", priority: 0.8 },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${base
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
${userEntries
  .map(
    (entry: any) => `  <url>
    <loc>${entry.url}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
${postEntries
  .map(
    (entry: any) => `  <url>
    <loc>${entry.url}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap-1.xml:", error);
    // Return minimal valid sitemap on error
    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${process.env.NEXT_PUBLIC_URL || "https://naily.pl"}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1</priority>
  </url>
</urlset>`;
    return new NextResponse(errorSitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  }
}

