/**
 * Get full API URL with NEXT_PUBLIC_URL prefix
 * Use this for all client-side fetch calls to API routes
 */
export function getApiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";
  // Remove leading slash from path if baseUrl already ends with slash or path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
