'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CartItem, MenuItem } from "@/components/home/types";
import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import MenuSection from "@/components/home/MenuSection";
import GallerySection from "@/components/home/GallerySection";
import AboutSection from "@/components/home/AboutSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import LocationSection from "@/components/home/LocationSection";
import ContactSection from "@/components/home/ContactSection";
import OrderModal from "@/components/home/OrderModal";

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.menuItem.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.menuItem.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((entry) => entry.menuItem.id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((entry) =>
        entry.menuItem.id === id ? { ...entry, quantity } : entry
      )
    );
  };

  const submitOrder = async () => {
    if (!customerName || !customerEmail || !pickupTime || cart.length === 0) {
      alert("Please fill in all required fields, provide your email, and add items to cart.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    const pickupDate = new Date(pickupTime);
    if (pickupDate.getTime() < Date.now() + 10 * 60 * 1000) {
      alert("Pickup time must be at least 10 minutes from now.");
      return;
    }

    const items = cart.map((entry) => ({
      menuItemId: entry.menuItem.id,
      quantity: entry.quantity,
    }));

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          pickupTime,
          items,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Failed to place order: ${error.error}`);
        return;
      }

      const createdOrder = await res.json();
      setIsModalOpen(false);
      setCart([]);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setPickupTime("");
      router.push(`/orders/${createdOrder.id}`);
    } catch (error) {
      console.error("Order submission error:", error);
      alert("Failed to place order. Please check your internet connection and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-poppins scroll-smooth">
      <Navbar
        cartCount={cart.length}
        onOrderClick={() => setIsModalOpen(true)}
      />

      <main className="w-full">
        <HeroSection
          onOrderNow={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
        />

        <MenuSection onAddToCart={addToCart} />
        <GallerySection />
        <AboutSection />
        <TestimonialsSection />
        <LocationSection />
        <ContactSection />
      </main>

      <footer className="bg-gray-900 px-4 py-14 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-4">MR SANGA'S</h3>
            <p className="text-gray-400">Best sandwiches in town</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-yellow-400 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-white transition-colors">
                  Menu
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition-colors">
                  Gallery
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-white transition-colors">
                  Reviews
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-white transition-colors">
                  Location
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/orders" className="hover:text-white transition-colors">
                  My Orders
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-yellow-400 mb-4">Contact</h4>
            <p className="text-gray-400">Brisbane, Australia</p>
            <p className="text-gray-400">+61 123 456 789</p>
          </div>
        </div>
      </footer>

      <button
        className="fixed bottom-3 right-3 z-40 rounded-full bg-yellow-400 p-3 text-black shadow-lg transition-colors hover:bg-yellow-500 sm:bottom-4 sm:right-4 sm:p-4"
        onClick={() => setIsModalOpen(true)}
      >
        Cart ({cart.length})
      </button>

      <OrderModal
        isOpen={isModalOpen}
        cart={cart}
        customerName={customerName}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        pickupTime={pickupTime}
        onClose={() => setIsModalOpen(false)}
        onChangeCustomerName={setCustomerName}
        onChangeCustomerEmail={setCustomerEmail}
        onChangeCustomerPhone={setCustomerPhone}
        onChangePickupTime={setPickupTime}
        onSubmit={submitOrder}
        updateQuantity={updateQuantity}
      />
    </div>
  );
}
