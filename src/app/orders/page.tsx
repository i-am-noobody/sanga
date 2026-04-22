"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  menuItem: {
    name: string;
  };
}

interface Order {
  id: number;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  pickupTime: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setOrders([]);

    if (!email.trim()) {
      setMessage("Please enter the email used for your order.");
      return;
    }

    setLoading(true);
    try {
      const query = new URLSearchParams({ email: email.trim() });
      if (phone.trim()) {
        query.set("phone", phone.trim());
      }
      const res = await fetch(`/api/orders?${query.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || "Unable to fetch your orders.");
        return;
      }

      const data: Order[] = await res.json();
      setOrders(data);
      if (data.length === 0) {
        setMessage("No orders found for this email.");
      }
    } catch (error) {
      console.error("Order lookup error:", error);
      setMessage("Unable to fetch orders right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-poppins">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(249,204,74,0.08),_transparent_35%)] px-4 py-24 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-400/80">Order Tracking</p>
            <h1 className="mt-4 text-4xl font-bold sm:text-5xl">See your orders and current status</h1>
            <p className="mt-4 text-gray-300 sm:text-lg">
              Enter the email address used when placing your order to view all your orders and their details. If you just placed an order, check your email for a direct link to view it immediately.
            </p>
          </div>

          <form onSubmit={handleSearch} className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20 sm:grid-cols-[1.5fr_1fr] sm:p-8">
            <div className="space-y-4">
              <label className="block text-sm text-gray-300">
                Email used for order
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block text-sm text-gray-300">
                Phone (optional)
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                  placeholder="+61 4XX XXX XXX"
                />
              </label>
            </div>
            <div className="flex flex-col justify-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-14 items-center justify-center rounded-full bg-yellow-400 px-6 font-semibold text-black transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Searching orders..." : "Find my orders"}
              </button>
              <p className="text-sm text-gray-400">
                Use the same email the order was placed with. If you want tighter matching, provide the phone number too.
              </p>
            </div>
          </form>

          <div className="mt-12 space-y-6">
            {message ? <p className="rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-sm text-yellow-200">{message}</p> : null}

            {orders.length > 0 && (
              <div className="space-y-6">
                <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
                  Found {orders.length} order{orders.length === 1 ? "" : "s"}. Choose an order below to see full details.
                </p>
                {orders.map((order) => (
                  <article key={order.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-lg shadow-black/20">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Order #{order.id}</p>
                        <h2 className="mt-1 text-2xl font-semibold text-white">{order.customerName}</h2>
                        <p className="text-sm text-gray-400">Placed {new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="space-y-2 sm:text-right">
                        <p className="text-sm text-gray-400">Status</p>
                        <span className="inline-flex rounded-full border border-yellow-300/30 bg-yellow-400/10 px-3 py-1 text-sm font-semibold text-yellow-200">
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
                        <p className="text-sm text-gray-400">Pickup</p>
                        <p className="text-sm text-white">{new Date(order.pickupTime).toLocaleString()}</p>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
                        <p className="text-sm text-gray-400">Total</p>
                        <p className="text-xl font-semibold text-white">Rs {order.totalPrice.toFixed(2)}</p>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
                        <p className="text-sm text-gray-400">Items</p>
                        <p className="text-xl font-semibold text-white">{order.items.length}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-gray-300">Open full order details for line items and contact information.</p>
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center justify-center rounded-full border border-yellow-300/40 bg-yellow-300/10 px-6 py-3 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-300/20"
                      >
                        View Order Details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
