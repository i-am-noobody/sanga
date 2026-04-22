import type { FormEvent } from "react";
import type { MenuItem } from "./types";

interface OrderItem {
  menuItemId: number;
  quantity: number;
}

interface Props {
  menuItems: MenuItem[];
  loading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  form: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    pickupTime: string;
    items: OrderItem[];
  };
  onFormChange: (updated: Partial<Props["form"]>) => void;
  onAddItem: (menuItemId: number) => void;
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
}

export default function AdminCreateOrderCard({
  menuItems,
  loading,
  onSubmit,
  form,
  onFormChange,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
}: Props) {
  const calculateTotal = () => {
    return form.items.reduce((total, item) => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      return total + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0);
  };

  return (
    <div className="rounded-[2rem] border border-yellow-300/20 bg-[#070707]/95 p-4 shadow-[0_24px_80px_-50px_rgba(255,214,0,0.35)] sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-yellow-300/70">Create new order</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Order builder</h2>
        </div>
        <span className="rounded-full border border-yellow-300/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
          Manual entry
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">
        Build orders manually with a clean interface designed for fast staff use.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <input
            value={form.customerName}
            onChange={(event) => onFormChange({ customerName: event.target.value })}
            placeholder="Customer name"
            required
            className="w-full rounded-3xl border border-yellow-300/20 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-300"
          />
          <input
            value={form.customerEmail}
            onChange={(event) => onFormChange({ customerEmail: event.target.value })}
            placeholder="Email (optional)"
            type="email"
            className="w-full rounded-3xl border border-yellow-300/20 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-300"
          />
          <input
            value={form.customerPhone}
            onChange={(event) => onFormChange({ customerPhone: event.target.value })}
            placeholder="Phone (optional)"
            className="w-full rounded-3xl border border-yellow-300/20 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-300"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">
            Pickup time
            <input
              type="datetime-local"
              value={form.pickupTime}
              onChange={(event) => onFormChange({ pickupTime: event.target.value })}
              required
              className="mt-3 w-full rounded-3xl border border-yellow-300/20 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-300"
            />
          </label>
          <div className="flex items-end">
            <p className="text-sm text-slate-400">Choose the pickup date and time for this order.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-300">Order items</p>
            <select
              onChange={(event) => {
                const menuItemId = parseInt(event.target.value);
                if (menuItemId) onAddItem(menuItemId);
                event.target.value = "";
              }}
              className="rounded-3xl border border-yellow-300/20 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-yellow-300"
            >
              <option value="">Add menu item</option>
              {menuItems.filter(item => item.isAvailable).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - ${item.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {form.items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-yellow-300/30 bg-white/5 p-4 text-center text-slate-400">
              No items added yet. Select items from the dropdown above.
            </div>
          ) : (
            <div className="space-y-3">
              {form.items.map((item, index) => {
                const menuItem = menuItems.find(m => m.id === item.menuItemId);
                return (
                  <div key={index} className="flex flex-col gap-3 rounded-3xl border border-yellow-300/20 bg-[#0b0b0b]/90 p-4 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{menuItem?.name}</p>
                      <p className="mt-1 text-xs text-slate-400">${menuItem?.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) => onUpdateQuantity(index, parseInt(event.target.value) || 1)}
                        className="w-20 rounded-3xl border border-yellow-300/20 bg-white/5 px-3 py-2 text-center text-sm text-white outline-none transition focus:border-yellow-300"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveItem(index)}
                        className="rounded-full bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.22em] text-yellow-200 transition hover:bg-yellow-400/15"
                      >
                        remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {form.items.length > 0 && (
            <div className="rounded-3xl border border-yellow-300/20 bg-yellow-400/5 p-4">
              <p className="text-lg font-semibold text-yellow-200">Total: ${calculateTotal().toFixed(2)}</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || form.items.length === 0}
          className="inline-flex w-full items-center justify-center rounded-full bg-yellow-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating order..." : "Create order"}
        </button>
      </form>
    </div>
  );
}
