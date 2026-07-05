// components/checkout/CouponInput.tsx
"use client"

import { useState } from "react"
import { validateCoupon } from "@/lib/actions/coupon.actions"
import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

type Currency = "XAF" | "USD" | "EUR"

interface CouponInputProps {
  courseId: string
  originalPrice: number
  currency: Currency
  onApply: (discountedPrice: number, couponId: string) => void
  onRemove: () => void
}

export default function CouponInput({
  courseId,
  originalPrice,
  currency,
  onApply,
  onRemove,
}: CouponInputProps) {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [applied, setApplied] = useState<{
    message: string
    discountAmount: number
    discountedPrice: number
    couponId: string
  } | null>(null)

  async function handleApply() {
    if (!code.trim()) return
    setLoading(true)
    setError("")

    const result = await validateCoupon(code, courseId, originalPrice)

    if (!result.valid) {
      setError(result.message || "Code invalide")
      setLoading(false)
      return
    }

    setApplied({
      message: result.message!,
      discountAmount: result.discountAmount!,
      discountedPrice: result.discountedPrice!,
      couponId: result.couponId!,
    })
    onApply(result.discountedPrice!, result.couponId!)
    setLoading(false)
  }

  function handleRemove() {
    setApplied(null)
    setCode("")
    setError("")
    onRemove()
  }

  if (applied) {
    return (
      <div className="bg-green-50 border border-green-200 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="flex items-center gap-1 text-xs font-medium text-green-700">
            <Check size={12} /> {applied.message}
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            Réduction de{" "}
            {formatPrice(applied.discountAmount, currency)} appliquée
          </p>
        </div>
        <button
          onClick={handleRemove}
          className="text-xs text-green-600 hover:text-green-800 underline"
        >
          Retirer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-xs tracking-[2px] uppercase text-gray-500">
        Code promo
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder="BLACKFRIDAY"
          className="flex-1 border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff63ce] transition-colors uppercase"
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className={cn(
            "px-4 py-2.5 text-xs tracking-[1px] uppercase font-medium transition-colors",
            "bg-[#111] text-white hover:bg-[#ff63ce] disabled:opacity-50"
          )}
        >
          {loading ? "..." : "Appliquer"}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}