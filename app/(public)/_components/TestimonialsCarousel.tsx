// app/(public)/_components/TestimonialsCarousel.tsx
"use client";

import { useEffect, useState } from "react";

type Testimonial = {
  quote: string;
  name: string;
};

export default function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <>
      {/* Desktop / tablet: static grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-12">
        {testimonials.map((t) => (
          <div key={t.name} className="flex flex-col items-center text-center">
            <p className="font-serif text-xl italic text-[#172A39] leading-relaxed mb-8">
              "{t.quote}"
            </p>
            <p className="text-xs tracking-[4px] uppercase font-medium text-[#172A39]/80">
              {t.name}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile: auto-sliding carousel */}
      <div className="md:hidden">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="w-full shrink-0 flex flex-col items-center text-center px-4"
              >
                <p className="font-serif text-xl italic text-[#172A39] leading-relaxed mb-8">
                  "{t.quote}"
                </p>
                <p className="text-xs tracking-[4px] uppercase font-medium text-[#172A39]/80">
                  {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setIndex(i)}
              aria-label={`Voir le témoignage ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-[#a61968]" : "w-1.5 bg-[#f3dfea]"
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
