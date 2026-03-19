import { ICity } from "@/types";

type TrainingKeywordRichContentProps = {
  city: ICity;
  serviceType: "manicure" | "pedicure";
  userCount?: number;
};

function buildKeywords(cityName: string, serviceType: "manicure" | "pedicure") {
  if (serviceType === "manicure") {
    return [
      `kurs stylizacji paznokci ${cityName}`,
      `kurs stylizacji paznokci ${cityName} 2026`,
      `kurs manicure ${cityName}`,
      `szkolenie manicure ${cityName}`,
      `szkolenia manicure ${cityName}`,
      `szkolenie hybryda ${cityName}`,
      `szkolenia hybryda ${cityName}`,
      `manicure ${cityName}`,
      `manicure hybrydowy ${cityName}`,
      `cennik kurs manicure ${cityName}`,
      `ile kosztuje kurs stylizacji paznokci ${cityName}`,
      `salon manicure ${cityName}`,
      `opinie absolwentek kursów manicure`,
    ];
  }

  return [
    `kurs pedicure ${cityName}`,
    `kurs pedicure ${cityName} 2026`,
    `szkolenie pedicure ${cityName}`,
    `szkolenia pedicure ${cityName}`,
    `szkolenie hybryda ${cityName}`,
    `pedicure ${cityName}`,
    `pedicure hybrydowy ${cityName}`,
    `cennik pedicure ${cityName}`,
    `ile kosztuje kurs stylizacji paznokci ${cityName}`,
    `szkolenie pedicure kosmetyczny ${cityName}`,
    `salon pedicure ${cityName}`,
    `opinie absolwentek kursów pedicure`,
  ];
}

export default function TrainingKeywordRichContent({
  city,
  serviceType,
  userCount = 0,
}: TrainingKeywordRichContentProps) {
  const cityName = city.name;
  const serviceNameCapitalized =
    serviceType === "manicure" ? "Manicure" : "Pedicure";
  const serviceName = serviceType;

  const hiddenKeywords = buildKeywords(cityName, serviceType);

  return (
    <div className="mt-10 bg-white rounded-2xl p-6 md:p-8 lg:p-10 border border-neutral-200/70">
      <h2 className="text-2xl sm:text-3xl font-baloo font-bold text-neutral-900 mb-3">
        Kurs stylizacji paznokci {cityName} - program i szkolenia {serviceName}
      </h2>
      <p className="text-neutral-600 font-poppins leading-relaxed">
        Szukasz <strong>kursu stylizacji paznokci</strong> w {cityName}? Na
        naszej stronie znajdziesz <strong>kursy i szkolenia {serviceName}</strong>{" "}
        (w tym <strong>{serviceName} hybrydowy</strong>) prowadzone przez
        sprawdzone instruktorki. Sprawdź <strong>ile kosztuje kurs stylizacji
        paznokci</strong> w {cityName} i wybierz najlepszy termin na 2026 rok.
      </p>

      <div className="mt-5">
        <h3 className="text-xl sm:text-2xl font-baloo font-bold text-neutral-900 mb-3">
          Najczęściej wybierane szkolenia {serviceName} w {cityName}
        </h3>
        <ul className="space-y-2 text-neutral-700 font-poppins">
          {serviceType === "manicure" ? (
            <>
              <li>
                <strong>Kurs manicure klasyczny</strong> w {cityName} - podstawy
                pracy, przygotowanie płytki i pierwsze stylizacje.
              </li>
              <li>
                <strong>Szkolenie manicure hybrydowy</strong> w {cityName} -{" "}
                trwałość, aplikacja i praca krok po kroku.
              </li>
              <li>
                <strong>Kurs stylizacji i zdobień</strong> w {cityName} -
                trendy, wzory i dobór produktów.
              </li>
            </>
          ) : (
            <>
              <li>
                <strong>Kurs pedicure klasyczny</strong> w {cityName} - zabiegi
                pielęgnacyjne i standard pracy.
              </li>
              <li>
                <strong>Szkolenie pedicure hybrydowy</strong> w {cityName} -{" "}
                przygotowanie stóp i stylizacje na dłużej.
              </li>
              <li>
                <strong>Kurs zabiegów pielęgnacyjnych stóp</strong> w {cityName}{" "}
                - peeling, masaż i pielęgnacja po zabiegu.
              </li>
            </>
          )}
        </ul>

        {userCount > 0 ? (
          <p className="mt-4 text-neutral-600 text-sm sm:text-base">
            Obecnie w {cityName} znajdziesz szkolenia prowadzone przez{" "}
            <strong>{userCount}</strong> instruktorkę/instruktorki.
          </p>
        ) : null}
      </div>

      {/* Hidden keywords for SEO (template-based, no hardcoding of cities) */}
      <div className="hidden" aria-hidden="true">
        {hiddenKeywords.map((keyword, index) => (
          <span key={index}>
            {keyword}
            {index < hiddenKeywords.length - 1 ? ", " : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

