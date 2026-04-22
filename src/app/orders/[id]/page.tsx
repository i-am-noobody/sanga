import { notFound } from "next/navigation";
import Link from "next/link";
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
    <main className="min-h-screen bg-black px-4 py-16 font-poppins text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/orders"
          className="inline-flex items-center rounded-full border border-yellow-300/40 px-5 py-2 text-sm font-semibold text-yellow-200 transition hover:border-yellow-300/70 hover:text-yellow-100"
        >
          Back to Order Lookup
        </Link>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-yellow-400/80">Order Details</p>
              <h1 className="mt-2 text-4xl font-bold text-white">Order #{order.id}</h1>
              <p className="mt-2 text-gray-400">Placed {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <span className="inline-flex rounded-full border border-yellow-300/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-200">
              {order.status}
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <p className="text-sm text-gray-400">Pickup time</p>
              <p className="mt-2 text-white">{new Date(order.pickupTime).toLocaleString()}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <p className="text-sm text-gray-400">Items</p>
              <p className="mt-2 text-2xl font-semibold text-white">{order.items.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <p className="text-sm text-gray-400">Order total</p>
              <p className="mt-2 text-2xl font-semibold text-white">Rs {order.totalPrice.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Items</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                  <div>
                    <p className="font-medium text-white">{item.menuItem.name}</p>
                    <p className="text-sm text-gray-400">Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-white">Rs {item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5">
            <h2 className="text-base font-semibold text-white">Customer</h2>
            <p className="mt-2 text-sm text-gray-200">{order.customerName}</p>
            {order.customerEmail ? <p className="text-sm text-gray-300">{order.customerEmail}</p> : null}
            {order.customerPhone ? <p className="text-sm text-gray-300">{order.customerPhone}</p> : null}
          </div>

          <div className="mt-6 rounded-3xl border border-yellow-300/30 bg-yellow-400/5 p-5 text-yellow-200">
            <p className="text-sm">Keep this page bookmarked to check status updates anytime.</p>
            <p className="mt-2 text-sm text-gray-300">Need another order? Go back to order lookup and search with your email.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
