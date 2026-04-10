"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import AdminMenuCard from "./AdminMenuCard";
import AdminUploadCard from "./AdminUploadCard";
import AdminPreviewPanel from "./AdminPreviewPanel";
import AdminOrderCard from "./AdminOrderCard";
import AdminCreateOrderCard from "./AdminCreateOrderCard";
import type { MenuItem, UploadImage } from "./types";

interface Order {
  id: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  status: string;
  totalPrice: number;
  createdAt: string;
  items: {
    id: number;
    menuItemId: number;
    quantity: number;
    price: number;
    menuItem: {
      id: number;
      name: string;
      price: number;
    };
  }[];
}

interface OrderForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupTime: string;
  items: { menuItemId: number; quantity: number }[];
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [uploads, setUploads] = useState<UploadImage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    category: "main",
    price: "",
    description: "",
  });
  const [menuImageFile, setMenuImageFile] = useState<File | null>(null);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    pickupTime: "",
    items: [],
  });
  const [status, setStatus] = useState("Admin dashboard loaded. Ready to manage content.");

  useEffect(() => {
    void loadMenu();
    void loadUploads();
    void loadOrders();
  }, []);

  async function loadMenu() {
    try {
      const res = await fetch("/api/menu", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMenuItems(data);
      }
    } catch (error) {
      console.error("Unable to load menu items", error);
    }
  }

  async function loadUploads() {
    try {
      const res = await fetch("/api/upload", { method: "GET" });
      if (res.ok) {
        const payload = await res.json();
        setUploads(payload.data ?? []);
      }
    } catch (error) {
      console.error("Unable to load uploads", error);
    }
  }

  async function loadOrders() {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      }
    } catch (error) {
      console.error("Unable to load orders", error);
    }
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setImageFile(event.target.files?.[0] ?? null);
  }

  async function handleMenuFileChange(event: ChangeEvent<HTMLInputElement>) {
    setMenuImageFile(event.target.files?.[0] ?? null);
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!imageFile) {
      setMessage("Select an image before uploading.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await res.json();

      if (res.ok) {
        setMessage("Upload completed successfully.");
        setImageFile(null);
        await loadUploads();
      } else {
        setMessage(payload.error ?? "Upload failed.");
      }
    } catch (error) {
      console.error("Upload error", error);
      setMessage("Upload service unavailable.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMenuSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let imageUrl = "";

      if (menuImageFile) {
        const formData = new FormData();
        formData.append("file", menuImageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadPayload = await uploadRes.json();
          imageUrl = uploadPayload.data?.secure_url || "";
          
          if (!imageUrl) {
            setMessage("Failed to get image URL from upload.");
            return;
          }
        } else {
          setMessage("Failed to upload image.");
          return;
        }
      }

      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: menuForm.name,
          price: Number(menuForm.price),
          imageUrl,
          category: menuForm.category,
          description: menuForm.description,
        }),
      });

      const payload = await res.json();
      if (res.ok) {
        setMessage("Menu item added successfully.");
        setMenuForm({ name: "", category: "main", price: "", description: "" });
        setMenuImageFile(null);
        await loadMenu();
      } else {
        setMessage(payload.error ?? "Unable to add menu item.");
      }
    } catch (error) {
      console.error("Menu create error", error);
      setMessage("Server error while adding menu item.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOrderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderForm),
      });

      const payload = await res.json();
      if (res.ok) {
        setMessage("Order created successfully.");
        setOrderForm({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          pickupTime: "",
          items: [],
        });
        await loadOrders();
      } else {
        setMessage(payload.error ?? "Unable to create order.");
      }
    } catch (error) {
      console.error("Order create error", error);
      setMessage("Server error while creating order.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOrderStatusUpdate(orderId: number, status: Order["status"]) {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setMessage(`Order status updated to ${status}.`);
        await loadOrders();
      } else {
        const payload = await res.json();
        setMessage(payload.error ?? "Unable to update order status.");
      }
    } catch (error) {
      console.error("Order status update error", error);
      setMessage("Server error while updating order status.");
    } finally {
      setLoading(false);
    }
  }

  function handleAddOrderItem(menuItemId: number) {
    const existingItem = orderForm.items.find(item => item.menuItemId === menuItemId);
    if (existingItem) {
      setOrderForm((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity: item.quantity + 1 } : item
        ),
      }));
    } else {
      setOrderForm((prev) => ({
        ...prev,
        items: [...prev.items, { menuItemId, quantity: 1 }],
      }));
    }
  }

  function handleRemoveOrderItem(index: number) {
    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function handleUpdateOrderQuantity(index: number, quantity: number) {
    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    }));
  }

  return (
    <main className="min-h-screen bg-[#010101]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-yellow-400/20 bg-[radial-gradient(circle_at_top_right,_rgba(255,235,59,0.16),transparent_35%),linear-gradient(180deg,#070707_0%,#050405_100%)] p-8 shadow-[0_40px_120px_-70px_rgba(255,214,0,0.65)]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-4">
              <p className="uppercase tracking-[0.35em] text-sm text-yellow-300/80">Admin console</p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">Sanga Control Center</h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300">
                Manage menu items, customer orders, and media uploads from a refined dashboard built for speed and clarity.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
                {status}
              </div>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.75rem] border border-white/10 bg-[#080808]/95 p-6 shadow-[0_18px_60px_-40px_rgba(255,214,0,0.65)]">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Menu items</p>
              <p className="mt-4 text-3xl font-semibold text-white">{menuItems.length}</p>
              <p className="mt-2 text-sm text-slate-400">Active dishes available right now.</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-[#080808]/95 p-6 shadow-[0_18px_60px_-40px_rgba(255,214,0,0.65)]">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Orders</p>
              <p className="mt-4 text-3xl font-semibold text-white">{orders.length}</p>
              <p className="mt-2 text-sm text-slate-400">Orders in the system, ready to process.</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-[#080808]/95 p-6 shadow-[0_18px_60px_-40px_rgba(255,214,0,0.65)]">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Uploads</p>
              <p className="mt-4 text-3xl font-semibold text-white">{uploads.length}</p>
              <p className="mt-2 text-sm text-slate-400">Latest assets ready for the menu feed.</p>
            </div>
          </div>
        </section>

        {message ? (
          <div className="mt-8 rounded-[1.75rem] border border-yellow-300/20 bg-[#111111] px-6 py-4 text-sm text-yellow-100 shadow-[0_10px_40px_-20px_rgba(255,214,0,0.6)]">
            {message}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <AdminOrderCard orders={orders} loading={loading} onStatusChange={handleOrderStatusUpdate} />
            <AdminPreviewPanel menuItems={menuItems} uploads={uploads} />
          </div>
          <div className="space-y-6">
            <AdminMenuCard form={menuForm} imageFile={menuImageFile} loading={loading} onFormChange={(updated) => setMenuForm((prev) => ({ ...prev, ...updated }))} onFileChange={handleMenuFileChange} onSubmit={handleMenuSubmit} />
            <AdminCreateOrderCard
              menuItems={menuItems}
              loading={loading}
              onSubmit={handleOrderSubmit}
              form={orderForm}
              onFormChange={(updated) => setOrderForm((prev) => ({ ...prev, ...updated }))}
              onAddItem={handleAddOrderItem}
              onRemoveItem={handleRemoveOrderItem}
              onUpdateQuantity={handleUpdateOrderQuantity}
            />
            <AdminUploadCard imageFile={imageFile} loading={loading} message={message} onFileChange={handleFileChange} onSubmit={handleUpload} />
          </div>
        </div>
      </div>
    </main>
  );
}
