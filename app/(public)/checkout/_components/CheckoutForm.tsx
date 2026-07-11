// app/(public)/checkout/_components/CheckoutForm.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { ChevronDown, Globe } from "lucide-react";

type Currency = "XAF" | "USD" | "EUR";
type PaymentMethod = "mobile_money" | "paypal";

// Countries PawaPay covers with their currency
const PAWAPAY_COUNTRY_CONFIG: Record<
  string,
  { currency: string; name: string; flag: string }
> = {
  CM: { currency: "XAF", name: "Cameroun", flag: "🇨🇲" },
  CI: { currency: "XOF", name: "Côte d'Ivoire", flag: "🇨🇮" },
  SN: { currency: "XOF", name: "Sénégal", flag: "🇸🇳" },
  GH: { currency: "GHS", name: "Ghana", flag: "🇬🇭" },
  UG: { currency: "UGX", name: "Uganda", flag: "🇺🇬" },
  TZ: { currency: "TZS", name: "Tanzania", flag: "🇹🇿" },
  ZM: { currency: "ZMW", name: "Zambia", flag: "🇿🇲" },
  ZW: { currency: "ZWL", name: "Zimbabwe", flag: "🇿🇼" },
  RW: { currency: "RWF", name: "Rwanda", flag: "🇷🇼" },
  MZ: { currency: "MZN", name: "Mozambique", flag: "🇲🇿" },
  GN: { currency: "GNF", name: "Guinée", flag: "🇬🇳" },
  BJ: { currency: "XOF", name: "Bénin", flag: "🇧🇯" },
  BF: { currency: "XOF", name: "Burkina Faso", flag: "🇧🇫" },
  ML: { currency: "XOF", name: "Mali", flag: "🇲🇱" },
  TG: { currency: "XOF", name: "Togo", flag: "🇹🇬" },
  CD: { currency: "CDF", name: "Congo DRC", flag: "🇨🇩" },
};

interface CheckoutFormProps {
  courseId: string;
  price: number;
  currency: string;
  country: string;
  userEmail: string;
  priceXaf: number;
  priceUsd: number;
  priceEur: number;
}

