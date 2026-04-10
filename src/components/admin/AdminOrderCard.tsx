interface OrderItem {
  id: number;
  menuItemId: number;
  quantity: number;
  price: number;
  menuItem: {
    id: number;
    name: string;
    price: number;
  };
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  pickupTime?: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface Props {
  orders: Order[];
  loading: boolean;
  onStatusChange: (orderId: number, status: string) => void;
}

export default function AdminOrderCard({ orders, loading, onStatusChange }: Props) {
  const statusColors = {
    PENDING: "bg-yellow-500/10 text-yellow-200 border-yellow-500/20",
    RECEIVED: "bg-yellow-400/10 text-yellow-200 border-yellow-400/20",
    APPROVED: "bg-green-500/10 text-green-200 border-green-500/20",
    COMPLETED: "bg-slate-700/10 text-slate-200 border-slate-700/20",
    CANCELLED: "bg-red-500/10 text-red-200 border-red-500/20",
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    if (loading) return;
    onStatusChange(orderId, newStatus);
  };

  return (
    <div className="rounded-[2rem] border border-yellow-300/20 bg-[#070707]/95 p-8 shadow-[0_24px_80px_-50px_rgba(255,214,0,0.35)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-yellow-300/70">Order management</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Orders queue</h2>
        </div>
        <span className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-yellow-200">
          {orders.length} total
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-yellow-300/30 bg-white/5 p-8 text-center text-slate-400">
            No orders yet. Orders will appear here when customers place them.
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="rounded-3xl border border-yellow-300/20 bg-[#0b0b0b]/90 p-6 transition hover:-translate-y-1 hover:border-yellow-300/40">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-semibold text-white">Order #{order.id}</p>
                    <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${statusColors[order.status as keyof typeof statusColors] || "bg-gray-500/10 text-gray-200 border-gray-500/20"}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="grid gap-1 text-sm text-slate-300 sm:grid-cols-3">
                    <p>{order.customerName}</p>
                    {order.customerEmail && <p>{order.customerEmail}</p>}
                    {order.customerPhone && <p>{order.customerPhone}</p>}
                  </div>
                  <div className="grid gap-2 rounded-3xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300">
                    {order.items.map((item) => (
                      <p key={item.id} className="text-white">
                        {item.quantity}x {item.menuItem.name} — ${item.price.toFixed(2)}
                      </p>
                    ))}
                  </div>
                  <p className="text-lg font-semibold text-yellow-200">Total: ${order.totalPrice.toFixed(2)}</p>
                  {order.pickupTime ? (
                    <p className="text-sm text-slate-300">
                      Pickup: {new Date(order.pickupTime).toLocaleString()}
                    </p>
                  ) : null}
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 xl:flex-col xl:items-end">
                  {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                    <>
                      {order.status === "PENDING" && (
                        <button
                          onClick={() => handleStatusChange(order.id, "RECEIVED")}
                          disabled={loading}
                          className="rounded-full bg-yellow-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-yellow-300 disabled:opacity-50"
                        >
                          Mark Received
                        </button>
                      )}
                      {order.status === "RECEIVED" && (
                        <button
                          onClick={() => handleStatusChange(order.id, "APPROVED")}
                          disabled={loading}
                          className="rounded-full bg-green-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-green-400 disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {order.status === "APPROVED" && (
                        <button
                          onClick={() => handleStatusChange(order.id, "COMPLETED")}
                          disabled={loading}
                          className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/20 disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusChange(order.id, "CANCELLED")}
                        disabled={loading}
                        className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-red-400 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
