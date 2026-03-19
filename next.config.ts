import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/szkolenia-manicure/:city",
        destination: "/kursy-stylizacji-paznokci/:city",
        permanent: true,
      },
      {
        source: "/szkolenia-pedicure/:city",
        destination: "/kursy-pedicure/:city",
        permanent: true,
      },
      {
        source: "/szkolenia-kursy-pedicure/:city",
        destination: "/kursy-pedicure/:city",
        permanent: true,
      },
      {
        source: "/szkolenia-kursy-pedicure",
        destination: "/kursy-pedicure",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
