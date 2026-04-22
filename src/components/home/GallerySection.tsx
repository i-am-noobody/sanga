"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { GalleryImage } from "./types";

export default function GallerySection() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadGallery = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/gallery", {
          cache: "no-store",
          signal: controller.signal,
        });

        const payload = await res.json().catch(() => ({ data: [] }));

        if (!res.ok) {
          const message =
            typeof payload?.error === "string" && payload.error.trim().length > 0
              ? payload.error
              : "Unable to load gallery images right now.";
          throw new Error(message);
        }

        setImages(Array.isArray(payload.data) ? payload.data : []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        console.error("Failed to load gallery:", err);
        setError("Gallery is currently unavailable. Please try again in a moment.");
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    void loadGallery();

    return () => {
      controller.abort();
    };
  }, [reloadKey]);

  return (
    <motion.section
      id="gallery"
      className="scroll-mt-24 px-4 py-20 text-center sm:px-6 md:px-8"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto mb-10 max-w-6xl">
        <h2 className="mb-3 text-3xl font-bold text-yellow-300 sm:text-4xl">Gallery</h2>
        <p className="mx-auto max-w-2xl text-sm text-slate-300/80 sm:text-base">
          Moments from the kitchen and happy customers.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-8 text-slate-300/90">
            Loading gallery...
          </p>
        ) : error ? (
          <div className="col-span-full rounded-2xl border border-rose-300/35 bg-rose-950/35 p-8 text-rose-100">
            <p className="mb-4">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((prev) => prev + 1)}
              className="rounded-lg border border-rose-200/60 bg-rose-200/10 px-4 py-2 font-semibold text-rose-100 transition hover:bg-rose-200/20"
            >
              Retry
            </button>
          </div>
        ) : images.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-8 text-slate-300/90">
            No images available at the moment.
          </p>
        ) : (
          images.map((image, index) => (
            <motion.div
              key={image.asset_id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-transform duration-300 hover:scale-[1.02]"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Image
                src={image.secure_url}
                alt={image.public_id}
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
            </motion.div>
          ))
        )}
      </div>
    </motion.section>
  );
}
