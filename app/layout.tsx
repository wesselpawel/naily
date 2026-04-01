import "./globals.css";
import { Metadata } from "next";
import ConditionalNav from "@/components/ConditionalNav";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import { Providers } from "@/redux/Provider";
import "react-toastify/dist/ReactToastify.css";
import FontManager from "@/components/FontManager";
import { ToastContainer } from "react-toastify";
import Script from "next/script";
import ModalManager from "@/components/ModalManager";
import InitUser from "@/components/User/Init";
import localFont from "next/font/local";
import { getAuthorMetadata } from "@/lib/siteAuthor";

const baloo = localFont({
  src: "../public/baloo.ttf",
  variable: "--font-baloo",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={baloo.variable}
    >
      <head>
        {/* Google Fonts - Loaded at runtime to avoid build failures */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Marcellus:wght@400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@200..900&display=swap" rel="stylesheet" />
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Naily" />
        <link rel="apple-touch-icon" href="/naily-logo.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Favicon links for better browser and search engine support */}
        <link rel="icon" href="/fav.png" type="image/png" />
        <link rel="shortcut icon" href="/fav.png" />
        {/* JSON-LD Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://naily.pl#organization",
              name: "Naily",
              url: "https://naily.pl",
              logo: "https://naily.pl/naily-logo-big.png",
              description: "Platforma łącząca klientki ze sprawdzonymi stylistkami manicure i pedicure w całej Polsce. Rezerwacje online, cenniki, portfolio i szkolenia.",
              sameAs: [
                "https://www.facebook.com/naily.pl",
                "https://www.instagram.com/naily.pl",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Customer Service",
                availableLanguage: "Polish",
              },
            }),
          }}
        />
        {/* JSON-LD Structured Data for Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://naily.pl#website",
              url: "https://naily.pl",
              name: "Naily",
              description: "Platforma dla stylistek manicure i pedicure - rezerwacje online, cenniki, portfolio",
              publisher: {
                "@id": "https://naily.pl#organization",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://naily.pl/?search={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={`max-w-screen overflow-x-hidden font-body bg-white`}>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-6XV8R4XZKS"
          id="google-analytics"
        >
          {` window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-6XV8R4XZKS');`}
        </Script>
        <Script async id="google-analytics1">
          {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-10818390066');
          `}
        </Script>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="professional-card"
        />
        <Providers>
          <FontManager />
          <InitUser />
          <ConditionalNav />
          {/* <Breadcrumb /> */}
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ModalManager />
        </Providers>
        {/* Register Service Worker for PWA */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then((reg) => {
                    console.log('Service Worker registered:', reg);
                    // Check for updates periodically
                    setInterval(() => {
                      reg.update();
                    }, 60000); // Check every minute
                  })
                  .catch((err) => {
                    console.log('Service Worker registration failed:', err);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://naily.pl"),
  title: {
    default: "Naily: Strona dla stylistek Manicure i Pedicure | Rezerwacje Online",
    template: "%s | Naily",
  },
  description:
    "Naily to platforma łącząca klientki ze sprawdzonymi stylistkami manicure i pedicure w całej Polsce. Znajdź najlepsze salony paznokci, sprawdź cenniki, zobacz portfolio i zarezerwuj wizytę online. Szkolenia dla stylistek, oferty pracy w branży beauty.",
  keywords: [
    "manicure",
    "pedicure",
    "stylistki paznokci",
    "salony paznokci",
    "rezerwacje online",
    "cennik manicure",
    "cennik pedicure",
    "szkolenia manicure",
    "szkolenia pedicure",
    "oferty pracy stylistka",
    "naily",
    "naily.pl",
    "manicure hybrydowy",
    "pedicure hybrydowy",
    "przedłużanie paznokci",
    "zdobienia paznokci",
    "stylistka paznokci online",
  ],
  ...getAuthorMetadata(),
  publisher: "naily.pl",
  alternates: {
    canonical: "/",
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
  icons: {
    icon: [
      { url: "/fav.png", type: "image/png" },
      { url: "/naily-logo.png", sizes: "192x192", type: "image/png" },
      { url: "/naily-logo-big.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/naily-logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/fav.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "Naily",  
    locale: "pl_PL",
    title: "Naily: Strona dla stylistek Manicure i Pedicure | Rezerwacje Online",
    description:
      "Naily to platforma łącząca klientki ze sprawdzonymi stylistkami manicure i pedicure w całej Polsce. Znajdź najlepsze salony paznokci, sprawdź cenniki, zobacz portfolio i zarezerwuj wizytę online.",
    url: "https://naily.pl",
    images: [
      {
        url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=630&fit=crop&crop=center&auto=format",
        width: 1200,
        height: 630,
        alt: "Naily - Platforma dla stylistek manicure i pedicure",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Naily",
    title: "Naily: Strona dla stylistek Manicure i Pedicure | Rezerwacje Online",
    description:
      "Naily to platforma łącząca klientki ze sprawdzonymi stylistkami manicure i pedicure w całej Polsce. Znajdź najlepsze salony paznokci i zarezerwuj wizytę online.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=630&fit=crop&crop=center&auto=format",
        alt: "Naily - Platforma dla stylistek manicure i pedicure",
      },
    ],
  },
  other: {
    "theme-color": "#2563eb",
  },
};
