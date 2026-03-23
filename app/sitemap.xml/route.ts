import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 3600;
export const runtime = "nodejs";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://naily.pl";
  const now = new Date().toISOString();

  const sitemaps = [
    `${baseUrl}/sitemap-1.xml`,
    `${baseUrl}/sitemap-kariera.xml`,
    `${baseUrl}/sitemap-szkolenia.xml`,
    `${baseUrl}/sitemap-pedicure.xml`,
    `${baseUrl}/sitemap-szkolenia-pedicure.xml`,
  ];

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (url) => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;

  return new NextResponse(sitemapIndex, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