export default function CheckoutForm({
  courseId,
  price: initialPrice,
  currency: initialCurrency,
  country: initialCountry,
  userEmail,
  priceXaf,
  priceUsd,
  priceEur,
}: CheckoutFormProps) {
  const [country, setCountry] = useState(initialCountry);
  const [currency, setCurrency] = useState(initialCurrency);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const canUseMobileMoney = country in PAWAPAY_COUNTRY_CONFIG;
  const [method, setMethod] = useState<PaymentMethod>(
    canUseMobileMoney ? "mobile_money" : "paypal",
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileMoneyPending, setMobileMoneyPending] = useState(false);

  // Resolve price based on current currency
  const price =
    currency === "XAF" || currency === "XOF"
      ? priceXaf
      : currency === "EUR"
        ? priceEur
        : priceUsd;

  function handleCountryChange(newCountry: string) {
    setCountry(newCountry);
    setShowCountryPicker(false);
    const config = PAWAPAY_COUNTRY_CONFIG[newCountry];
    if (config) {
      setCurrency(config.currency);
      setMethod("mobile_money");
    } else {
      setCurrency("USD");
      setMethod("paypal");
    }
  }

  function handleCurrencyChange(newCurrency: Currency) {
    setCurrency(newCurrency);
    if (newCurrency !== "XAF") {
      setMethod("paypal");
      setCountry("US"); // non-African
    }
  }

  async function handleMobileMoneyPayment() {
    if (!phoneNumber.trim()) {
      setError("Veuillez entrer votre numéro de téléphone");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/payments/pawapay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productType: "COURSE",
        productId: courseId,
        amount: price,
        currency,
        country,
        phoneNumber,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Paiement échoué");
      setLoading(false);
      return;
    }

    setMobileMoneyPending(true);
    setLoading(false);
    pollPaymentStatus(data.depositId);
  }

  async function pollPaymentStatus(depositId: string) {
    const poll = async () => {
      const res = await fetch(
        `/api/payments/status?depositId=${depositId}&provider=pawapay`,
      );
      const data = await res.json();

      if (data.status === "COMPLETED") {
        window.location.href = `/checkout/success?productType=COURSE&productId=${courseId}`;
        return;
      }
      if (data.status === "FAILED" || data.status === "CANCELLED") {
        setError("Paiement échoué ou annulé.");
        setMobileMoneyPending(false);
        return;
      }
      setTimeout(poll, 5000);
    };
    setTimeout(poll, 5000);
  }

  async function handlePayPalPayment() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/payments/paypal/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productType: "COURSE",
        productId: courseId,
        amount: price,
        currency: currency === "XAF" || currency === "XOF" ? "USD" : currency,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erreur PayPal");
      setLoading(false);
      return;
    }
    window.location.href = data.approvalUrl;
  }

  // Pending mobile money confirmation screen
  if (mobileMoneyPending) {
    return (
      <div className="bg-white border border-[#f3dfea] p-8 text-center space-y-6">
        <div className="w-16 h-16 border-4 border-[#a61968] border-t-transparent rounded-full animate-spin mx-auto" />
        <div>
          <h3 className="font-serif text-xl font-medium text-gray-900 mb-2">
            Confirmez sur votre téléphone
          </h3>
          <p className="text-sm text-gray-500">
            Une demande de paiement a été envoyée à{" "}
            <strong>{phoneNumber}</strong>.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Acceptez la demande sur votre téléphone pour finaliser.
          </p>
        </div>
        <p className="text-xs text-gray-500 tracking-[2px] uppercase animate-pulse">
          En attente de confirmation...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#f3dfea] p-8 space-y-6">
      {/* Currency / Country switcher */}
      <div>
        <h2 className="text-xs tracking-[3px] uppercase text-gray-500 mb-4">
          Votre localisation
        </h2>
        <div className="flex gap-3 flex-wrap">
          {/* Currency pills */}
          {(["XAF", "USD", "EUR"] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => handleCurrencyChange(c)}
              className={cn(
                "px-4 py-2 text-xs tracking-[2px] uppercase border transition-colors",
                currency === c ||
                  (c === "XAF" &&
                    [
                      "XAF",
                      "XOF",
                      "GHS",
                      "UGX",
                      "TZS",
                      "ZMW",
                      "ZWL",
                      "RWF",
                      "MZN",
                      "GNF",
                      "CDF",
                    ].includes(currency))
                  ? "border-[#a61968] bg-[#f9eff4] text-[#a61968]"
                  : "border-gray-200 text-gray-500 hover:border-[#a61968]",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Country picker for mobile money */}
        {(currency === "XAF" ||
          Object.values(PAWAPAY_COUNTRY_CONFIG).some(
            (c) => c.currency === currency,
          )) && (
          <div className="mt-3 relative">
            <button
              onClick={() => setShowCountryPicker(!showCountryPicker)}
              className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-4 py-2 hover:border-[#a61968] transition-colors w-full"
            >
              <span>
                {PAWAPAY_COUNTRY_CONFIG[country]?.flag || (
                  <Globe size={16} className="inline" />
                )}
              </span>
              <span>
                {PAWAPAY_COUNTRY_CONFIG[country]?.name || "Choisir un pays"}
              </span>
              <ChevronDown size={16} className="ml-auto text-gray-500" />
            </button>

            {showCountryPicker && (
              <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 max-h-48 overflow-y-auto shadow-lg">
                {Object.entries(PAWAPAY_COUNTRY_CONFIG).map(
                  ([code, config]) => (
                    <button
                      key={code}
                      onClick={() => handleCountryChange(code)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#f9eff4] transition-colors text-left"
                    >
                      <span>{config.flag}</span>
                      <span>{config.name}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        {config.currency}
                      </span>
                    </button>
                  ),
                )}
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => {
                      setCountry("US");
                      setCurrency("USD");
                      setMethod("paypal");
                      setShowCountryPicker(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#f9eff4] transition-colors text-left"
                  >
                    <Globe size={16} />
                    <span>Autre pays</span>
                    <span className="ml-auto text-xs text-gray-500">USD</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment method */}
      <div>
        <h2 className="text-xs tracking-[3px] uppercase text-gray-500 mb-4">
          Moyen de paiement
        </h2>
        <div className="space-y-3">
          {canUseMobileMoney && (
            <button
              onClick={() => setMethod("mobile_money")}
              className={cn(
                "w-full p-4 border text-left transition-colors",
                method === "mobile_money"
                  ? "border-[#a61968] bg-[#f9eff4]"
                  : "border-gray-200 hover:border-[#a61968]",
              )}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    Mobile Money
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    MTN, Orange, Wave, M-Pesa et plus
                  </p>
                </div>
                <div className="flex gap-1">
                  {["MTN", "Orange", "Wave"].map((op) => (
                    <span
                      key={op}
                      className="text-xs bg-gray-100 px-1.5 py-0.5 text-gray-500"
                    >
                      {op}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          )}

          <button
            onClick={() => setMethod("paypal")}
            className={cn(
              "w-full p-4 border text-left transition-colors",
              method === "paypal"
                ? "border-[#a61968] bg-[#f9eff4]"
                : "border-gray-200 hover:border-[#a61968]",
            )}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm text-gray-900">
                  PayPal / Carte bancaire
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Visa, Mastercard, PayPal — mondial
                </p>
              </div>
              <span className="text-xs font-bold text-[#003087]">PayPal</span>
            </div>
          </button>
        </div>
      </div>

      {/* Phone number for mobile money */}
      {method === "mobile_money" && (
        <div className="space-y-2">
          <label className="text-xs tracking-[2px] uppercase text-gray-500">
            Numéro Mobile Money
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder={
              country === "CM"
                ? "+237 6XX XXX XXX"
                : country === "CI"
                  ? "+225 0X XX XX XX XX"
                  : country === "SN"
                    ? "+221 7X XXX XX XX"
                    : "+XXX XXXXXXXXX"
            }
            className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#a61968] transition-colors"
          />
          <p className="text-xs text-gray-500">
            Incluez l'indicatif pays (ex: +237 pour Cameroun)
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={
          method === "mobile_money"
            ? handleMobileMoneyPayment
            : handlePayPalPayment
        }
        disabled={loading}
        className="w-full bg-[#a61968] text-white py-4 text-xs tracking-[3px] uppercase font-medium hover:bg-[#172A39] transition-colors disabled:opacity-60"
      >
        {loading
          ? "Traitement..."
          : method === "mobile_money"
            ? `Payer ${formatPrice(price, currency as any)} par Mobile Money`
            : `Payer avec PayPal`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Paiement 100% sécurisé · Accès immédiat après confirmation
      </p>
    </div>
  );
}
