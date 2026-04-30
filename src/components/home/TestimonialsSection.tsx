"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sharni Tomkins",
    date: "2025-05-03",
    text: "There is a huge range to choose from, but the burgers are pricey. Hit and miss with service.",
    rating: 4,
  },
  {
    name: "Ayesha Khan",
    date: "2025-04-18",
    text: "Fresh sandwiches, bold flavour, and a cozy vibe. A reliable spot for a quick meal.",
    rating: 5,
  },
  {
    name: "Liam Carter",
    date: "2025-04-06",
    text: "Great portions and a strong menu. The black-themed setup here matches the premium feel.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
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
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,183,77,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(255,183,77,0.09),transparent_25%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.5em] text-[#ffcc80]">
            Customer Reviews
          </p>
          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            What people say about Sanga
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/65 sm:text-base">
            A black-themed testimonial wall inspired by premium review cards and built to fit the rest of the site.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.article
              key={testimonial.name}
              className="relative mx-auto w-full max-w-[520px] rounded-[18px] border border-white/10 bg-[linear-gradient(145deg,#1b1b1b,#0d0d0d)] p-6 text-left shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-7"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[url('https://randomuser.me/api/portraits/women/44.jpg')] bg-cover bg-center ring-2 ring-[#ffb74d]/70">
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff9800] text-[11px] font-black text-white shadow-md">
                      ★
                    </span>
                  </div>
                  <div>
                    <p className="text-[17px] font-bold text-white">{testimonial.name}</p>
                    <p className="text-[13px] text-white/45">{testimonial.date}</p>
                  </div>
                </div>

                <div className="text-2xl font-black leading-none bg-gradient-to-r from-[#4285F4] via-[#DB4437] via-[#F4B400] to-[#0F9D58] bg-clip-text text-transparent">
                  G
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <div className="flex text-[#ffd54f] text-[18px] tracking-[2px]">
                  {[...Array(5)].map((_, starIndex) => (
                    <span key={starIndex}>{starIndex < testimonial.rating ? "★" : "☆"}</span>
                  ))}
                </div>
                <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#1a73e8] text-[11px] font-bold text-white">
                  ✓
                </span>
              </div>

              <p className="mt-5 text-[17px] leading-8 text-white/78">
                {testimonial.text}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
