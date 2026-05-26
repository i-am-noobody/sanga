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
  const description =
    item.description?.trim() || "Freshly prepared with quality ingredients and bold flavor.";

  return (
    <article
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))] shadow-[0_16px_40px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-red-300/40 hover:shadow-[0_22px_50px_rgba(218,41,28,0.18)]"
      onMouseEnter={() => onHoverStart?.(item)}
      onMouseLeave={onHoverEnd}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-300 via-red-200 to-red-300 opacity-80" />

      <div className="space-y-5 p-6 text-left sm:p-7">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="mt-2 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-red-300 shadow-[0_0_0_6px_rgba(218,41,28,0.12)]" />
            <div className="min-w-0 flex-1">
              <div className="flex items-end gap-3">
                <h3 className="shrink-0 text-[1.05rem] font-semibold leading-snug text-slate-50 sm:text-[1.15rem]">
                  {item.name}
                </h3>
                <span
                  aria-hidden="true"
                  className="mb-1 h-px min-w-0 flex-1 border-b border-dotted border-white/25"
                />
                <span className="shrink-0 whitespace-nowrap text-base font-medium text-slate-300 sm:text-lg">
                {item.price} $
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-red-300/30 bg-red-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-200">
                  {item.category}
                </span>
                {item.subcategory ? (
                  <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    {item.subcategory}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <p className="pl-5 text-sm leading-6 text-slate-300/85 sm:text-[0.95rem]">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onAddToCart(item)}
          className="inline-flex w-full items-center justify-center rounded-full border border-red-300/60 bg-[#DA291C] px-4 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-red-200 hover:shadow-[0_10px_24px_rgba(218,41,28,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Add To Cart
        </button>
      </div>
    </article>
  );
}
