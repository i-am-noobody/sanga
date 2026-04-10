"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { MenuItem } from "./types";
import MenuItemCard from "./MenuItemCard";

interface MenuSectionProps {
  onAddToCart: (item: MenuItem) => void;
}

export default function MenuSection({ onAddToCart }: MenuSectionProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const res = await fetch("/api/menu", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setMenuItems(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to load menu:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadMenu();
  }, []);

  return (
    <motion.section
      id="menu"
      className="py-20 px-4 sm:px-6 md:px-8 text-center"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <h2 className="text-4xl font-bold text-yellow-400 mb-12">Our Menu</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {loading ? (
          <p className="text-gray-400">Loading menu...</p>
        ) : menuItems.length === 0 ? (
          <p className="text-gray-400">No menu items available yet.</p>
        ) : (
          menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <MenuItemCard item={item} onAddToCart={onAddToCart} />
            </motion.div>
          ))
        )}
      </div>
    </motion.section>
  );
}
