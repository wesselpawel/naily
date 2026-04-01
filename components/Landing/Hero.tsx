import OpenRegisterButton from "@/components/Cta/OpenRegisterButton";
import Image from "next/image";
import image1 from "../../public/home/1.png";
import image2 from "../../public/home/2.png";
import image3 from "../../public/home/3.png";
export default function Hero() {
  return (
    <section className="relative">
      <div className="bg-slate-50 p-4 sm:p-6 relative z-10">
        <div className="animate-fade-in py-6 sm:py-12 lg:container">
          <h2 className="font-baloo font-bold text-4xl xl:text-5xl mb-4 sm:mb-6 leading-tight text-zinc-800 px-2">
            Jak to działa
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="flex flex-col mt-6 w-full">
              <Image
                src={image1}
                width={400}
                height={400}
                alt="Krok 1 — wybierz kurs"
                className="max-w-[250px]"
              />
              <h2 className="text-2xl font-gotham font-bold mt-12 mb-4">
                Wybierz miasto i typ szkolenia
              </h2>
              <p className="font-poppins">
                Sprawdź podstronę kursu stylizacji paznokci lub pedicure w swojej
                okolicy — program, często zadawane pytania i jak się zapisać.
              </p>
            </div>
            <div className="flex flex-col mt-6 w-full">
              <Image
                src={image2}
                width={400}
                height={400}
                alt="Krok 2 — kontakt z organizatorem"
                className="max-w-[250px]"
              />
              <h2 className="text-2xl font-gotham font-bold mt-12 mb-4">
                Skontaktuj się z organizatorem
              </h2>
              <p className="font-poppins">
                Na stronie kursu znajdziesz dane kontaktowe i warunki zapisu —
                ustal szczegóły bezpośrednio z akademią lub instruktorką.
              </p>
            </div>
            <div className="flex flex-col mt-6 w-full">
              <Image
                src={image3}
                width={400}
                height={400}
                alt="Krok 3 — rozwój zawodowy"
                className="max-w-[250px]"
              />
              <h2 className="text-2xl font-gotham font-bold mt-12 mb-4">
                Rozwijaj warsztat i karierę
              </h2>
              <p className="font-poppins">
                Po szkoleniu możesz budować praktykę, szukać pracy w branży
                beauty albo samodzielnie prowadzić kursy dla innych.
              </p>
            </div>
          </div>
          <div className="mx-auto mt-16 px-2 w-full max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <a
                href="#reserve"
                className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-700 rounded-full font-semibold text-sm sm:text-base md:text-lg transition-all duration-200 hover:bg-neutral-100 overflow-hidden shadow-md text-center border border-blue-200"
              >
                Zobacz szkolenia
              </a>
              <OpenRegisterButton className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-full font-semibold text-sm sm:text-base md:text-lg transition-all duration-200 hover:bg-blue-700 overflow-hidden shadow-md w-full text-center">
                Załóż konto profesjonalne
              </OpenRegisterButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
