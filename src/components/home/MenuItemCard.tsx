import type { MenuItem } from "./types";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onHoverStart?: (item: MenuItem) => void;
  onHoverEnd?: () => void;
}

export default function MenuItemCard({
  item,
  onAddToCart,
  onHoverStart,
  onHoverEnd,
}: MenuItemCardProps) {
  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_10px_30px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-yellow-300/40 hover:shadow-[0_18px_40px_rgba(250,204,21,0.2)]"
      onMouseEnter={() => onHoverStart?.(item)}
      onMouseLeave={onHoverEnd}
    >
      <div className="relative h-56 overflow-hidden sm:h-52">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border border-yellow-300/40 bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-300 backdrop-blur-sm">
          {item.category}
        </span>
        {item.subcategory ? (
          <span className="absolute left-3 top-12 rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-100 backdrop-blur-sm">
            {item.subcategory}
          </span>
        ) : null}
        <span className="absolute bottom-3 right-3 rounded-full bg-yellow-300 px-3 py-1 text-sm font-bold text-slate-900 shadow-lg">
          Rs {item.price}
        </span>
      </div>

      <div className="space-y-4 p-5 text-left">
        <h3 className="line-clamp-1 text-lg font-semibold text-slate-100">{item.name}</h3>
        <p className="min-h-[3rem] text-sm leading-relaxed text-slate-300/85">
          {item.description?.trim() || "Freshly prepared with quality ingredients and bold flavor."}
        </p>
        <button
          type="button"
          onClick={() => onAddToCart(item)}
          className="w-full rounded-xl border border-yellow-300 bg-yellow-300/95 px-4 py-2.5 font-semibold text-slate-950 transition-all duration-200 hover:bg-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Add To Cart
        </button>
      </div>
    </article>
  );
}
