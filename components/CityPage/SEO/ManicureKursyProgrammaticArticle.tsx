import Image from "next/image";
import Link from "next/link";
import type { ICity } from "@/types";
import type { PolishCityForms } from "@/utils/polishCityGrammar";

type Props = {
  forms: PolishCityForms;
  nearbyCities: ICity[];
  basePath: "kursy-stylizacji-paznokci";
};

export default function ManicureKursyProgrammaticArticle({
  forms,
  nearbyCities,
  basePath,
}: Props) {
  const { nominative, locative } = forms;
  const internalLinks = nearbyCities.slice(0, 8);

  return (
    <article className="relative py-14 sm:py-16 lg:py-20 px-5 sm:px-8 lg:px-12 bg-gradient-to-b from-white via-violet-50/20 to-white">
      <div className="relative mx-auto max-w-4xl">
        <header className="mb-10 text-center sm:mb-12">
          <h2 className="font-baloo text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl lg:text-4xl">
            Kurs stylizacji paznokci {nominative} – ceny, szkolenia i terminy 2026
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-neutral-600 font-poppins sm:text-lg">
            Szukasz profesjonalnego kursu stylizacji paznokci w {locative}? Sprawdź aktualne szkolenia manicure i zdobień paznokci prowadzone przez
            doświadczone instruktorki. Dowiedz się, ile kosztuje kurs, co obejmuje program oraz jak szybko możesz zacząć zarabiać jako stylistka
            paznokci.
          </p>
        </header>

        <div className="relative mb-12 h-[220px] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 sm:h-[280px]">
          <Image
            src="/resource/20.jpg"
            alt={`kurs manicure ${nominative} szkolenie paznokci`}
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
        </div>

        <div className="prose prose-neutral max-w-none prose-headings:font-baloo prose-headings:font-bold prose-p:font-poppins prose-li:font-poppins prose-headings:text-neutral-900 prose-p:text-neutral-600">
          <h2>💅 Kurs stylizacji paznokci w {locative} – co obejmuje?</h2>
          <p>Na kursach nauczysz się:</p>
          <ul>
            <li>przygotowania płytki paznokcia</li>
            <li>wykonywania manicure klasycznego i hybrydowego</li>
            <li>przedłużania paznokci (żel, akryl)</li>
            <li>zdobień i aktualnych trendów</li>
            <li>pracy z klientką i budowania portfolio</li>
          </ul>
          <p>
            Szkolenia są dostępne zarówno dla początkujących, jak i osób chcących podnieść kwalifikacje. Szukając{" "}
            <strong>kursu stylizacji paznokci w {locative}</strong> oraz hasła <strong>szkolenie manicure {nominative}</strong>, warto porównać programy
            u kilku instruktorek.
          </p>

          <h2>📍 Najpopularniejsze kursy manicure {nominative}</h2>
          <ul>
            <li>
              <strong>Kurs manicure klasyczny {nominative}</strong> – podstawy i pierwsze stylizacje
            </li>
            <li>
              <strong>Kurs manicure hybrydowy {nominative}</strong> – aplikacja i trwałość
            </li>
            <li>
              <strong>Kurs przedłużania paznokci {nominative}</strong> – żel i formy
            </li>
            <li>
              <strong>Kurs zdobień paznokci {nominative}</strong> – trendy i nail art
            </li>
          </ul>
          <p>
            Dobierz <strong>kurs manicure hybrydowego w {locative}</strong> pod swój poziom – od pierwszych kroków po zaawansowane stylizacje. W treści
            często pojawia się też wyszukiwanie <strong>kurs manicure hybrydowy {nominative}</strong>.
          </p>

          <h2>💰 Ile kosztuje kurs stylizacji paznokci w {locative}?</h2>
          <p>Ceny kursów w 2026 roku:</p>
          <ul>
            <li>kurs podstawowy: 800 – 1500 zł</li>
            <li>kurs rozszerzony: 1500 – 2500 zł</li>
            <li>szkolenia specjalistyczne: 500 – 1200 zł</li>
          </ul>
          <p>
            Cena zależy od zakresu, liczby dni i renomy instruktorki. Frazy typu <strong>kurs paznokci {nominative} cena</strong> warto zestawić z
            realnym zakresem materiału i liczbą godzin praktyki.
          </p>

          <h2>💸 Ile można zarobić po kursie manicure?</h2>
          <p>Po ukończeniu kursu możesz zarabiać:</p>
          <ul>
            <li>początkująca: 2000 – 4000 zł / miesiąc</li>
            <li>średnio zaawansowana: 4000 – 6000 zł / miesiąc</li>
            <li>ekspertka: 6000 – 12000 zł / miesiąc</li>
          </ul>
          <p>Zwrot z inwestycji w kurs często następuje już po 1–2 miesiącach pracy.</p>

          <h2>📈 Czy warto zrobić kurs stylizacji paznokci w 2026?</h2>
          <p>
            Tak — branża beauty w Polsce dynamicznie rośnie. Coraz więcej klientek regularnie korzysta z manicure hybrydowego i żelowego, także w{" "}
            {locative}.
          </p>
          <p>
            <strong>Dlaczego warto:</strong>
          </p>
          <ul>
            <li>niskie koszty wejścia</li>
            <li>szybki zwrot inwestycji</li>
            <li>możliwość pracy mobilnej lub w salonie</li>
            <li>możliwość otwarcia własnego biznesu</li>
          </ul>
          <p>
            Jeśli rozważasz <strong>kurs paznokci dla początkujących w {locative}</strong>, zacznij od programu podstawowego i stopniowo dokładaj
            specjalizacje.
          </p>

          {internalLinks.length > 0 ? (
            <>
              <h2>🔗 Kurs stylizacji paznokci w okolicy</h2>
              <p>Sprawdź też szkolenia w sąsiednich miastach (linkowanie wewnętrzne):</p>
              <ul>
                {internalLinks.map((c) => (
                  <li key={c.id}>
                    <Link href={`/${basePath}/${c.id}`} className="text-blue-700 underline-offset-2 hover:underline">
                      Kurs stylizacji paznokci {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
