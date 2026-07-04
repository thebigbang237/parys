// app/api/payments/pawapay/config/route.ts
import { NextResponse } from "next/server";

const ALPHA2_TO_ALPHA3: Record<string, string> = {
  CM: "CMR",
  CI: "CIV",
  SN: "SEN",
  GH: "GHA",
  NG: "NGA",
  KE: "KEN",
  UG: "UGA",
  TZ: "TZA",
  ZM: "ZMB",
  RW: "RWA",
  BJ: "BEN",
  BF: "BFA",
  CD: "COD",
  GA: "GAB",
  MZ: "MOZ",
  CG: "COG",
  GN: "GIN",
  TG: "TGO",
  ML: "MLI",
  NE: "NER",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country");

  if (!country) {
    return NextResponse.json({ error: "country required" }, { status: 400 });
  }

  const alpha3 =
    country.length === 2
      ? (ALPHA2_TO_ALPHA3[country.toUpperCase()] ?? country.toUpperCase())
      : country.toUpperCase();

  try {
    const response = await fetch(
      `https://api.sandbox.pawapay.io/v2/active-conf?country=${alpha3}&operationType=DEPOSIT`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAWAPAY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    const countryData = data.countries?.[0];
    if (!countryData) {
      return NextResponse.json({ providers: [], prefix: "" });
    }

    // Extract only what the frontend needs
    const providers = (countryData.providers ?? [])
      .map((p: any) => ({
        provider: p.provider, // exact code e.g. "MTN_MOMO_CMR"
        displayName: p.displayName, // "MTN"
        logo: p.logo, // CDN URL for operator logo
        status:
          p.currencies?.[0]?.operationTypes?.DEPOSIT?.status ?? "OPERATIONAL",
        authType:
          p.currencies?.[0]?.operationTypes?.DEPOSIT?.authType ??
          "PROVIDER_AUTH",
      }))
      .filter((p: any) => p.status === "OPERATIONAL"); // only show available operators

    return NextResponse.json({
      providers,
      prefix: countryData.prefix ?? "", // e.g. "237"
      country: countryData.country,
    });
  } catch (err) {
    console.error("PawaPay config error:", err);
    // Graceful fallback — frontend uses hardcoded fallback
    return NextResponse.json({ providers: [], prefix: "" });
  }
}
