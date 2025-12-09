import { NextRequest, NextResponse } from "next/server";

type ShopifyAdminProduct = {
  id: number | string;
  title: string;
  handle?: string;
  status?: string;
  vendor?: string;
  product_type?: string;
  body_html?: string;
  tags?: string;
  images?: Array<{ src?: string; alt?: string }>;
  variants?: Array<{
    id?: string | number;
    price?: string | number;
    compare_at_price?: string | number;
  }>;
};

// GET /api/shopify/products?limit=12&product_type=...&vendor=...&title=...&collection_id=...&fetch_all=true
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const domainRaw = process.env.SHOPIFY_STORE_DOMAIN; // e.g. my-store.myshopify.com
  const accessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-07";

  if (!domainRaw || !accessToken) {
    return NextResponse.json(
      {
        error:
          "Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_API_ACCESS_TOKEN environment variables",
      },
      { status: 500 }
    );
  }

  const domain = domainRaw.replace(/^https?:\/\//, "").replace(/\/$/, "");

  // Check if we should fetch all products
  const fetchAll = searchParams.get("fetch_all") === "true";

  const limitRaw = searchParams.get("limit");
  let limit = 12;
  if (limitRaw && !fetchAll) {
    const parsed = Number(limitRaw);
    if (!Number.isNaN(parsed)) {
      limit = Math.max(1, Math.min(parsed, 50));
    }
  }

  // Optional filters supported by Shopify Admin REST
  const vendor = searchParams.get("vendor");
  const productType = searchParams.get("product_type");
  const title = searchParams.get("title");
  const collectionId = searchParams.get("collection_id");

  try {
    let allProducts: ShopifyAdminProduct[] = [];

    if (fetchAll) {
      // Fetch all products using pagination
      let hasNextPage = true;
      let pageInfo: string | null = null;
      const maxPerPage = 250; // Shopify's maximum limit per request

      while (hasNextPage) {
        const url = new URL(
          `https://${domain}/admin/api/${apiVersion}/products.json`
        );
        url.searchParams.set("limit", String(maxPerPage));

        // Add filters
        if (vendor) url.searchParams.set("vendor", vendor);
        if (productType) url.searchParams.set("product_type", productType);
        if (title) url.searchParams.set("title", title);
        if (collectionId) url.searchParams.set("collection_id", collectionId);

        // Add pagination cursor if we have one
        if (pageInfo) {
          url.searchParams.set("page_info", pageInfo);
        }

        const res = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "X-Shopify-Access-Token": accessToken,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text();
          return NextResponse.json(
            { error: `Shopify error ${res.status}: ${text}` },
            { status: res.status }
          );
        }

        const data = (await res.json()) as {
          products?: Array<ShopifyAdminProduct>;
        };

        const pageProducts = Array.isArray(data.products) ? data.products : [];
        allProducts = [...allProducts, ...pageProducts];

        // Check if we have more pages
        const linkHeader = res.headers.get("link");
        if (linkHeader && linkHeader.includes('rel="next"')) {
          // Extract next page info from link header
          const nextMatch = linkHeader.match(
            /<[^>]*page_info=([^&>]+)[^>]*>;\s*rel="next"/
          );
          if (nextMatch) {
            pageInfo = nextMatch[1];
          } else {
            hasNextPage = false;
          }
        } else {
          hasNextPage = false;
        }

        // Safety check to prevent infinite loops (max 100 pages = 25,000 products)
        if (allProducts.length > 25000) {
          break;
        }
      }
    } else {
      // Fetch with limit (existing behavior)
      const url = new URL(
        `https://${domain}/admin/api/${apiVersion}/products.json`
      );
      url.searchParams.set("limit", String(limit));

      if (vendor) url.searchParams.set("vendor", vendor);
      if (productType) url.searchParams.set("product_type", productType);
      if (title) url.searchParams.set("title", title);
      if (collectionId) url.searchParams.set("collection_id", collectionId);

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json(
          { error: `Shopify error ${res.status}: ${text}` },
          { status: res.status }
        );
      }

      const data = (await res.json()) as {
        products?: Array<ShopifyAdminProduct>;
      };

      allProducts = Array.isArray(data.products) ? data.products : [];
    }

    // Map to a slimmer payload
    const mapped = allProducts.map((p) => {
      const firstImage =
        Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null;
      const firstVariant =
        Array.isArray(p.variants) && p.variants.length > 0
          ? p.variants[0]
          : null;
      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        status: p.status,
        vendor: p.vendor,
        productType: p.product_type,
        description: p.body_html || null,
        tags: p.tags || null,
        image: firstImage ? firstImage.src : null,
        imageAlt: firstImage ? firstImage.alt : null,
        price: firstVariant ? firstVariant.price : null,
        compareAtPrice: firstVariant ? firstVariant.compare_at_price : null,
        variantId: firstVariant ? firstVariant.id : null,
      };
    });

    return NextResponse.json({ products: mapped });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Unknown error" },
      { status: 500 }
    );
  }
}
