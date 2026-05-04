"use client";

import { useState } from "react";
import type { MouseEventHandler } from "react";
import Image from "next/image";

interface NavbarProps {
  cartCount: number;
  onOrderClick: MouseEventHandler<HTMLButtonElement>;
}

export default function Navbar({ cartCount, onOrderClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [
    { href: "#menu", label: "Menu" },
    { href: "#about", label: "About Us" },
    { href: "#location", label: "Location" },
    { href: "#contact", label: "Contact Us" },
  ];

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <a
          href="#top"
          className="group inline-flex items-center rounded-full px-2 py-1.5 transition duration-300 hover:bg-white/5"
          aria-label="Go to top"
        >
          <Image
            src="/logo_final.png"
            alt="Sanga logo"
            width={200}
            height={70}
            className="h-11 w-auto transition duration-300 sm:h-12 group-hover:scale-[1.03] group-hover:drop-shadow-[0_0_18px_rgba(218,41,28,0.45)]"
            priority
          />
        </a>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-red-300/45 hover:bg-red-300/10 hover:text-red-200 md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
          </div>
        </button>

        <ul className="hidden list-none items-center gap-2 text-sm font-medium tracking-wide lg:gap-3 lg:text-base md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="group relative inline-flex items-center rounded-full px-4 py-2.5 text-white/85 transition duration-300 hover:bg-white/8 hover:text-[#da291c]"
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute bottom-1.5 left-4 right-4 h-px origin-left scale-x-0 bg-[#da291c]/90 transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="hidden rounded-full bg-[#da291c] px-5 py-2.5 font-semibold text-black shadow-[0_10px_25px_rgba(218,41,28,0.18)] transition-all hover:translate-y-[-1px] hover:bg-[#e13a2d] md:inline-flex"
          onClick={onOrderClick}
        >
          Cart ({cartCount})
        </button>
      </div>

      {isOpen ? (
        <div id="mobile-nav" className="border-t border-white/10 bg-black/90 px-4 pb-4 pt-2 md:hidden">
          <ul className="mb-4 space-y-3 text-base font-medium">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="group block rounded-xl border border-transparent px-3 py-2.5 text-white/90 transition duration-300 hover:border-[#da291c]/40 hover:bg-[#da291c]/10 hover:text-[#da291c]"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    {link.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="w-full rounded-full bg-[#da291c] px-5 py-2.5 font-semibold text-black transition-all hover:bg-[#e13a2d]"
            onClick={(event) => {
              onOrderClick(event);
              setIsOpen(false);
            }}
          >
            Cart ({cartCount})
          </button>
        </div>
      ) : null}
    </nav>
  );
}
