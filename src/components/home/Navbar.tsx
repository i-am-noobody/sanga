import type { MouseEventHandler } from "react";

interface NavbarProps {
  cartCount: number;
  onOrderClick: MouseEventHandler<HTMLButtonElement>;
}

export default function Navbar({ cartCount, onOrderClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 w-full flex flex-wrap items-center justify-between gap-4 px-4 py-4 bg-black/90 z-50">
      <div className="text-yellow-400">
        <span className="text-xl font-bold tracking-tight">Sanga</span>
      </div>
      <ul className="flex flex-wrap justify-center gap-3 sm:gap-6 list-none text-sm">
        <li>
          <a href="#menu" className="text-white hover:text-yellow-400 transition-colors">
            Menu
          </a>
        </li>
        <li>
          <a href="/orders" className="text-white hover:text-yellow-400 transition-colors">
            My Orders
          </a>
        </li>
        <li>
          <a href="#location" className="text-white hover:text-yellow-400 transition-colors">
            Location
          </a>
        </li>
        <li>
          <a href="#contact" className="text-white hover:text-yellow-400 transition-colors">
            Contact
          </a>
        </li>
      </ul>
      <button
        type="button"
        className="bg-yellow-400 text-black px-5 py-2 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
        onClick={onOrderClick}
      >
        Cart ({cartCount})
      </button>
    </nav>
  );
}
