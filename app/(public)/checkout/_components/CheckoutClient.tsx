// app/(public)/checkout/_components/CheckoutClient.tsx
"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import CouponInput from "@/components/checkout/CouponInput";
import Image from "next/image";
import { ChevronDown, Globe, Check } from "lucide-react";

type Currency =
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
type PaymentMethod = "mobile_money" | "paypal";

// Countries PawaPay covers
const PAWAPAY_COUNTRIES: Record<
  string,
  { name: string; flag: string; currency: string; placeholder: string }
> = {
  CM: {
    name: "Cameroun",
    flag: "🇨🇲",
    currency: "XAF",
    placeholder: "+237 6XX XXX XXX",
  },
  CI: {
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    currency: "XOF",
    placeholder: "+225 0X XX XX XX XX",
  },
  SN: {
    name: "Sénégal",
    flag: "🇸🇳",
    currency: "XOF",
    placeholder: "+221 7X XXX XX XX",
  },
  GH: {
    name: "Ghana",
    flag: "🇬🇭",
    currency: "GHS",
    placeholder: "+233 XX XXX XXXX",
  },
  UG: {
    name: "Uganda",
    flag: "🇺🇬",
    currency: "UGX",
    placeholder: "+256 7X XXX XXXX",
  },
  TZ: {
    name: "Tanzania",
    flag: "🇹🇿",
    currency: "TZS",
    placeholder: "+255 7X XXX XXXX",
  },
  ZM: {
    name: "Zambia",
    flag: "🇿🇲",
    currency: "ZMW",
    placeholder: "+260 9X XXX XXXX",
  },
  RW: {
    name: "Rwanda",
    flag: "🇷🇼",
    currency: "RWF",
    placeholder: "+250 7X XXX XXXX",
  },
  GN: {
    name: "Guinée",
    flag: "🇬🇳",
    currency: "GNF",
    placeholder: "+224 6X XXX XXXX",
  },
  BJ: {
    name: "Bénin",
    flag: "🇧🇯",
    currency: "XOF",
    placeholder: "+229 9X XXX XXX",
  },
  BF: {
    name: "Burkina Faso",
    flag: "🇧🇫",
    currency: "XOF",
    placeholder: "+226 7X XXX XXX",
  },
  ML: {
    name: "Mali",
    flag: "🇲🇱",
    currency: "XOF",
    placeholder: "+223 7X XXX XXX",
  },
  TG: {
    name: "Togo",
    flag: "🇹🇬",
    currency: "XOF",
    placeholder: "+228 9X XXX XXX",
  },
  CD: {
    name: "Congo DRC",
    flag: "🇨🇩",
    currency: "CDF",
    placeholder: "+243 8X XXX XXXX",
  },
  MZ: {
    name: "Mozambique",
    flag: "🇲🇿",
    currency: "MZN",
    placeholder: "+258 8X XXX XXXX",
  },
};

interface PawaPayProvider {
  provider: string; // "MTN_MOMO_CMR"
  displayName: string; // "MTN"
  logo: string; // CDN URL
  status: string;
  authType: string;
}

interface Course {
  id: string;
  title: string;
  thumbnail_url: string | null;
  price_xaf: number;
  price_usd: number;
  price_eur: number;
  is_free: boolean;
}

