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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-4rem)]">
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
      <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
            Best <span className="text-yellow-400">Sandwiches</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
            Fresh, grilled & full of flavor<br />
            The best sandwiches in town.<br />
            You can order directly from us or from UberEats.
          </p>
          <button
            type="button"
            className="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
            onClick={onOrderNow}
          >
            Order Now
          </button>
        </div>
      </div>
    </section>
  );
}
