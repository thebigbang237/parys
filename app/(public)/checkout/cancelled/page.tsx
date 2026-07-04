// app/(public)/checkout/cancelled/page.tsx
import Link from "next/link";

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-gray-400 text-2xl">✕</span>
        </div>
        <h1 className="font-serif text-3xl font-medium text-gray-900 mb-4">
          Paiement annulé
        </h1>
        <p className="text-gray-500 mb-8">
          Ton paiement n'a pas été complété. Tu peux réessayer quand tu veux.
        </p>
        <Link
          href="/courses"
          className="bg-[#111] text-white px-10 py-4 text-xs tracking-[3px] uppercase hover:bg-[#ff63ce] transition-colors inline-block"
        >
          Retour aux formations
        </Link>
      </div>
    </div>
  );
}
