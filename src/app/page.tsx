'use client';

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useEffect } from "react";
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
import WelcomeBanner from "@/components/home/WelcomeBanner";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.099 4.388 23.094 10.125 24v-8.438h-3.04v-3.49h3.04V9.413c0-3.01 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.98h-1.513c-1.49 0-1.953.93-1.953 1.887v2.28h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.099 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const idempotencyKeyRef = useRef<string | null>(null);

  const closeBanner = useCallback(() => {
    setShowBanner(false);
  }, []);

  useEffect(() => {
    if (!showBanner) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showBanner]);

  useEffect(() => {
    idempotencyKeyRef.current = null;
  }, [cart, customerName, customerEmail, customerPhone, pickupTime]);

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
    if (isSubmittingOrder) {
      return;
    }

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

    const idempotencyKey =
      idempotencyKeyRef.current ??
      (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    idempotencyKeyRef.current = idempotencyKey;

    setIsSubmittingOrder(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey,
        },
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
        if (res.status === 429) {
          const retryAfter = res.headers.get("Retry-After");
          alert(
            `Too many attempts. Please wait${retryAfter ? ` ${retryAfter} seconds` : ""} and try again.`
          );
          return;
        }

        if (res.status === 409) {
          alert(error.error ?? "Duplicate order request detected. Please wait a moment and try again.");
          return;
        }

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
      idempotencyKeyRef.current = null;
      router.push(`/orders/${createdOrder.id}`);
    } catch (error) {
      console.error("Order submission error:", error);
      alert("Failed to place order. Please check your internet connection and try again.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-poppins scroll-smooth">
      <WelcomeBanner
        isVisible={showBanner}
        onClose={closeBanner}
      />
      
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
            <h3 className="text-2xl font-bold text-red-400 mb-4">MR SANGA&apos;S</h3>
            <p className="text-gray-400">Best sandwiches in town</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-red-400 mb-4">Follow Us</h4>
            <div className="flex gap-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="group rounded-full border border-white/10 bg-white/5 p-3 text-gray-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#da291c]/40 hover:bg-[#da291c]/10 hover:text-[#da291c]"
              >
                <FacebookIcon className="h-7 w-7" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="group rounded-full border border-white/10 bg-white/5 p-3 text-gray-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#da291c]/40 hover:bg-[#da291c]/10 hover:text-[#da291c]"
              >
                <InstagramIcon className="h-7 w-7" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-red-400 mb-4">Contact</h4>
            <p className="text-gray-400">Brisbane, Australia</p>
            <p className="text-gray-400">+61 123 456 789</p>
          </div>
        </div>
      </footer>

      <button
        className="fixed bottom-3 right-3 z-40 rounded-full bg-red-400 p-3 text-black shadow-lg transition-colors hover:bg-red-500 sm:bottom-4 sm:right-4 sm:p-4"
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
        isSubmitting={isSubmittingOrder}
        updateQuantity={updateQuantity}
      />
    </div>
  );
}
