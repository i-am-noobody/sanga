import type { MenuItem } from "./types";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden hover:-translate-y-2 transition-transform duration-300">
      <img src={item.imageUrl} alt={item.name} className="w-full h-64 sm:h-56 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">
          {item.name} <span className="text-yellow-400">Rs {item.price}</span>
        </h3>
        <p className="text-sm text-gray-400 mb-4 min-h-[3rem]">{item.description}</p>
        <button
          type="button"
          onClick={() => onAddToCart(item)}
          className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
        >
          Order
        </button>
      </div>
    </div>
  );
}
