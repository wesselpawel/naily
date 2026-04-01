const AUTHOR_NAME = "Paweł Wessel";
const AUTHOR_BASE_URL = "https://wesselpawel.com";
const DEFAULT_CITY_LABEL = "Grudziądz";
const DEFAULT_CITY_SLUG = "grudziadz";

function formatCityLabel(citySlug: string) {
  return citySlug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getAuthorCredit(citySlug?: string, cityLabel?: string) {
  const normalizedSlug = citySlug?.trim() || DEFAULT_CITY_SLUG;
  const normalizedLabel =
    cityLabel?.trim() ||
    (normalizedSlug === DEFAULT_CITY_SLUG
      ? DEFAULT_CITY_LABEL
      : formatCityLabel(normalizedSlug));

  return {
    creator: AUTHOR_NAME,
    label: `${AUTHOR_NAME} - Tworzenie Stron Internetowych ${normalizedLabel}`,
    url: `${AUTHOR_BASE_URL}/tworzenie-stron-internetowych-${normalizedSlug}`,
  };
}

export function getAuthorMetadata(citySlug?: string, cityLabel?: string) {
  const authorCredit = getAuthorCredit(citySlug, cityLabel);

  return {
    authors: [
      {
        name: authorCredit.label,
        url: authorCredit.url,
      },
    ],
    creator: authorCredit.creator,
  };
}
