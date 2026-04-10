import { notFound } from "next/navigation";
import { prisma } from "../../lib/prisma";

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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (Number.isNaN(orderId)) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white font-poppins px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-yellow-400/80">Order Confirmation</p>
              <h1 className="mt-3 text-4xl font-bold text-white">Order #{order.id}</h1>
              <p className="mt-2 text-gray-400">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <span className="inline-flex rounded-full border border-yellow-300/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-200">
              {order.status}
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <p className="text-sm text-gray-400">Customer</p>
              <p className="mt-2 text-white">{order.customerName}</p>
              {order.customerEmail ? <p className="text-sm text-gray-300">{order.customerEmail}</p> : null}
              {order.customerPhone ? <p className="text-sm text-gray-300">{order.customerPhone}</p> : null}
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <p className="text-sm text-gray-400">Pickup time</p>
              <p className="mt-2 text-white">{new Date(order.pickupTime).toLocaleString()}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <p className="text-sm text-gray-400">Order total</p>
              <p className="mt-2 text-2xl font-semibold text-white">Rs {order.totalPrice.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Items</h2>
            <div className="mt-4 space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-3xl bg-slate-950/80 p-4">
                  <div>
                    <p className="font-medium text-white">{item.menuItem.name}</p>
                    <p className="text-sm text-gray-400">Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-white">Rs {item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-yellow-300/30 bg-yellow-400/5 p-5 text-yellow-200">
            <p className="text-sm">Keep this link to check your status anytime.</p>
            <p className="mt-2 text-sm text-gray-300">You can also go back to <a href="/orders" className="text-white underline">order tracking</a> to find other orders by email.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
