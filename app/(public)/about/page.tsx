// app/(public)/about/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Gem, Share2, FingerprintPattern } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white ">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[.5] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #a61968 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Hero */}
      <section className="max-w-6xl h-dvh pt-24 mx-auto px-6 py-16 md:py-24 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <p className="text-xs tracking-[4px] text-gray-900 font-bold mb-5">
            Entrepreneure · Animatrice de télé · Maîtresse de cérémonie ·
            Productrice de contenu
          </p>
          <h1 className="font-serif text-xl sm:text-3xl md:text-4xl font-medium text-gray-900 leading-none sm:leading-none mb-4">
            De la caméra <br />
            <span className=" text-[#a61968] font-bold">au mentorat.</span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-lg leading-relaxed max-w-xl">
            Parys Batonda évolue dans l&rsquo;univers de la création de contenu
            depuis 2018. Aujourd&rsquo;hui, elle partage son expérience pour
            aider une nouvelle génération de créatrices à grandir et à se
            dépasser.
          </p>
        </div>

        <div className="border border-[#a61968] md:col-span-5 relative hidden md:flex aspect-4/5 overflow-hidden items-end">
          <Image
            src="/images/Parys-About2.png"
            alt="Parys Batonda"
            fill
            priority
            className="object-contain"
          />
        </div>
      </section>

      {/* Bio + Timeline */}
      <section className="">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-16 md:gap-24">
          <div>
            <p className="text-base tracking-[4px] uppercase text-[#a61968] mb-3">
              Son histoire
            </p>
            <div className="space-y-4">
              <p className="font-serif italic text-sm md:text-2xl text-gray-900 leading-tight">
                &ldquo;Partager son expérience, c&rsquo;est aussi continuer à
                apprendre.&rdquo;
              </p>
              <p className="text-gray-500 text-sm sm:text-lg leading-relaxed">
                Au fil des années, son parcours l&rsquo;a menée derrière et
                devant la caméra&nbsp;: animatrice sur Chill Zone (Vox Africa),
                chroniqueuse sur Même pas fatiguée&nbsp;! (Canal+), et aussi son
                propre show, Le Parys Show, qu&rsquo;elle produit elle-même et
                diffuse sur sa chaîne YouTube.
              </p>
              <p className="text-gray-500 text-sm sm:text-lg leading-relaxed">
                Au-delà des plateaux, Parys a su fédérer une communauté fidèle,
                qui la suit pour son authenticité, la qualité de son travail et
                les valeurs qu&rsquo;elle défend.
              </p>
            </div>
          </div>

          <div className="relative pl-10 border-l border-[#f3dfea] space-y-14 py-2">
            <div className="relative">
              <div className="absolute -left-[45px] top-1 w-2.5 h-2.5 rounded-full bg-[#a61968]" />
              <h4 className="text-xs tracking-[2px] uppercase font-medium text-gray-900 mb-2">
                2018 — Les débuts
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Entrée dans l&rsquo;univers de la création de contenu.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -left-[45px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300" />
              <h4 className="text-xs tracking-[2px] uppercase font-medium text-gray-900 mb-2">
                Télé &amp; digital
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Chill Zone (Vox Africa), Même pas fatiguée&nbsp;! (Canal+), puis
                Le Parys Show, produit et diffusé sur YouTube.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -left-[45px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300" />
              <h4 className="text-xs tracking-[2px] uppercase font-medium text-gray-900 mb-2">
                2023 — Level up
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Le déclic de vouloir grandir, se dépasser — et transmettre.
                Naissance des formations et du coaching.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial image */}
      <section className="border-t border-[#f3dfea]">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center">
          <div className="relative w-full max-w-md aspect-square overflow-hidden border border-[#f3dfea]">
            <Image
              src="/images/Parys-2.png"
              alt="Le Parys Show"
              fill
              className="object-cover"
            />
          </div>
          <p className="text-xs tracking-[3px] uppercase text-gray-500 mt-6 text-center">
            Le Parys Show — sa propre émission, produite et diffusée sur YouTube
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#f9eff4] border-y border-[#f3dfea] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium text-gray-900 text-center mb-16">
            Ce qui l&rsquo;anime
          </h2>
          <div className="grid md:grid-cols-3 gap-0 border border-[#f3dfea]">
            <div className="p-12 bg-white border-b md:border-b-0 md:border-r border-[#f3dfea] flex flex-col items-center text-center">
              <FingerprintPattern
                className="text-[#a61968] mb-6"
                size={32}
                strokeWidth={1.5}
              />
              <h3 className="text-xs tracking-[2px] uppercase font-medium text-gray-900 mb-4">
                Authenticité
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Ce supplément d&rsquo;âme qui fédère une communauté fidèle
                depuis 2018&nbsp;: être soi, sans filtre, à l&rsquo;écran comme
                en dehors.
              </p>
            </div>
            <div className="p-12 bg-white border-b md:border-b-0 md:border-r border-[#f3dfea] flex flex-col items-center text-center">
              <Gem
                className="text-[#a61968] mb-6"
                size={32}
                strokeWidth={1.5}
              />
              <h3 className="text-xs tracking-[2px] uppercase font-medium text-gray-900 mb-4">
                Exigence
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Une qualité de travail irréprochable, plateau après plateau,
                épisode après épisode du Parys Show.
              </p>
            </div>
            <div className="p-12 bg-white flex flex-col items-center text-center">
              <Share2
                className="text-[#a61968] mb-6"
                size={32}
                strokeWidth={1.5}
              />
              <h3 className="text-xs tracking-[2px] uppercase font-medium text-gray-900 mb-4">
                Transmission
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                La conviction que partager son expérience, c&rsquo;est aussi
                continuer à apprendre — et faire grandir celles qui la suivent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms strip */}
      <section className="w-full py-16 border-b border-[#f3dfea] overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center items-center opacity-40 grayscale gap-x-12 gap-y-6 px-6 text-center">
          <span className="font-serif text-2xl italic tracking-tight">
            Vox Africa
          </span>
          <span className="text-lg font-bold tracking-[2px]">CANAL+</span>
          <span className="font-serif text-2xl italic tracking-tight">
            YouTube
          </span>
          <span className="text-sm font-bold tracking-[5px] uppercase">
            Le Parys Show
          </span>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full px-6 py-24 flex justify-center">
        <div className="w-full max-w-4xl bg-[#f9eff4] border border-[#f3dfea] p-10 sm:p-16 md:p-24 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-gray-900 mb-6">
            Prête à passer au niveau supérieur&nbsp;?
          </h2>
          <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Rejoins une communauté de créatrices ambitieuses et transforme ta
            manière de créer, de raconter et de te positionner.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/courses"
              className="w-full sm:w-auto bg-[#a61968] text-white rounded-3xl px-10 py-4 text-xs tracking-[3px] uppercase hover:bg-[#a61968c7] transition-colors"
            >
              Découvrir les formations
            </Link>
            <Link
              href="/coaching"
              className="w-full sm:w-auto border border-gray-900 text-gray-900 rounded-3xl px-10 py-4 text-xs tracking-[3px] uppercase hover:bg-gray-900 hover:text-white transition-colors"
            >
              Réserver un coaching
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
