"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const menuImages = [
  {
    src: "/menu/menu1 (1).png",
    alt: "Menu Item 1",
  },
  {
    src: "/menu/menu1 (4).png",
    alt: "Menu Item 2",
  },
  {
    src: "/menu/menu1 (3).png",
    alt: "Menu Item 3",
  },
  {
    src: "/menu/menu1 (2).png",
    alt: "Menu Item 4",
  },
];

export default function MenuSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % menuImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + menuImages.length) % menuImages.length
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <motion.section
      id="menu"
      className="scroll-mt-24 px-4 py-20"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="mb-3 text-4xl font-bold text-[#DA291C]">
          Our Menu
        </h2>

        <p className="mx-auto mb-10 max-w-2xl text-slate-300/80">
          Explore our signature dishes crafted fresh every day.
        </p>

        <div className="relative mx-auto max-w-4xl">
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#DA291C] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#c12419]"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 z-20 flex h-12 w-12 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#DA291C] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#c12419]"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>

          {/* Image Container */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="relative aspect-[16/9] w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{
                    opacity: 0,
                    scale: 1.05,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                  transition={{
                    duration: 0.45,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0"
                >
                  <Image
                    src={menuImages[currentIndex].src}
                    alt={menuImages[currentIndex].alt}
                    fill
                    priority
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Dots */}
          <div className="mt-6 flex items-center justify-center gap-3">
            {menuImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? "w-10 bg-[#DA291C]"
                    : "w-3 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}