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
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubcategory, setActiveSubcategory] = useState("All");

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const res = await fetch("/api/menu", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Unable to fetch menu");
        }

        const data = await res.json();
        setMenuItems(Array.isArray(data) ? data : []);
        setError(null);
      } catch (error) {
        console.error("Failed to load menu:", error);
        setError("We are refreshing the kitchen menu. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    };

    void loadMenu();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(menuItems.map((item) => item.category?.trim()).filter(Boolean))),
  ];

  const categoryFilteredItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category?.trim() === activeCategory);

  const subcategories = [
    "All",
    ...Array.from(
      new Set(
        categoryFilteredItems
          .map((item) => item.subcategory?.trim())
          .filter((subcategory): subcategory is string => Boolean(subcategory))
      )
    ),
  ];

  const filteredItems =
    activeSubcategory === "All"
      ? categoryFilteredItems
      : categoryFilteredItems.filter((item) => item.subcategory?.trim() === activeSubcategory);

  return (
    <motion.section
      id="menu"
      className="scroll-mt-24 px-4 py-20 text-center sm:px-6 md:px-8"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto mb-10 max-w-6xl">
        <h2 className="mb-3 text-4xl font-bold text-yellow-300">Our Menu</h2>
        <p className="mx-auto mb-8 max-w-2xl text-sm text-slate-300/80 sm:text-base">
          Crafted daily and served fresh. Filter by category to quickly find what you are craving.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setActiveCategory(category);
                setActiveSubcategory("All");
              }}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all sm:text-sm ${
                activeCategory === category
                  ? "border-yellow-300 bg-yellow-300 text-slate-950 shadow-[0_8px_18px_rgba(250,204,21,0.35)]"
                  : "border-white/15 bg-white/5 text-slate-200 hover:border-yellow-300/45 hover:text-yellow-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {activeCategory !== "All" && subcategories.length > 1 ? (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {subcategories.map((subcategory) => (
              <button
                key={subcategory}
                type="button"
                onClick={() => setActiveSubcategory(subcategory)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-all sm:text-xs ${
                  activeSubcategory === subcategory
                    ? "border-yellow-300/60 bg-yellow-300/20 text-yellow-100"
                    : "border-white/15 bg-white/5 text-slate-300 hover:border-yellow-300/45 hover:text-yellow-200"
                }`}
              >
                {subcategory}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-8 text-slate-300/90">
            Loading menu...
          </p>
        ) : error ? (
          <p className="col-span-full rounded-2xl border border-rose-300/35 bg-rose-950/35 p-8 text-rose-100">
            {error}
          </p>
        ) : menuItems.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-8 text-slate-300/90">
            No menu items available yet.
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-8 text-slate-300/90">
            No items found in this category.
          </p>
        ) : (
          filteredItems.map((item, index) => (
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
