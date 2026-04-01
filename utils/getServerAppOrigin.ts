import { headers } from "next/headers";

/**
 * Origin for server-side fetch() to this app's own API routes.
 * Relying only on NEXT_PUBLIC_URL breaks when the var is missing, wrong, or
 * the server cannot reach the public hostname (common cause of flaky /dashboard).
 */
export async function getServerAppOrigin(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const isLocal =
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      host.includes(".local");
    const proto =
      h.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
    return `${proto}://${host}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
