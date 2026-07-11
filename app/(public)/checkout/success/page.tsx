// app/(public)/checkout/success/page.tsx
import Link from "next/link";
import { Check } from "lucide-react";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ productType?: string; productId?: string }>;
}) {
  const { productType } = await searchParams;

  return (
    <div className="min-h-screen bg-[#E9E4E0] flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 bg-[#f9eff4] rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={28} className="text-[#a61968]" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-gray-900 mb-4">
          Paiement confirmé !
        </h1>
        <p className="text-gray-500 mb-8">
          {productType === "COURSE"
            ? "Tu as maintenant accès à ta formation. Bonne apprentissage !"
            : "Votre session a été confirmée. Vérifiez votre email pour le lien de visio."}
        </p>
        <Link
          href="/dashboard"
          className="bg-[#a61968] text-white px-10 py-4 text-xs tracking-[3px] uppercase hover:bg-[#172A39] transition-colors inline-block"
        >
          Accéder à mon espace →
        </Link>
      </div>
    </div>
  );
}