export default function CheckoutClient({
  course,
  initialCurrency,
  initialCountry,
  userEmail,
  productType = "COURSE",
  productId,
}: {
  course: Course;
  initialCurrency: string;
  initialCountry: string;
  userEmail: string;
  productType?: "COURSE" | "COACHING";
  productId?: string;
}) {
  const [country, setCountry] = useState(initialCountry);
  const [currency, setCurrency] = useState<Currency>(
    initialCurrency as Currency,
  );
  const [method, setMethod] = useState<PaymentMethod>(
    initialCountry in PAWAPAY_COUNTRIES ? "mobile_money" : "paypal",
  );
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Real operators from PawaPay API
  const [operators, setOperators] = useState<PawaPayProvider[]>([]);
  const [selectedOperator, setSelectedOperator] =
    useState<PawaPayProvider | null>(null);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [phonePrefix, setPhonePrefix] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileMoneyPending, setMobileMoneyPending] = useState(false);
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null);
  const [couponDiscountedPrice, setCouponDiscountedPrice] = useState<
    number | null
  >(null);

  const canUseMobileMoney = country in PAWAPAY_COUNTRIES;

  const price =
    currency === "EUR"
      ? course.price_eur
      : currency === "USD"
        ? course.price_usd
        : course.price_xaf;

  const finalPrice = couponDiscountedPrice ?? price;

  // ── Fetch real operators when country changes ──
  useEffect(() => {
    if (!canUseMobileMoney || method !== "mobile_money") return;

    setLoadingOperators(true);
    setOperators([]);
    setSelectedOperator(null);

    fetch(`/api/payments/pawapay/config?country=${country}`)
      .then((r) => r.json())
      .then((data) => {
        setOperators(data.providers ?? []);
        setPhonePrefix(data.prefix ?? "");
        // Auto-select first operator
        if (data.providers?.length === 1) {
          setSelectedOperator(data.providers[0]);
        }
      })
      .catch(() => setOperators([]))
      .finally(() => setLoadingOperators(false));
  }, [country, canUseMobileMoney, method]);

  function handleCurrencySelect(c: Currency) {
    setCurrency(c);
    if (c === "USD" || c === "EUR") {
      setMethod("paypal");
    } else {
      if (canUseMobileMoney) setMethod("mobile_money");
    }
  }

  function handleMethodSelect(m: PaymentMethod) {
    setMethod(m);
    if (m === "paypal" && currency !== "USD" && currency !== "EUR") {
      setCurrency("USD");
    }
    if (m === "mobile_money") {
      const config = PAWAPAY_COUNTRIES[country];
      setCurrency((config?.currency as Currency) || "XAF");
    }
  }

  function handleCountrySelect(code: string) {
    setCountry(code);
    setShowCountryPicker(false);
    if (code in PAWAPAY_COUNTRIES) {
      setCurrency(PAWAPAY_COUNTRIES[code].currency as Currency);
      setMethod("mobile_money");
    } else {
      setCurrency("USD");
      setMethod("paypal");
    }
  }

  async function handleMobileMoneyPayment() {
    if (!phoneNumber.trim()) {
      setError("Veuillez entrer votre numéro de téléphone");
      return;
    }
    if (!selectedOperator) {
      setError("Veuillez sélectionner votre opérateur mobile money");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/payments/pawapay/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productType,
        productId: productId ?? course.id,
        amount: Math.round(finalPrice),
        currency,
        country,
        phoneNumber,
        provider: selectedOperator.provider, // exact code e.g. "MTN_MOMO_CMR"
        couponId: appliedCouponId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Paiement échoué. Vérifiez votre numéro.");
      setLoading(false);
      return;
    }

    setMobileMoneyPending(true);
    setLoading(false);
    pollPaymentStatus(data.depositId);
  }

  async function pollPaymentStatus(depositId: string) {
    let attempts = 0;
    const MAX_ATTEMPTS = 24; // 2 minutes (24 × 5s)

    const poll = async () => {
      attempts++;

      if (attempts > MAX_ATTEMPTS) {
        setError(
          "Délai d'attente dépassé. Vérifiez votre email de confirmation ou contactez le support.",
        );
        setMobileMoneyPending(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/payments/status?depositId=${depositId}&provider=pawapay`,
        );
        const data = await res.json();
        console.log(`Poll ${attempts}:`, data.status);

        if (data.status === "COMPLETED") {
          window.location.href = `/checkout/success?productType=${productType}&productId=${productId ?? course.id}`;
          return;
        }
        if (data.status === "FAILED" || data.status === "CANCELLED") {
          setError("Paiement échoué ou annulé. Veuillez réessayer.");
          setMobileMoneyPending(false);
          return;
        }
        // PROCESSING, ACCEPTED — keep polling
        setTimeout(poll, 5000);
      } catch {
        setTimeout(poll, 5000);
      }
    };

    setTimeout(poll, 5000);
  }

  async function handlePayPalPayment() {
    setLoading(true);
    setError("");

    const paypalCurrency =
      currency === "USD" || currency === "EUR" ? currency : "USD";

    // If coupon applied, use discounted price converted to paypal currency
    // Otherwise use the base price for that currency
    const basePaypalAmount =
      paypalCurrency === "USD" ? course.price_usd : course.price_eur;

    // Apply coupon discount proportionally if coupon was applied
    let paypalAmount = basePaypalAmount;
    if (appliedCouponId && couponDiscountedPrice !== null) {
      const discountRatio = couponDiscountedPrice / price;
      paypalAmount = Math.round(basePaypalAmount * discountRatio * 100) / 100;
    }

    const res = await fetch("/api/payments/paypal/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productType,
        productId: productId ?? course.id,
        amount: paypalAmount, // ← discounted
        currency: paypalCurrency,
        couponId: appliedCouponId,
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

  // ── Pending screen ──
  if (mobileMoneyPending) {
    return (
      <div className="max-w-md mx-auto bg-white/60 border border-[#f3dfea] p-12 text-center space-y-6">
        <div className="w-16 h-16 border-4 border-[#a61968] border-t-transparent rounded-full animate-spin mx-auto" />
        <div>
          <h3 className="font-serif text-2xl font-medium text-[#172A39]/80 mb-3">
            Confirmez sur votre téléphone
          </h3>
          {selectedOperator?.logo && (
            <img
              src={selectedOperator.logo}
              alt={selectedOperator.displayName}
              className="h-8 mx-auto mb-3 object-contain"
            />
          )}
          <p className="text-sm text-[#172A39]/80 leading-relaxed">
            Une demande de paiement{" "}
            <strong>{selectedOperator?.displayName}</strong> a été envoyée au
            numéro <strong className="text-[#172A39]">{phoneNumber}</strong>.
          </p>
          <p className="text-sm text-[#172A39]/80 mt-2">
            Entrez votre PIN Mobile Money pour confirmer.
          </p>
        </div>
        <p className="text-xs text-[#172A39]/60 tracking-[3px] uppercase animate-pulse">
          En attente...
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-12">
      {/* ── LEFT — Order summary ── */}
      <div className="bg-white/60 border border-[#f3dfea] p-8 h-fit">
        <h2 className="text-xs tracking-[3px] uppercase text-[#172A39]/80 mb-6">
          Récapitulatif
        </h2>

        <div className="flex gap-4 pb-6 border-b border-[#f3dfea]">
          <div className="w-20 h-14 bg-[#f9eff4] flex-shrink-0 overflow-hidden">
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-serif text-2xl text-[#a61968] opacity-30 italic">
                  P
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-[#172A39]/80 mb-1">
              {productType === "COACHING" ? "Session coaching" : "Formation"}
            </p>
            <p className="font-medium text-[#172A39]">{course.title}</p>
            <p className="text-xs text-[#172A39]/80 mt-1">
              {productType === "COACHING"
                ? "Session 1-to-1 avec Parys"
                : "Accès à vie"}
            </p>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="py-6 border-b border-[#f3dfea] space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[#172A39]/80">Sous-total</span>
            <span className="text-[#172A39]">
              {formatPrice(price, currency)}
            </span>
          </div>

          {couponDiscountedPrice !== null && (
            <div className="flex justify-between text-sm text-[#a61968]">
              <span>Réduction code promo</span>
              <span>
                -{" "}
                {formatPrice(
                  price - couponDiscountedPrice,
                  currency !== "USD" && currency !== "EUR" ? "XAF" : currency,
                )}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-[#172A39]/80">Frais de traitement</span>
            <span className="text-[#172A39]/80">Inclus</span>
          </div>

          {currency !== "XAF" && currency !== "XOF" && (
            <div className="flex justify-between text-xs text-[#172A39]/80 pt-1 border-t border-[#f3dfea]">
              <span>Équivalent XAF</span>
              <span>≈ {formatPrice(course.price_xaf, "XAF")}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="pt-6 flex justify-between items-center">
          <span className="text-xs tracking-[2px] uppercase text-[#172A39]/80">
            Total
          </span>
          <span className="font-serif text-3xl font-medium text-[#172A39]">
            {formatPrice(finalPrice, currency)} {/* ← finalPrice not price */}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-[#f3dfea] flex items-center gap-2">
          <span className="text-xs text-[#172A39]/80">Via</span>
          {method === "mobile_money" && selectedOperator ? (
            <div className="flex items-center gap-2">
              {selectedOperator.logo && (
                <img
                  src={selectedOperator.logo}
                  alt={selectedOperator.displayName}
                  className="h-5 object-contain"
                />
              )}
              <span className="text-xs font-medium text-[#a61968]">
                {selectedOperator.displayName}
              </span>
            </div>
          ) : (
            <span
              className={cn(
                "text-xs px-2 py-1 font-medium",
                method === "mobile_money"
                  ? "bg-[#f9eff4] text-[#a61968]"
                  : "bg-blue-50 text-[#003087]",
              )}
            >
              {method === "mobile_money" ? "Mobile Money" : "PayPal"}
            </span>
          )}
        </div>
      </div>

      {/* ── RIGHT — Payment form ── */}
      <div className="bg-white/60 border border-[#f3dfea] p-8 space-y-6">
        {/* Currency */}
        <div>
          <h2 className="text-xs tracking-[3px] uppercase text-[#172A39]/80 mb-3">
            Devise
          </h2>
          <div className="flex gap-2">
            {(["XAF", "USD", "EUR"] as const).map((c) => (
              <button
                key={c}
                onClick={() => handleCurrencySelect(c)}
                className={cn(
                  "flex-1 py-2.5 text-xs tracking-[2px] uppercase border transition-all font-medium",
                  (c === "XAF" && currency !== "USD" && currency !== "EUR") ||
                    currency === c
                    ? "border-[#a61968] bg-[#f9eff4] text-[#a61968]"
                    : "border-gray-200 text-[#172A39]/80 hover:border-gray-300",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { c: "XAF" as Currency, p: course.price_xaf },
              { c: "USD" as Currency, p: course.price_usd },
              { c: "EUR" as Currency, p: course.price_eur },
            ].map(({ c, p }) => (
              <div
                key={c}
                className={cn(
                  "text-center py-1.5 text-xs transition-all",
                  (c === "XAF" && currency !== "USD" && currency !== "EUR") ||
                    currency === c
                    ? "text-[#a61968] font-medium"
                    : "text-[#172A39]/80",
                )}
              >
                {formatPrice(p, c)}
              </div>
            ))}
          </div>
        </div>

        {/* Country picker */}
        {currency !== "USD" && currency !== "EUR" && (
          <div>
            <h2 className="text-xs tracking-[3px] uppercase text-[#172A39]/80 mb-3">
              Votre pays
            </h2>
            <div className="relative">
              <button
                onClick={() => setShowCountryPicker(!showCountryPicker)}
                className="w-full flex items-center gap-3 border border-gray-200 px-4 py-3 hover:border-[#a61968] transition-colors text-sm"
              >
                <span className="text-lg">
                  {PAWAPAY_COUNTRIES[country]?.flag || (
                    <Globe size={18} className="inline" />
                  )}
                </span>
                <span className="text-[#172A39]">
                  {PAWAPAY_COUNTRIES[country]?.name || "Choisir votre pays"}
                </span>
                <ChevronDown size={16} className="ml-auto text-[#172A39]/80" />
              </button>

              {showCountryPicker && (
                <div className="absolute top-full left-0 right-0 z-20 bg-white border border-gray-200 max-h-52 overflow-y-auto shadow-xl">
                  {Object.entries(PAWAPAY_COUNTRIES).map(([code, config]) => (
                    <button
                      key={code}
                      onClick={() => handleCountrySelect(code)}
                      className={cn(
                        "w-full flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-[#f9eff4] transition-colors text-left",
                        country === code && "bg-[#f9eff4]",
                      )}
                    >
                      <span>{config.flag}</span>
                      <span className="flex-1">{config.name}</span>
                      <span className="text-xs text-[#172A39]/80">
                        {config.currency}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => {
                        setCurrency("USD");
                        setMethod("paypal");
                        setShowCountryPicker(false);
                      }}
                      className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#f9eff4] transition-colors text-left"
                    >
                      <Globe size={16} />
                      <span className="flex-1">Autre pays</span>
                      <span className="text-xs text-[#172A39]/80">
                        USD / PayPal
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment method */}
        <div>
          <h2 className="text-xs tracking-[3px] uppercase text-[#172A39]/80 mb-3">
            Moyen de paiement
          </h2>
          <div className="space-y-3">
            {canUseMobileMoney && currency !== "USD" && currency !== "EUR" && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleMethodSelect("mobile_money")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMethodSelect("mobile_money");
                  }
                }}
                className={cn(
                  "w-full p-4 border text-left transition-colors cursor-pointer",
                  method === "mobile_money"
                    ? "border-[#a61968] bg-[#f9eff4]"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                <p className="font-medium text-sm text-[#172A39] mb-3">
                  Mobile Money
                </p>

                {/* Real operators from PawaPay API */}
                {loadingOperators ? (
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-8 w-16 bg-gray-100 animate-pulse rounded"
                      />
                    ))}
                  </div>
                ) : operators.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {operators.map((op) => (
                      <button
                        key={op.provider}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOperator(op);
                          setMethod("mobile_money");
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 border cursor-pointer transition-colors",
                          selectedOperator?.provider === op.provider
                            ? "border-[#a61968] bg-white"
                            : "border-gray-200 bg-white hover:border-gray-300",
                        )}
                      >
                        {op.logo && (
                          <img
                            src={op.logo}
                            alt={op.displayName}
                            className="h-5 w-auto object-contain"
                          />
                        )}
                        <span className="text-xs font-medium text-[#172A39]/80">
                          {op.displayName}
                        </span>
                        {selectedOperator?.provider === op.provider && (
                          <Check size={14} className="text-[#a61968]" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#172A39]/80">
                    Chargement des opérateurs...
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => handleMethodSelect("paypal")}
              className={cn(
                "w-full p-4 border text-left transition-colors cursor-pointer",
                method === "paypal"
                  ? "border-[#a61968] bg-[#f9eff4]"
                  : "border-gray-200 hover:border-gray-300",
              )}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm text-[#172A39]">
                    PayPal / Carte bancaire
                  </p>
                  <p className="text-xs text-[#172A39]/80 mt-0.5">
                    {method === "paypal" &&
                    currency !== "USD" &&
                    currency !== "EUR"
                      ? `Facturé en USD — ${formatPrice(course.price_usd, "USD")}`
                      : "Visa, Mastercard, PayPal — mondial"}
                  </p>
                </div>
                <span className="text-xs font-bold text-[#003087]">PayPal</span>
              </div>
            </button>
          </div>
        </div>

        {/* Phone number */}
        {method === "mobile_money" && (
          <div className="space-y-2">
            <label className="text-xs tracking-[2px] uppercase text-[#172A39]/80">
              Numéro Mobile Money
              {phonePrefix && (
                <span className="text-[#172A39]/60 ml-2 normal-case">
                  (indicatif +{phonePrefix})
                </span>
              )}
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={
                PAWAPAY_COUNTRIES[country]?.placeholder || "+XXX XXXXXXXXX"
              }
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#a61968] transition-colors"
            />
            {selectedOperator && (
              <p className="text-xs text-[#172A39]/80">
                Numéro {selectedOperator.displayName} associé à votre compte
                Mobile Money
              </p>
            )}
          </div>
        )}

        {productType === "COURSE" && (
          <CouponInput
            courseId={productId ?? course.id}
            originalPrice={price}
            currency={
              currency === "USD" || currency === "EUR" ? currency : "XAF"
            }
            onApply={(discountedPrice, couponId) => {
              setCouponDiscountedPrice(discountedPrice);
              setAppliedCouponId(couponId);
            }}
            onRemove={() => {
              setCouponDiscountedPrice(null);
              setAppliedCouponId(null);
            }}
          />
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
          disabled={loading || (method === "mobile_money" && !selectedOperator)}
          className="w-full bg-[#a61968] cursor-pointer text-white py-4 text-xs tracking-[3px] uppercase font-medium hover:bg-[#172A39] transition-colors disabled:opacity-60"
        >
          {loading
            ? "Traitement en cours..."
            : method === "mobile_money"
              ? selectedOperator
                ? `Payer ${formatPrice(Math.round(finalPrice), currency)} via ${selectedOperator.displayName}`
                : "Sélectionnez un opérateur"
              : `Payer avec PayPal`}
        </button>

        <p className="text-xs text-[#172A39]/80 text-center">
          Paiement 100% sécurisé · Accès immédiat après confirmation
        </p>
      </div>
    </div>
  );
}
