'use client';

import { useState, useEffect } from 'react';
import { Clock3, MapPin, Star, UtensilsCrossed, X } from 'lucide-react';

interface WelcomeBannerProps {
  onClose: () => void;
  isVisible: boolean;
}

export default function WelcomeBanner({ onClose, isVisible }: WelcomeBannerProps) {
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(5);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        return prev <= 1 ? 0 : prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && timeLeft === 0) {
      const closeTimer = window.setTimeout(onClose, 0);
      return () => window.clearTimeout(closeTimer);
    }

    return undefined;
  }, [isVisible, timeLeft, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] h-dvh overflow-hidden bg-[#0f0c08]">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,12,8,0.42), rgba(15,12,8,0.72)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(218,41,28,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(218,41,28,0.14),transparent_28%)]" />

      <div className="relative flex h-full items-center justify-center px-4 py-4 sm:px-6">
        <div className="relative w-full max-w-[440px] text-center">
          <div className="mx-auto mb-0 h-20 w-px bg-gradient-to-b from-transparent via-[#DA291C] to-[#DA291C]" />
          <div className="mx-auto mb-[-10px] h-4 w-4 rounded-full border border-[#DA291C] bg-[#DA291C] shadow-[0_0_18px_rgba(218,41,28,0.55)]" />

          <div className="relative max-h-[calc(100dvh-2rem)] overflow-hidden rounded-[28px] border border-white/10 bg-[#12100d]/95 px-6 py-7 text-white shadow-[0_25px_80px_rgba(0,0,0,0.55)] sm:px-8 sm:py-8">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Close banner"
              title="Close banner"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DA291C]/25 bg-[#DA291C]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#DA291C]">
              Opening Soon
            </div>

            <div className="space-y-2">
              <div className="text-4xl font-black tracking-[0.18em] text-[#DA291C] sm:text-5xl">
                MR SANGA&apos;S
              </div>
              <p className="text-sm uppercase tracking-[0.42em] text-white/65">
                Best sandwiches in town
              </p>
            </div>

            <div className="my-6 flex items-center justify-center gap-3 text-[#DA291C]">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#DA291C]/60" />
              <UtensilsCrossed className="h-5 w-5" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#DA291C]/60" />
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-semibold tracking-[0.32em] text-white/92 sm:text-3xl">
                Comming 
              </div>
              <div className="text-5xl font-black leading-none tracking-[0.14em] text-[#DA291C] sm:text-6xl">
                Soon
              </div>
            </div>

            <div className="mt-6 space-y-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-4 text-left text-sm text-white/80 sm:px-5">
              <div className="flex items-start gap-3">
                <Star className="mt-0.5 h-4 w-4 shrink-0 text-[#DA291C]" />
                <p>Freshly prepared sandwiches and comfort food made for every craving.</p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#DA291C]" />
                <p>Brisbane, Australia</p>
              </div>
              <div className="flex items-start gap-3">
             <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full text-sm text-[#DA291C] text-center transition"
              >
                Continue to Site
              </button>
              </div>
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/45">
              Stay tuned for more flavors
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
