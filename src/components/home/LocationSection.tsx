"use client";

import { motion } from "framer-motion";

export default function LocationSection() {
  const address = "Shop1A-15 Skygate Centre, DFO Brisbane Airport";
  const encodedAddress = encodeURIComponent(address);
  const quickNotes = [
    "Easy parking at Skygate Centre",
    "Convenient for airport visitors",
    "One-tap navigation from any device",
  ];

  return (
    <motion.section
      id="location"
      className="px-6 py-24 text-center"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <h2 className="mb-4 text-4xl font-bold text-yellow-300">Our Location</h2>
      <p className="mx-auto mb-10 max-w-2xl text-sm text-slate-300/80 sm:text-base">
        Visit us at Skygate Centre near DFO Brisbane Airport.
      </p>

      <div className="mx-auto mb-8 max-w-5xl overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5 shadow-[0_14px_40px_rgba(2,6,23,0.45)]">
        <iframe
          src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
          title="Mr Sanga location map"
          className="h-72 w-full sm:h-96 md:h-[430px]"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="mx-auto grid max-w-5xl gap-4 text-left md:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_8px_24px_rgba(2,6,23,0.28)] backdrop-blur-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-200/90">Address</p>
          <p className="text-sm leading-relaxed text-slate-200">{address}</p>
          <p className="mt-3 text-xs text-slate-400">Inside Skygate Centre, near DFO Brisbane Airport.</p>
        </article>

        <article className="rounded-2xl border border-yellow-300/35 bg-yellow-300/95 p-5 shadow-[0_8px_24px_rgba(250,204,21,0.22)]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-900/80">Quick Action</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-950">Need the fastest route? Open turn-by-turn directions instantly.</p>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-950/20 bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-yellow-100 transition hover:bg-black"
          >
            Get Directions
          </a>
        </article>

        <article className="rounded-2xl border border-white/15 bg-slate-950/50 p-5 shadow-[0_8px_24px_rgba(2,6,23,0.28)]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-200/90">Map Access</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-200">Open the location in Google Maps to save or share it.</p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-transparent px-4 py-3 text-center text-sm font-semibold text-slate-100 transition hover:border-yellow-300/45 hover:text-yellow-200"
          >
            Open In Google Maps
          </a>
        </article>
      </div>

      <div className="mx-auto mt-6 grid max-w-5xl gap-3 text-sm text-slate-300/85 sm:grid-cols-3">
        {quickNotes.map((note) => (
          <p
            key={note}
            className="rounded-xl border border-white/10 bg-white/5 p-4 text-center shadow-[0_6px_18px_rgba(2,6,23,0.22)]"
          >
            {note}
          </p>
        ))}
      </div>
    </motion.section>
  );
}
