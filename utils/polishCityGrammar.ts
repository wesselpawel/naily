import type { ICity } from "@/types";
import { CITY_GRAMMAR_OVERRIDES } from "@/utils/cityGrammarOverrides";

/** Polish grammatical forms for a city name (for SEO copy). */
export type PolishCityForms = {
  nominative: string;
  /** Miejscownik: „w Warszawie”, „w Grudziądzu” */
  locative: string;
  /** Dopełniacz: „kursu … Grudziądza” */
  genitive: string;
};

function inferLocative(nominative: string): string {
  const n = nominative.trim();
  if (!n) return n;

  if (/ice$/i.test(n)) return n.replace(/ice$/i, "icach");
  if (/ódź$/i.test(n)) return n.replace(/ódź$/i, "odzi");
  if (/ów$/i.test(n)) return n.slice(0, -2) + "owie";
  if (/sk$/i.test(n)) return n.slice(0, -2) + "sku";
  if (/ck$/i.test(n)) return n.slice(0, -2) + "cku";
  if (/ń$/i.test(n)) return n.slice(0, -1) + "niu";
  if (/dz$/i.test(n)) return n + "u";
  if (/owa$/i.test(n)) return n.slice(0, -1) + "ie";
  if (/[aą]$/i.test(n) && n.length > 3) return n.slice(0, -1) + "ie";
  if (/o$/i.test(n)) return n.slice(0, -1) + "u";
  if (/e$/i.test(n)) return n.slice(0, -1) + "u";

  return n + "u";
}

function inferGenitive(nominative: string): string {
  const n = nominative.trim();
  if (!n) return n;

  if (/ice$/i.test(n)) return n.replace(/ice$/i, "ic");
  if (/ódź$/i.test(n)) return n.replace(/ódź$/i, "odzi");
  if (/ów$/i.test(n)) return n.slice(0, -2) + "owa";
  if (/sk$/i.test(n)) return n.slice(0, -2) + "ska";
  if (/ck$/i.test(n)) return n.slice(0, -2) + "cka";
  if (/ń$/i.test(n)) return n.slice(0, -1) + "nia";
  if (/dz$/i.test(n)) return n + "a";
  if (/owa$/i.test(n)) return n.slice(0, -1) + "y";
  if (/[aą]$/i.test(n) && n.length > 3) return n.slice(0, -1) + "y";
  if (/o$/i.test(n)) return n.slice(0, -1) + "a";
  if (/e$/i.test(n)) return n.slice(0, -1) + "a";

  return n + "a";
}

/**
 * Returns nominative (from data), locative and genitive for Polish SEO phrases.
 * Uses overrides by city slug when heuristics are unreliable.
 */
export function getPolishCityForms(city: ICity): PolishCityForms {
  const nominative = city.name.trim();
  const slug = city.id.toLowerCase();
  const o = CITY_GRAMMAR_OVERRIDES[slug];
  if (o) {
    return {
      nominative,
      locative: o.locative,
      genitive: o.genitive,
    };
  }
  return {
    nominative,
    locative: inferLocative(nominative),
    genitive: inferGenitive(nominative),
  };
}
