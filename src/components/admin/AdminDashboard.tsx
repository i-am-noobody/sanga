"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { MenuItem, UploadImage } from "./types";
import { DEFAULT_MENU_CATEGORY, MENU_TAXONOMY, getSubcategoryOptions } from "@/lib/menuTaxonomy";

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

type ActiveTab = 'dashboard' | 'orders' | 'menu' | 'media' | 'admin';

type DeleteTarget =
  | { type: 'menu'; id: number; label: string }
  | { type: 'upload'; publicId: string; label: string };

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [uploads, setUploads] = useState<UploadImage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    category: DEFAULT_MENU_CATEGORY,
    subcategory: "",
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
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

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
      if (!menuImageFile) {
        setMessage("Please select an image before adding a menu item.");
        return;
      }

      let imageUrl = "";

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

      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: menuForm.name,
          price: Number(menuForm.price),
          imageUrl,
          category: menuForm.category,
          subcategory: menuForm.subcategory,
          description: menuForm.description,
        }),
      });

      const payload = await res.json();
      if (res.ok) {
        setMessage("Menu item added successfully.");
        setMenuForm({
          name: "",
          category: DEFAULT_MENU_CATEGORY,
          subcategory: "",
          price: "",
          description: "",
        });
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

  const toggleModal = (modalId: string) => {
    setActiveModal(activeModal === modalId ? null : modalId);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    toggleModal('orderModal');
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const openMenuDeleteDialog = (item: MenuItem) => {
    setDeleteTarget({
      type: 'menu',
      id: item.id,
      label: item.name,
    });
  };

  const openUploadDeleteDialog = (upload: UploadImage) => {
    setDeleteTarget({
      type: 'upload',
      publicId: upload.public_id,
      label: upload.public_id,
    });
  };

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    setLoading(true);
    setMessage(null);

    try {
      if (deleteTarget.type === 'menu') {
        const res = await fetch(`/api/menu/${deleteTarget.id}`, {
          method: 'DELETE',
        });

        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          setMessage(payload.error ?? 'Unable to delete menu item.');
          return;
        }

        setMessage('Menu item deleted successfully.');
        await loadMenu();
      } else {
        const res = await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: deleteTarget.publicId }),
        });

        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          setMessage(payload.error ?? 'Unable to delete image.');
          return;
        }

        setMessage('Image deleted successfully.');
        await loadUploads();
      }

      closeDeleteDialog();
    } catch (error) {
      console.error('Delete error', error);
      setMessage('Server error while deleting.');
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#00FF66';
      case 'PENDING': return '#FFD700';
      case 'APPROVED': return '#00D4FF';
      case 'CANCELLED': return '#FF4444';
      default: return '#FFD700';
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white md:flex">
      {/* Sidebar */}
      <aside className="w-full border-b border-gray-700 bg-gray-900 p-4 md:fixed md:inset-y-0 md:w-64 md:border-b-0 md:border-r md:p-6">
        <div className="logo mb-4 flex items-center gap-2.5 text-xl font-bold uppercase tracking-wider text-yellow-400 md:mb-12">
        <img src="/logo.png" alt="Logo" width="200" height="100" />
        </div>
        <nav>
          <ul className="flex gap-2 overflow-x-auto pb-2 md:block md:space-y-3 md:overflow-visible md:pb-0">
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex w-full min-w-max items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition-all duration-300 md:min-w-0 ${
                  activeTab === 'dashboard'
                    ? 'bg-yellow-400 text-gray-900'
                    : 'text-white hover:bg-yellow-400 hover:text-gray-900'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex w-full min-w-max items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition-all duration-300 md:min-w-0 ${
                  activeTab === 'orders'
                    ? 'bg-yellow-400 text-gray-900'
                    : 'text-white hover:bg-yellow-400 hover:text-gray-900'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                Orders
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('menu')}
                className={`flex w-full min-w-max items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition-all duration-300 md:min-w-0 ${
                  activeTab === 'menu'
                    ? 'bg-yellow-400 text-gray-900'
                    : 'text-white hover:bg-yellow-400 hover:text-gray-900'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"></path>
                  <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"></path>
                  <path d="m2.1 21.8 6.4-6.3"></path>
                  <path d="m19 5-7 7"></path>
                </svg>
                Menu Management
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('media')}
                className={`flex w-full min-w-max items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition-all duration-300 md:min-w-0 ${
                  activeTab === 'media'
                    ? 'bg-yellow-400 text-gray-900'
                    : 'text-white hover:bg-yellow-400 hover:text-gray-900'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="9" cy="9" r="2"></circle>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                </svg>
                Media Library
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex w-full min-w-max items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-white transition-all duration-300 hover:bg-yellow-400 hover:text-gray-900 md:min-w-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
                {loading ? "Logging out..." : "Logout"}
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 md:ml-64">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold sm:text-4xl">System Analytics</h1>
                <p className="text-gray-400">Live data monitoring & menu control</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  onClick={() => toggleModal('menuModal')}
                  className="flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-lg"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 12h8"></path>
                    <path d="M12 8v8"></path>
                  </svg>
                  Add New Menu Item
                </button>
                <button
                  onClick={() => toggleModal('uploadModal')}
                  className="flex items-center justify-center gap-2 rounded-lg border border-yellow-400 bg-gray-800 px-4 py-3 font-bold text-yellow-400 transition-all duration-300 hover:bg-yellow-400 hover:text-black"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                  Upload Media
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="bg-gray-800 p-6 rounded-2xl border-b-4 border-yellow-400 hover:transform hover:-translate-y-1 transition-all duration-300">
                <span className="text-gray-400 text-sm">Total Items</span>
                <h2 className="text-3xl font-bold mt-2">{menuItems.length}</h2>
              </div>
              <div className="bg-gray-800 p-6 rounded-2xl border-b-4 border-yellow-400 hover:transform hover:-translate-y-1 transition-all duration-300">
                <span className="text-gray-400 text-sm">Active Orders</span>
                <h2 className="text-3xl font-bold mt-2">{orders.length}</h2>
              </div>
              <div className="bg-gray-800 p-6 rounded-2xl border-b-4 border-yellow-400 hover:transform hover:-translate-y-1 transition-all duration-300">
                <span className="text-gray-400 text-sm">Images Stored</span>
                <h2 className="text-3xl font-bold mt-2">{uploads.length}</h2>
              </div>
              <div className="bg-gray-800 p-6 rounded-2xl border-b-4 border-yellow-400 hover:transform hover:-translate-y-1 transition-all duration-300">
                <span className="text-gray-400 text-sm">API Status</span>
                <h2 className="text-3xl font-bold mt-2 text-green-400">Online</h2>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:shadow-2xl hover:shadow-yellow-400/10 transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Recent Transactions</h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer text-gray-400 hover:text-yellow-400 transition-colors">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-yellow-400 py-3 px-4 uppercase text-xs font-bold tracking-wider">Order ID</th>
                      <th className="text-left text-yellow-400 py-3 px-4 uppercase text-xs font-bold tracking-wider">Customer</th>
                      <th className="text-left text-yellow-400 py-3 px-4 uppercase text-xs font-bold tracking-wider">Items</th>
                      <th className="text-left text-yellow-400 py-3 px-4 uppercase text-xs font-bold tracking-wider">Status</th>
                      <th className="text-left text-yellow-400 py-3 px-4 uppercase text-xs font-bold tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map((order) => (
                      <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                        <td className="py-3 px-4 text-gray-300">#{order.id}</td>
                        <td className="py-3 px-4 text-gray-300">{order.customerName}</td>
                        <td className="py-3 px-4 text-gray-300">
                          {order.items.map(item => `${item.quantity}x ${item.menuItem.name}`).join(', ')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-2 ${
                            order.status === 'COMPLETED' ? 'text-green-400' :
                            order.status === 'PENDING' ? 'text-yellow-400' :
                            order.status === 'APPROVED' ? 'text-blue-400' :
                            'text-red-400'
                          }`}>
                            <span className="w-2 h-2 bg-current rounded-full"></span>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleOrderClick(order)}
                            className="text-gray-400 hover:text-yellow-400 transition-colors"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Media Library Section */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mt-8 hover:shadow-2xl hover:shadow-yellow-400/10 transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Media Library</h3>
                <button
                  onClick={() => toggleModal('uploadModal')}
                  className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-300 transition-colors"
                >
                  Add Media
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-80 overflow-y-auto">
                {uploads.slice(0, 12).map((upload) => (
                  <div key={upload.asset_id} className="bg-gray-700 rounded-lg overflow-hidden border border-gray-600 hover:border-yellow-400 transition-colors">
                    <img
                      src={upload.secure_url}
                      alt="Uploaded media"
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-2 text-xs text-gray-400">
                      {new Date(upload.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {uploads.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    No media uploaded yet. Click "Add Media" to get started.
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold sm:text-4xl">Order Management</h1>
                <p className="text-gray-400">Manage customer orders and track fulfillment</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:shadow-2xl hover:shadow-yellow-400/10 transition-all duration-300">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-bold">All Orders</h3>
                <div className="flex gap-2">
                  <select className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white sm:w-auto">
                    <option>All Status</option>
                    <option>RECEIVED</option>
                    <option>PENDING</option>
                    <option>APPROVED</option>
                    <option>COMPLETED</option>
                    <option>CANCELLED</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-yellow-400 py-3 px-4 uppercase text-xs font-bold tracking-wider">Order ID</th>
                      <th className="text-left text-yellow-400 py-3 px-4 uppercase text-xs font-bold tracking-wider">Customer</th>
                      <th className="text-left text-yellow-400 py-3 px-4 uppercase text-xs font-bold tracking-wider">Items</th>
                      <th className="text-left text-yellow-400 py-3 px-4 uppercase text-xs font-bold tracking-wider">Total</th>
                      <th className="text-left text-yellow-400 py-3 px-4 uppercase text-xs font-bold tracking-wider">Status</th>
                      <th className="text-left text-yellow-400 py-3 px-4 uppercase text-xs font-bold tracking-wider">Date</th>
                      <th className="text-left text-yellow-400 py-3 px-4 uppercase text-xs font-bold tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                        <td className="py-3 px-4 text-gray-300">#{order.id}</td>
                        <td className="py-3 px-4 text-gray-300">
                          <div>
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {order.items.map(item => `${item.quantity}x ${item.menuItem.name}`).join(', ')}
                        </td>
                        <td className="py-3 px-4 text-gray-300 font-semibold">${order.totalPrice.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                            order.status === 'APPROVED' ? 'bg-blue-500/20 text-blue-400' :
                            order.status === 'RECEIVED' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleOrderClick(order)}
                            className="text-gray-400 hover:text-yellow-400 transition-colors mr-2"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Menu Management Tab */}
        {activeTab === 'menu' && (
          <div>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold sm:text-4xl">Menu Management</h1>
                <p className="text-gray-400">Create, edit, and organize your menu items</p>
              </div>
              <button
                onClick={() => toggleModal('menuModal')}
                className="flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 12h8"></path>
                  <path d="M12 8v8"></path>
                </svg>
                Add New Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div key={item.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-yellow-400 transition-all duration-300 hover:transform hover:-translate-y-1">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">
                        {item.category}
                        {item.subcategory ? ` / ${item.subcategory}` : ""}
                      </p>
                      <p className="text-yellow-400 font-semibold">${item.price.toFixed(2)}</p>
                    </div>
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover ml-4"
                      />
                    )}
                  </div>
                  {item.description && (
                    <p className="text-gray-300 text-sm mb-4">{item.description}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-yellow-400 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => openMenuDeleteDialog(item)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {menuItems.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-600 mb-4">
                    <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"></path>
                    <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"></path>
                    <path d="m2.1 21.8 6.4-6.3"></path>
                    <path d="m19 5-7 7"></path>
                  </svg>
                  <h3 className="text-xl font-bold text-gray-400 mb-2">No menu items yet</h3>
                  <p className="text-gray-500">Start by adding your first menu item</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Media Library Tab */}
        {activeTab === 'media' && (
          <div>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold sm:text-4xl">Media Library</h1>
                <p className="text-gray-400">Manage your uploaded images and media files</p>
              </div>
              <button
                onClick={() => toggleModal('uploadModal')}
                className="flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                Upload Media
              </button>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:shadow-2xl hover:shadow-yellow-400/10 transition-all duration-300">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {uploads.map((upload) => (
                  <div key={upload.asset_id} className="bg-gray-700 rounded-lg overflow-hidden border border-gray-600 hover:border-yellow-400 transition-all duration-300 hover:transform hover:scale-105">
                    <img
                      src={upload.secure_url}
                      alt="Uploaded media"
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3">
                      <div className="text-xs text-gray-400 mb-1">
                        {new Date(upload.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(upload.bytes / 1024).toFixed(1)} KB
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400 uppercase">{upload.format}</span>
                        <button
                          onClick={() => openUploadDeleteDialog(upload)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {uploads.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-600 mb-4">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="9" cy="9" r="2"></circle>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                    </svg>
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No media uploaded</h3>
                    <p className="text-gray-500">Upload your first image to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin Access Tab */}
        {activeTab === 'admin' && (
          <div>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold sm:text-4xl">Admin Access</h1>
                <p className="text-gray-400">Manage administrative settings and permissions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:shadow-2xl hover:shadow-yellow-400/10 transition-all duration-300">
                <h3 className="text-lg font-bold mb-4 text-yellow-400">System Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">API Status</span>
                    <span className="text-green-400 font-medium">Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Database</span>
                    <span className="text-green-400 font-medium">Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cloud Storage</span>
                    <span className="text-green-400 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Backup</span>
                    <span className="text-gray-300">2 hours ago</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:shadow-2xl hover:shadow-yellow-400/10 transition-all duration-300">
                <h3 className="text-lg font-bold mb-4 text-yellow-400">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-left">
                    Clear Cache
                  </button>
                  <button className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-left">
                    Export Data
                  </button>
                  <button className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-left">
                    System Logs
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors text-left"
                  >
                    {loading ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Menu Modal */}
      <div
        className="modal-overlay"
        id="menuModal"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(5px)',
          display: activeModal === 'menuModal' ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) toggleModal('menuModal');
        }}
      >
        <div className="modal-content" style={{
          background: '#1E1E1E',
          width: 'min(500px, calc(100vw - 2rem))',
          maxHeight: 'calc(100vh - 2rem)',
          overflowY: 'auto',
          borderRadius: '20px',
          border: '1px solid #FFD700',
          padding: 'clamp(1rem, 3vw, 2rem)',
          position: 'relative',
          animation: 'modalSlide 0.3s ease-out'
        }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              cursor: 'pointer',
              color: '#A0A0A0'
            }}
            onClick={() => toggleModal('menuModal')}
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <h2 style={{ marginBottom: '1.5rem', color: '#FFD700' }}>Add Menu Item</h2>
          <form onSubmit={handleMenuSubmit}>
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#FFD700',
                fontSize: '0.9rem'
              }}>Item Name</label>
              <input
                type="text"
                placeholder="e.g. Midnight Espresso"
                value={menuForm.name}
                onChange={(e) => setMenuForm(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#252525',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#FFD700',
                fontSize: '0.9rem'
              }}>Category</label>
              <select
                value={menuForm.category}
                onChange={(e) =>
                  setMenuForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                    subcategory: "",
                  }))
                }
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#252525',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
              >
                {MENU_TAXONOMY.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#FFD700',
                fontSize: '0.9rem'
              }}>Subcategory (optional)</label>
              <input
                type="text"
                value={menuForm.subcategory}
                onChange={(e) => setMenuForm(prev => ({ ...prev, subcategory: e.target.value }))}
                list="menu-subcategory-options"
                placeholder="e.g. Breakfast, Dirty Sodas"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#252525',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
              />
              <datalist id="menu-subcategory-options">
                {getSubcategoryOptions(menuForm.category).map((subcategory) => (
                  <option key={subcategory} value={subcategory} />
                ))}
              </datalist>
            </div>
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#FFD700',
                fontSize: '0.9rem'
              }}>Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={menuForm.price}
                onChange={(e) => setMenuForm(prev => ({ ...prev, price: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#252525',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#FFD700',
                fontSize: '0.9rem'
              }}>Description</label>
              <textarea
                value={menuForm.description}
                onChange={(e) => setMenuForm(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#252525',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#FFD700',
                fontSize: '0.9rem'
              }}>Image Upload (Cloudinary)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleMenuFileChange}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#252525',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-yellow"
              style={{
                width: '100%',
                justifyContent: 'center',
                background: '#FFD700',
                color: '#121212',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Saving...' : 'Save Item'}
            </button>
          </form>
        </div>
      </div>

      {/* Upload Modal */}
      <div
        className="modal-overlay"
        id="uploadModal"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(5px)',
          display: activeModal === 'uploadModal' ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) toggleModal('uploadModal');
        }}
      >
        <div className="modal-content" style={{
          background: '#1E1E1E',
          width: 'min(500px, calc(100vw - 2rem))',
          maxHeight: 'calc(100vh - 2rem)',
          overflowY: 'auto',
          borderRadius: '20px',
          border: '1px solid #FFD700',
          padding: 'clamp(1rem, 3vw, 2rem)',
          position: 'relative',
          animation: 'modalSlide 0.3s ease-out'
        }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              cursor: 'pointer',
              color: '#A0A0A0'
            }}
            onClick={() => toggleModal('uploadModal')}
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <h2 style={{ marginBottom: '1.5rem', color: '#FFD700' }}>Upload Media</h2>
          <form onSubmit={handleUpload}>
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#FFD700',
                fontSize: '0.9rem'
              }}>Select Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#252525',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: 'white'
                }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-yellow"
              style={{
                width: '100%',
                justifyContent: 'center',
                background: '#FFD700',
                color: '#121212',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Uploading...' : 'Upload Image'}
            </button>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className="modal-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(5px)',
          display: deleteTarget ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeDeleteDialog();
        }}
      >
        <div
          className="modal-content"
          style={{
            background: '#1E1E1E',
            width: 'min(460px, calc(100vw - 2rem))',
            borderRadius: '20px',
            border: '1px solid #FFD700',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            animation: 'modalSlide 0.3s ease-out',
          }}
        >
          <h2 style={{ marginBottom: '0.8rem', color: '#FFD700' }}>Confirm Deletion</h2>
          <p style={{ color: '#D1D5DB', marginBottom: '1.2rem', lineHeight: 1.6 }}>
            {deleteTarget?.type === 'menu'
              ? `Delete menu item \"${deleteTarget.label}\"? This action cannot be undone.`
              : `Delete image \"${deleteTarget?.label}\"? This action cannot be undone.`}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={closeDeleteDialog}
              className="rounded-lg border border-gray-600 px-4 py-2 text-gray-200 transition-colors hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={loading}
              className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {selectedOrder && (
        <div
          className="modal-overlay"
          id="orderModal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(5px)',
            display: activeModal === 'orderModal' ? 'flex' : 'none',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) toggleModal('orderModal');
          }}
        >
          <div className="modal-content" style={{
            background: '#1E1E1E',
            width: 'min(500px, calc(100vw - 2rem))',
            maxHeight: 'calc(100vh - 2rem)',
            overflowY: 'auto',
            borderRadius: '20px',
            border: '1px solid #FFD700',
            padding: 'clamp(1rem, 3vw, 2rem)',
            position: 'relative',
            animation: 'modalSlide 0.3s ease-out'
          }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                cursor: 'pointer',
                color: '#A0A0A0'
              }}
              onClick={() => toggleModal('orderModal')}
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <h2 style={{ marginBottom: '1.5rem', color: '#FFD700' }}>Order Details</h2>
            <div style={{
              borderBottom: '1px solid #2A2A2A',
              paddingBottom: '1rem',
              marginBottom: '1rem'
            }}>
              <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
              <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
              <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
              <p><strong>Total:</strong> ${selectedOrder.totalPrice.toFixed(2)}</p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#A0A0A0' }}>Items Ordered:</p>
              {selectedOrder.items.map((item, index) => (
                <p key={index}>
                  {item.quantity}x {item.menuItem.name} (${item.price.toFixed(2)})
                </p>
              ))}
            </div>
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#FFD700',
                fontSize: '0.9rem'
              }}>Update Status</label>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleOrderStatusUpdate(selectedOrder.id, e.target.value as Order['status'])}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#252525',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="RECEIVED">RECEIVED</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => toggleModal('orderModal')}
              className="btn-yellow"
              style={{
                width: '100%',
                justifyContent: 'center',
                background: '#FFD700',
                color: '#121212',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          left: '16px',
          background: 'var(--brand-dark)',
          border: '1px solid var(--brand-yellow)',
          borderRadius: '8px',
          padding: '1rem',
          color: 'var(--brand-yellow)',
          zIndex: 1001,
          maxWidth: '420px',
          width: 'auto',
          boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)'
        }}>
          {message}
        </div>
      )}

      <style jsx>{`
        @keyframes modalSlide {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
