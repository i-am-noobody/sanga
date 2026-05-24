"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Olivia Brown",
    date: "2025-05-03",
    text: "Amazing flavours and friendly staff — best in town!",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    name: "Jack Wilson",
    date: "2025-04-18",
    text: "Consistently great food. Highly recommend for a treat.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Amelia Smith",
    date: "2025-04-06",
    text: "Lovely atmosphere and really tasty options for all tastes.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    name: "Thomas Wright",
    date: "2025-03-22",
    text: "Fantastic service and high-quality ingredients every time.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    name: "Isla Harris",
    date: "2025-03-02",
    text: "Great spot for weekend brunch — we loved it!",
    rating: 4,
    image: "https://randomuser.me/api/portraits/women/24.jpg",
  },
  {
    name: "Ethan Miller",
    date: "2025-02-14",
    text: "Top quality and close to perfect. Will come back.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/18.jpg",
  },
  {
    name: "Chloe Walker",
    date: "2025-01-28",
    text: "Friendly service, lovely food presentation, very tasty.",
    rating: 4,
    image: "https://randomuser.me/api/portraits/women/30.jpg",
  },
];

export default function TestimonialsSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      setCanPrev(el.scrollLeft > 10);
      setCanNext(el.scrollLeft + el.clientWidth + 10 < el.scrollWidth);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollByCard = (direction: "prev" | "next") => {
    const el = containerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLDivElement>(".testimonial-card");
    const gap = 16; // matches tailwind gap-4
    const step = (card?.clientWidth || Math.floor(el.clientWidth * 0.8)) + gap;

    // Looping behavior: when moving next from end -> jump to start; when prev from start -> jump to end
    if (direction === "next") {
      if (el.scrollLeft + el.clientWidth + 10 >= el.scrollWidth) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    } else {
      if (el.scrollLeft <= 10) {
        el.scrollTo({ left: Math.max(0, el.scrollWidth - el.clientWidth), behavior: "smooth" });
      } else {
        el.scrollBy({ left: -step, behavior: "smooth" });
      }
    }
  };

  return (
    <motion.section
      id="testimonials"
      className="scroll-mt-24 relative overflow-hidden px-6 py-24 text-center text-white"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.88), rgba(0,0,0,0.95)), url('/logo.png')",
          backgroundSize: "140%",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(218,41,28,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(218,41,28,0.09),transparent_25%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.5em] text-[#DA291C]">
            Customer Reviews
          </p>
          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            What people say about Sanga
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/65 sm:text-base">
            We take pride in our food and service, but don't just take our word for it.
          </p>
        </div>

        <div className="relative">
          <div className="pointer-events-auto absolute -left-2 top-1/2 z-20 hidden -translate-y-1/2 md:block">
            <button
              aria-label="Previous testimonials"
              onClick={() => scrollByCard("prev")}
              className={`rounded-full bg-white/6 p-3 text-white transition-opacity hover:opacity-90 ${canPrev ? "opacity-100" : "opacity-40"}`}
              disabled={!canPrev}
            >
              ‹
            </button>
          </div>

          <div
            ref={containerRef}
            className="no-scrollbar mx-auto flex w-full gap-4 overflow-x-auto px-2 py-4 scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" as any }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.article
                key={index}
                className="testimonial-card snap-center flex-shrink-0 w-[320px] sm:w-[360px] lg:w-[420px] rounded-[18px] border border-white/10 bg-[linear-gradient(145deg,#1b1b1b,#0d0d0d)] p-6 text-left shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-7"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-cover bg-center ring-2 ring-[#DA291C]/70"
                      style={{ backgroundImage: `url('${testimonial.image}')` }}
                    >
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#DA291C] text-[11px] font-black text-white shadow-md">
                        ★
                      </span>
                    </div>
                    <div>
                      <p className="text-[17px] font-bold text-white">{testimonial.name}</p>
                      <p className="text-[13px] text-white/45">{testimonial.date}</p>
                    </div>
                  </div>

                  <div className="text-4xl font-black leading-none bg-gradient-to-r from-[#DA291C] via-[#DA291C] to-[#DA291C] bg-clip-text text-transparent">
                    G
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <div className="flex text-[#DA291C] text-[18px] tracking-[2px]">
                    {[...Array(5)].map((_, starIndex) => (
                      <span key={starIndex}>{starIndex < testimonial.rating ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#DA291C] text-[11px] font-bold text-white">
                    ✓
                  </span>
                </div>

                <p className="mt-5 text-[17px] leading-8 text-white/78">{testimonial.text}</p>
              </motion.article>
            ))}
          </div>

          <div className="pointer-events-auto absolute -right-2 top-1/2 z-20 hidden -translate-y-1/2 md:block">
            <button
              aria-label="Next testimonials"
              onClick={() => scrollByCard("next")}
              className={`rounded-full bg-white/6 p-3 text-white transition-opacity hover:opacity-90 ${canNext ? "opacity-100" : "opacity-40"}`}
              disabled={!canNext}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
