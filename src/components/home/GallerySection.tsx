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
        }).catch(() => null);

        let payload: any = null;
        if (res) payload = await res.json().catch(() => ({ data: [] }));

        // If API returned images, use them. Otherwise fall back to bundled public images.
        if (res && res.ok && Array.isArray(payload?.data) && payload.data.length > 0) {
          setImages(payload.data);
        } else {
          const localFiles = [
            "/A7406893.jpg",
            "/A7406900.jpg",
            "/A7406909.jpg",
            "/A7406923.jpg",
            "/A7406932.jpg",
            "/A7406934.jpg",
            "/A7406948.jpg",
            "/A7406954.jpg",
            "/A7406962.jpg",
            "/A7406969.jpg",
            "/A7406984.jpg",
            "/A7406992.jpg",
            "/A7407002.jpg",
            "/A7407005.jpg",
            "/A7407023.jpg",
            "/A7407099.jpg",
            "/A7407115.jpg",
            "/A7407132.jpg",
            "/A7407135.jpg",
            "/A7407142.jpg",
          ];

          const localImages = localFiles.map((f) => ({
            asset_id: f.replace(/\W+/g, "_"),
            secure_url: f,
            public_id: f.replace(/^\//, ""),
            created_at: new Date().toISOString(),
            width: 1200,
            height: 800,
          }));

          setImages(localImages);
        }
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
        <h2 className="mb-3 text-3xl font-bold text-[#DA291C] sm:text-4xl">Gallery</h2>
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
