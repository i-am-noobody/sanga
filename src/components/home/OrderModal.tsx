import type { CartItem } from "./types";

interface OrderModalProps {
  isOpen: boolean;
  cart: CartItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupTime: string;
  onClose: () => void;
  onChangeCustomerName: (value: string) => void;
  onChangeCustomerEmail: (value: string) => void;
  onChangeCustomerPhone: (value: string) => void;
  onChangePickupTime: (value: string) => void;
  onSubmit: () => void;
  updateQuantity: (id: number, quantity: number) => void;
}

export default function OrderModal({
  isOpen,
  cart,
  customerName,
  customerEmail,
  customerPhone,
  pickupTime,
  onClose,
  onChangeCustomerName,
  onChangeCustomerEmail,
  onChangeCustomerPhone,
  onChangePickupTime,
  onSubmit,
  updateQuantity,
}: OrderModalProps) {
  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Place Your Order</h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your Name *"
            value={customerName}
            onChange={(e) => onChangeCustomerName(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-yellow-400 focus:outline-none"
            required
          />
          <input
            type="email"
            placeholder="Your Email *"
            value={customerEmail}
            onChange={(e) => onChangeCustomerEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-yellow-400 focus:outline-none"
            required
          />
          <input
            type="tel"
            placeholder="Your Phone"
            value={customerPhone}
            onChange={(e) => onChangeCustomerPhone(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-yellow-400 focus:outline-none"
          />
          <input
            type="datetime-local"
            placeholder="Pickup Time *"
            value={pickupTime}
            onChange={(e) => onChangePickupTime(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-yellow-400 focus:outline-none"
            required
          />
        </div>

        <h3 className="text-xl font-semibold mt-6 mb-4">Your Order</h3>
        {cart.length === 0 ? (
          <p className="text-gray-400">No items in cart</p>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.menuItem.id} className="flex justify-between items-center bg-gray-800 p-3 rounded">
                <div>
                  <p className="font-semibold">{item.menuItem.name}</p>
                  <p className="text-sm text-gray-400">Rs {item.menuItem.price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                    className="bg-gray-700 px-2 py-1 rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                    className="bg-gray-700 px-2 py-1 rounded"
                  >
                    +
                  </button>
                </div>
                <p className="font-semibold">Rs {item.menuItem.price * item.quantity}</p>
              </div>
            ))}
            <div className="flex justify-between text-lg font-bold pt-4 border-t border-gray-700">
              <span>Total:</span>
              <span>Rs {total}</span>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="flex-1 bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
