"use client";
import Link from "next/link";
import { FaEnvelope, FaPhone, FaFacebook, FaInstagram } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Image from "next/image";
import logoBig from "@/public/naily-logo-big.png";
import logo from "@/public/naily-logo2.png";
import { isFeatureEnabled } from "@/lib/featureFlags";

export default function Footer() {
  const { user } = useSelector((state: RootState) => state.user);

  return (
    <footer className="relative bg-neutral-950 text-white pb-5 lg:pb-0">
      {/* Subtle gradient texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700/10 via-blue-700/5 to-neutral-950 pointer-events-none" />
      {/* Accent top border */}
      <div className="border-t-4 border-blue-600/90" />

      <div className="container relative py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-4">
            <Image
              src={logo}
              alt="Naily Logo Small"
              width={2000}
              height={2000}
              className="w-24"
            />
            <p className="text-neutral-300 text-sm leading-relaxed">
              Kursy stylizacji paznokci i szkolenia pedicure w całej Polsce —
              znajdź termin i lokalizację dla siebie.
            </p>
            <div className="flex space-x-4">
              <Link
                target="_blank"
                href="https://www.facebook.com/profile.php?id=61571850669360"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <FaFacebook className="text-sm" />
              </Link>
              <Link
                target="_blank"
                href="https://www.instagram.com/naily.pl/"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <FaInstagram className="text-sm" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold font-baloo text-white">Menu</h3>

            <ul className="space-y-2">
              <li>
                <Link
                  href="/szkolenia"
                  className="text-neutral-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  Szkolenia
                </Link>
              </li>
              <li>
                <Link
                  href="/oferty-pracy-manicure"
                  className="text-neutral-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  Oferty pracy w branży beauty
                </Link>
              </li>
              {isFeatureEnabled("blog") && (
              <li>
                <Link
                  href="/blog"
                  className="text-neutral-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  Blog
                </Link>
              </li>
              )}
              <li>
                <Link
                  href="/regulamin"
                  className="text-neutral-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  Regulamin
                </Link>
              </li>
              <li>
                <Link
                  href="/polityka-prywatnosci"
                  className="text-neutral-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  Polityka prywatności
                </Link>
              </li>

              {user?.uid && (
                <li>
                  <Link
                    href="/dashboard"
                    className="text-neutral-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                  >
                    Panel użytkownika
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Services */}

          <div className="space-y-4">
            <h3 className="text-2xl font-bold font-baloo text-white">
              Lokalizacje
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/kursy-stylizacji-paznokci/warszawa"
                  className="text-neutral-300 hover:text-white transition-colors text-sm"
                >
                  Warszawa
                </Link>
              </li>
              <li>
                <Link
                  href="/kursy-stylizacji-paznokci/krakow"
                  className="text-neutral-300 hover:text-white transition-colors text-sm"
                >
                  Kraków
                </Link>
              </li>
              <li>
                <Link
                  href="/kursy-stylizacji-paznokci/wroclaw"
                  className="text-neutral-300 hover:text-white transition-colors text-sm"
                >
                  Wrocław
                </Link>
              </li>
              <li>
                <Link
                  href="/kursy-stylizacji-paznokci/poznan"
                  className="text-neutral-300 hover:text-white transition-colors text-sm"
                >
                  Poznań
                </Link>
              </li>
              <li>
                <Link
                  href="/kursy-stylizacji-paznokci/gdansk"
                  className="text-neutral-300 hover:text-white transition-colors text-sm"
                >
                  Gdańsk
                </Link>
              </li>
              <li>
                <span className="text-neutral-400 text-xs">
                  Kursy w całej Polsce
                </span>
              </li>
            </ul>
          </div>

          {/* Contact & App */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold font-baloo text-white">
              Kontakt
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-neutral-300 text-sm">
                <FaEnvelope className="text-xs" />
                <span>kontakt@naily.pl</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300 text-sm">
                <FaPhone className="text-xs" />
                <span>+48 721 417 154</span>
              </div>
            </div>
          </div>
        </div>
        {/* <Image
          src={logoBig}
          alt="Naily Logo Big"
          width={2000}
          height={2000}
          className="w-full mt-24"
        />{" "} */}
        <div className="mt-10 pt-6 text-neutral-500 text-sm text-center font-roboto">
          © 2025 Naily. Wszystkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  );
}
