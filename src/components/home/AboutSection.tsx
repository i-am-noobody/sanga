"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutSection() {
  const highlights = [
    {
      title: "Quality First",
      detail: "Premium ingredients and careful prep in every sanga.",
    },
    {
      title: "Unique Technique",
      detail: "Our pan-fried finish delivers crisp texture and deep flavor.",
    },
    {
      title: "Great Value",
      detail: "Accessible pricing without compromising on quality.",
    },
    {
      title: "Made Consistent",
      detail: "Reliable taste and service that keep customers coming back.",
    },
  ];

  return (
    <motion.section
      id="about"
      className="scroll-mt-24 px-4 py-20 sm:px-6 md:px-8"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/95 via-slate-900/70 to-slate-900/40 p-5 shadow-[0_20px_50px_rgba(2,6,23,0.45)] backdrop-blur-sm sm:p-8 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10">
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <Image
            src="https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg"
            alt="Freshly prepared sandwiches at Mr Sanga"
            width={760}
            height={560}
            className="h-full w-full object-cover"
          />
          <p className="absolute bottom-4 left-4 z-20 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-200 backdrop-blur-sm">
            Fresh Daily, Cooked To Order
          </p>
        </div>

        <div className="text-center lg:text-left">
          <p className="mb-3 inline-flex rounded-full border border-yellow-300/35 bg-yellow-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-200">
            Why Customers Choose Us
          </p>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            About <span className="text-yellow-300">Us</span>
          </h2>
          <p className="mb-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            Mr Sanga elevates the everyday sandwich using premium ingredients, chef-crafted recipes,
            and our signature home-style pan-frying method. Every bite balances comfort food
            familiarity with bold, modern flavor.
          </p>
          <p className="mb-6 text-base leading-relaxed text-slate-300 sm:text-lg">
            From breakfast favorites like The Benny to our 7-hour slow-braised chilli beef brisket,
            we focus on value, quality, and consistency so every customer gets a top-tier experience.
          </p>

          <div className="grid gap-3 text-left sm:grid-cols-2">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-white/12 bg-black/35 p-4 shadow-[0_10px_22px_rgba(2,6,23,0.35)] transition hover:border-yellow-300/40 hover:bg-black/45"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" aria-hidden />
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-yellow-100">{item.title}</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
