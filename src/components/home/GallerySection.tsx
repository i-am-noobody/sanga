"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { GalleryImage } from "./types";

export default function GallerySection() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const res = await fetch("/api/gallery", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Unable to load gallery images");
        }

        const payload = await res.json();
        setImages(Array.isArray(payload.data) ? payload.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load gallery images.");
      } finally {
        setLoading(false);
      }
    };

    void loadGallery();
  }, []);

  return (
    <motion.section
      className="py-20 px-4 sm:px-6 md:px-8 text-center"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <h2 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-10">Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {loading ? (
          <p className="text-gray-400">Loading gallery...</p>
        ) : error ? (
          <p className="text-gray-400">{error}</p>
        ) : images.length === 0 ? (
          <p className="text-gray-400">No images available at the moment.</p>
        ) : (
          images.map((image, index) => (
            <motion.div
              key={image.asset_id}
              className="overflow-hidden rounded-lg hover:scale-105 transition-transform duration-300"
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
