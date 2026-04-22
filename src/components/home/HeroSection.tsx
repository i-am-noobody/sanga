"use client";

import { useEffect, useState } from "react";

interface HeroSectionProps {
  onOrderNow: () => void;
}

const slides = [
  "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
  "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg",
];

export default function HeroSection({ onOrderNow }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToPreviousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      goToNextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="top" className="relative min-h-screen overflow-hidden scroll-mt-24">
      {slides.map((slide, index) => (
        <div
          key={slide}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-110"
          }`}
          style={{ backgroundImage: `url('${slide}')` }}
        />
      ))}
      <div className="absolute inset-0 bg-black/70" />

      <button
        type="button"
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/35 text-2xl text-white backdrop-blur-sm transition hover:border-yellow-300/45 hover:text-yellow-200 sm:left-6 sm:h-12 sm:w-12"
        onClick={goToPreviousSlide}
      >
        &#8249;
      </button>

      <button
        type="button"
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/35 text-2xl text-white backdrop-blur-sm transition hover:border-yellow-300/45 hover:text-yellow-200 sm:right-6 sm:h-12 sm:w-12"
        onClick={goToNextSlide}
      >
        &#8250;
      </button>

      <div className="absolute inset-0 flex items-center justify-center px-4 pt-20 text-center sm:px-6">
        <div className="max-w-3xl">
          <h1 className="mb-4 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Best <span className="text-yellow-300">Sandwiches</span>
          </h1>
          <p className="mb-8 text-base leading-relaxed text-gray-200 sm:text-lg md:text-xl">
            Fresh, grilled & full of flavor<br />
            The best sandwiches in town.<br />
            You can order directly from us or from UberEats.
          </p>
          <button
            type="button"
            className="rounded-full bg-yellow-300 px-6 py-3 font-semibold text-black transition-colors hover:bg-yellow-200"
            onClick={onOrderNow}
          >
            Order Now
          </button>

          <div className="mt-8 flex items-center justify-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  currentSlide === index ? "w-8 bg-yellow-300" : "w-2.5 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
