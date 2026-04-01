import OpenRegisterButton from "@/components/Cta/OpenRegisterButton";
import Image from "next/image";
import heroImage2 from "@/public/heroimg2.png";

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-purple-50">
      <div className="relative z-10 py-12 lg:py-20 container">
        <div className="flex justify-center items-center flex-col lg:flex-row gap-6 lg:gap-12">
          <Image
            src={heroImage2}
            alt="Naily App on Mobile"
            width={400}
            height={400}
            className="w-[90vw] lg:max-w-[400px] h-auto mb-6 lg:mb-0 lg:ml-12 self-center"
          />
          <div className="max-w-3xl">
            <h2 className="text-zinc-800 text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight font-baloo">
              Ucz, rozwijaj się, buduj markę.
            </h2>

            <p className="text-lg text-zinc-800 mb-6 sm:mb-8 max-w-2xl leading-relaxed font-medium">
              Dołącz do społeczności instruktorek i stylistek — promuj szkolenia,
              kursy i swoją praktykę w jednym miejscu.
            </p>

            <OpenRegisterButton className="w-full lg:w-max group relative px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-full font-semibold text-xl lg:text-lg transition-all duration-200 hover:bg-blue-700 overflow-hidden">
              Dołącz do Naily
            </OpenRegisterButton>

            <p className="text-xs sm:text-sm mt-3 sm:mt-4 text-zinc-800">
              Bez opłat na start • Profil w 2 minuty
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
