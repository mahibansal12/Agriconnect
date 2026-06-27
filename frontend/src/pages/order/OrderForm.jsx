// src/pages/order/OrderForm.jsx


import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Dynamically loads the Razorpay checkout script if not already loaded.
 * Returns a promise that resolves true on success, false on failure.
 */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ─── Component ────────────────────────────────────────────────

export default function OrderForm() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Expect crop passed via <Link state={{ crop }} />
  const crop = location.state?.crop ?? null;

  const [qty,     setQty]     = useState(1);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Guard — if someone lands here without a crop in state
  if (!crop) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">No crop selected.</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="text-green-600 underline text-sm"
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = qty * (crop.pricePerQtl ?? 0);

  // ── Payment flow ─────────────────────────────────────────

  const handlePayment = async () => {
    setError(null);

    if (!address.trim()) {
      setError('Please enter a delivery address.');
      return;
    }
    if (qty < 1) {
      setError('Quantity must be at least 1 quintal.');
      return;
    }

    setLoading(true);
    try {
      // 1. Load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) throw new Error('Failed to load payment gateway. Check your internet connection.');

      // 2. Create Razorpay order on backend
      const { data: orderData } = await axiosInstance.post('/v1/orders/create-payment', {
        cropListingId: crop._id,
        quantity: qty,
        deliveryAddress: address,
      });

      // orderData.data = { razorpayOrderId, amount, currency, keyId }
      const { razorpayOrderId, amount, currency, keyId } = orderData.data;

      // 3. Open Razorpay checkout modal
      const rzpOptions = {
        key:      keyId,
        amount,                        // paise
        currency: currency ?? 'INR',
        name:     'AgriConnect',
        description: `Order for ${crop.title}`,
        image:    '/favicon.svg',
        order_id: razorpayOrderId,

        handler: async (response) => {
          // 4. Verify payment on backend → creates the order document
          try {
            await axiosInstance.post('/v1/orders/verify-payment', {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              cropListingId:     crop._id,
              quantity:          qty,
              deliveryAddress:   address,
            });

            // Success — go to farmer dashboard / buyer dashboard
            navigate('/dashboard/farmer', {
              state: { successMessage: 'Order placed successfully! 🎉' },
            });
          } catch (verifyErr) {
            setError('Payment received but order verification failed. Please contact support.');
          }
        },

        prefill: {
          name:  '',   // will be filled from auth context if wired
          email: '',
          contact: '',
        },

        theme: { color: '#16a34a' },

        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();

    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? 'Something went wrong.');
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="bg-green-600 px-6 py-5">
          <h1 className="text-xl font-bold text-white">Place Order</h1>
          <p className="text-green-100 text-sm mt-0.5">Secure payment via Razorpay</p>
        </div>

        {/* Crop summary */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
          {crop.images?.[0] ? (
            <img
              src={crop.images[0]}
              alt={crop.title}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center text-2xl flex-shrink-0">
              🌾
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800">{crop.title}</p>
            <p className="text-sm text-gray-500">
              ₹{crop.pricePerQtl?.toLocaleString('en-IN')} / qtl
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Seller: {crop.farmer?.fullName ?? 'Farmer'}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5">

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity (quintals)
            </label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Delivery address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Address
            </label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Village, District, State, PIN"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Order summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Price per quintal</span>
              <span>₹{crop.pricePerQtl?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Quantity</span>
              <span>{qty} qtl</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-800">
              <span>Total</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60
                       text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Processing…' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
          </button>

          <p className="text-center text-xs text-gray-400">
            🔒 Payments are secured by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}
