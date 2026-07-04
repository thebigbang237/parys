// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type DisplayCurrency =
  | "XAF"
  | "USD"
  | "EUR"
  | "XOF"
  | "GHS"
  | "UGX"
  | "TZS"
  | "ZMW"
  | "RWF"
  | "GNF"
  | "CDF"
  | "MZN"
  | "ZWL";

// Currencies that should display as whole numbers
const WHOLE_NUMBER_CURRENCIES = [
  "XAF",
  "XOF",
  "GNF",
  "CDF",
  "UGX",
  "TZS",
  "RWF",
];

export function formatPrice(amount: number, currency: DisplayCurrency): string {
  const rounded = WHOLE_NUMBER_CURRENCIES.includes(currency)
    ? Math.round(amount)
    : amount;

  // Use explicit locale "en-US" on both server and client
  // to avoid hydration mismatches from locale differences
  if (WHOLE_NUMBER_CURRENCIES.includes(currency)) {
    // Format number with thousands separator then append currency
    const formatted = new Intl.NumberFormat("en-US").format(rounded);
    return `${formatted} ${currency}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rounded);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
