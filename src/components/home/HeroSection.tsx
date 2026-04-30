"use client";

import { useEffect, useState } from "react";

interface HeroSectionProps {
  onOrderNow: () => void;
}

const slides = [
  {
    image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    badge: "🥪 Made Fresh to Order",
    title: "Elevating",
    highlight: "Sandwiches",
    subtitle: "Premium ingredients. Bold, modern flavor.",
    desc: "Chef-crafted recipes with our signature home-style pan-frying.",
  },
  {
    image: "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg",
    badge: "🍳 Breakfast Favourite",
    title: "The",
    highlight: "Benny",
    subtitle: "A customer favourite, done right.",
    desc: "Comfort food classics with a refined twist.",
  },
  {
    image: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg",
    badge: "🔥 Signature Special",
    title: "Chilli Beef",
    highlight: "Brisket",
    subtitle: "7-hour slow braised perfection.",
    desc: "Rich, tender, and packed with bold flavour.",
  },
];

export default function HeroSection({ onOrderNow }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="top" className="relative min-h-screen overflow-hidden scroll-mt-24 bg-black text-white">
      {slides.map((slide, index) => (
        <div
          key={slide.image}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-110"
          }`}
          style={{ backgroundImage: `url('${slide.image}')` }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,212,59,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,212,59,0.06),transparent_25%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 pt-24 sm:px-6 lg:px-8">
        <div className="w-full text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-[#ffd43b]/30 bg-[#ffd43b]/10 px-5 py-2 text-sm font-medium text-[#ffd43b]">
            {slides[currentSlide].badge}
          </div>

          <h1 className="mx-auto text-5xl font-black leading-[1.2] tracking-tight sm:text-6xl md:text-7xl">
            {slides[currentSlide].title} <span className="text-[#ffd43b]">{slides[currentSlide].highlight}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 sm:text-xl">{slides[currentSlide].subtitle}</p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">{slides[currentSlide].desc}</p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOrderNow}
              className="rounded-full bg-[#ffd43b] px-7 py-3 font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-[#ffe15b]"
            >
              Order for Pickup →
            </button>

            <a
              href="#menu"
              className="rounded-full border border-white/25 px-7 py-3 text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              View Menu
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-white/75">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">🥪 Fresh Ingredients</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">🍔 Made to Order</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">⚡ Fast Service</div>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-2xl text-white backdrop-blur-md transition hover:border-[#ffd43b]/45 hover:text-[#ffd43b] md:flex"
      >
        &#8249;
      </button>

      <button
        type="button"
        aria-label="Next slide"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-2xl text-white backdrop-blur-md transition hover:border-[#ffd43b]/45 hover:text-[#ffd43b] md:flex"
      >
        &#8250;
      </button>

      <div className="absolute left-8 bottom-20 hidden items-center gap-2 rounded-lg bg-black/50 px-3 py-2 text-xs text-white backdrop-blur sm:flex">
        ⭐ 4.8 • Local Favourite
      </div>

      <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              currentSlide === index ? "w-8 bg-[#ffd43b]" : "w-2 bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}