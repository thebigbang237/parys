// lib/geo.ts

export const PAWAPAY_COUNTRIES = [
  "CM",
  "CI",
  "SN",
  "GH",
  "UG",
  "TZ",
  "ZM",
  "ZW",
  "RW",
  "MZ",
  "BJ",
  "BF",
  "CD",
  "CG",
  "GA",
  "GN",
  "ML",
  "MR",
  "NE",
  "TG",
];

export const XAF_COUNTRIES = [
  "CM",
  "CI",
  "SN",
  "GA",
  "CG",
  "TD",
  "CF",
  "GQ",
  "BJ",
  "BF",
  "ML",
  "NE",
  "TG",
  "GW",
  "MR",
  "GH",
  "UG",
  "TZ",
  "ZM",
  "ZW",
  "RW",
  "MZ",
  "CD",
  "GN",
];

export const EUR_COUNTRIES = [
  "FR",
  "BE",
  "DE",
  "IT",
  "ES",
  "PT",
  "NL",
  "AT",
  "FI",
  "GR",
  "IE",
  "LU",
  "SK",
  "SI",
  "EE",
  "LV",
  "LT",
  "MT",
  "CY",
];

export type Currency = "XAF" | "USD" | "EUR";

export function resolveCurrency(country: string): Currency {
  if (XAF_COUNTRIES.includes(country)) return "XAF";
  if (EUR_COUNTRIES.includes(country)) return "EUR";
  return "USD";
}

export function canUseMobileMoney(country: string): boolean {
  return PAWAPAY_COUNTRIES.includes(country);
}

export function detectCountryFromHeaders(headers: Headers): string {
  // Cloudflare header — most reliable
  const cfCountry = headers.get("CF-IPCountry");
  if (cfCountry && cfCountry !== "XX") return cfCountry;

  // Vercel header — fallback
  const vercelCountry = headers.get("x-vercel-ip-country");
  if (vercelCountry) return vercelCountry;

  // Default to CM (her primary market)
  return "CM";
}
