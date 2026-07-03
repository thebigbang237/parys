// lib/actions/geo.actions.ts
"use server";

import {
  detectCountryFromHeaders,
  resolveCurrency,
  canUseMobileMoney,
} from "@/lib/geo";
import { headers } from "next/headers";

export async function getUserGeoContext() {
  const headersList = await headers();
  const country = detectCountryFromHeaders(headersList as any);
  const currency = resolveCurrency(country);
  const mobileMoney = canUseMobileMoney(country);

  return { country, currency, mobileMoney };
}
