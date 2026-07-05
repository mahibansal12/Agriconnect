// src/pages/order/OrderForm.jsx


import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';


const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('agriconnect_user') || 'null');
  } catch {
    return null;
  }
};

const getDeliveryParts = (address, crop) => {
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  return {
    state: crop.state || crop.location?.state || parts.at(-2) || parts.at(-1) || 'Unknown',
    district: crop.district || crop.location?.district || parts.at(-3) || parts[0] || 'Unknown',
    village: crop.location?.village || parts[0] || '',
    pincode: crop.location?.pincode || address.match(/\b\d{6}\b/)?.[0] || '',
  };
};

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
      <div
        className="min-h-screen w-full flex items-center justify-center px-6 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/order-bg.jpg')" }}
      >
        <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-md" />
        <div className="relative text-center space-y-4 bg-white/95 backdrop-blur-xl border border-white rounded-[28px] shadow-[0_20px_60px_-15px_rgba(6,78,59,0.35)] px-12 py-14 max-w-sm w-full">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">
            🌾
          </div>
          <p className="text-lg font-semibold text-stone-700">No crop selected.</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold text-sm tracking-wide transition-colors group"
          >
            Browse Marketplace
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      </div>
    );
  }

  const unitPrice = crop.pricePerUnit ?? crop.pricePerQtl ?? crop.price ?? 0;
  const totalAmount = qty * unitPrice;

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
      const user = getStoredUser();
      const delivery = getDeliveryParts(address, crop);
      const { data: orderData } = await axiosInstance.post('/v1/orders', {
        listingId: crop._id,
        quantity: qty,
        ...delivery,
        phone: user?.phone || crop.farmer?.phone || crop.seller?.phone || '0000000000',
      });

      // orderData.data = { order, razorpayOrderId, amount, currency, key }
      const { order, razorpayOrderId, amount, currency, key } = orderData.data;

      // 3. Open Razorpay checkout modal
      const rzpOptions = {
        key,
        amount,                        // paise
        currency: currency ?? 'INR',
        name:     'AgriConnect',
        description: `Order for ${crop.title || crop.cropName || crop.name}`,
        image:    '/favicon.svg',
        order_id: razorpayOrderId,

        handler: async (response) => {
          // 4. Verify payment on backend → creates the order document
          try {
            await axiosInstance.post('/v1/orders/verify-payment', {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId:           order._id,
            });

            // Success — go to farmer dashboard / buyer dashboard
            navigate('/buyer/dashboard', {
              state: { successMessage: 'Order placed successfully! 🎉' },
            });
          } catch {
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
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/order-bg.jpg')" }}
    >
      {/* Frosted backdrop so the busy background doesn't fight with the card */}
      <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-md" />

      {/* Floating card */}
      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-[32px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">

        {/* ── LEFT PANEL — hero / branding, reusing the same background art ── */}
        <div
          className="relative min-h-[280px] lg:min-h-[720px] bg-cover bg-center bg-no-repeat flex flex-col justify-between"
          style={{ backgroundImage: "url('/images/order-bg.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-emerald-900/80 to-emerald-950/60" />

          {/* Top: brand + heading */}
          <div className="relative z-10 px-8 sm:px-12 lg:px-14 pt-10 lg:pt-14">
            <span className="inline-flex items-center gap-2 text-white text-xs font-bold uppercase tracking-[0.2em] mb-10">
              <span className="text-base">🌾</span> AgriConnect
            </span>
            <h1 className="text-white text-[36px] sm:text-[44px] lg:text-[46px] font-extrabold leading-[1.1] tracking-tight">
              Complete Your <span className="text-emerald-400">Order</span>
            </h1>
            <div className="flex items-center gap-2 my-5">
              <span className="h-px w-8 bg-emerald-400/60" />
              <span className="text-emerald-400 text-sm">🌿</span>
              <span className="h-px w-8 bg-emerald-400/60" />
            </div>
            <p className="text-emerald-100/70 text-[15px] max-w-sm leading-relaxed">
              Buying fresh, straight from the farmer to your doorstep.
            </p>
            <p className="text-emerald-100/70 text-[15px] max-w-sm leading-relaxed mt-1">
              Review your order and check out securely below.
            </p>
          </div>

          {/* Bottom: seller banner — full width of the panel */}
          <div className="relative z-10 w-full bg-black/25 backdrop-blur-md border-t border-white/10 px-8 sm:px-12 lg:px-14 py-6 flex items-center gap-4">
            {crop.images?.[0] ? (
              <img
                src={typeof crop.images[0] === 'string' ? crop.images[0] : crop.images[0]?.url}
                alt={crop.title || crop.cropName || crop.name}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-lg ring-1 ring-white/20"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0 ring-1 ring-white/20">
                🌾
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-bold text-base capitalize truncate">
                {crop.title || crop.cropName || crop.name}
              </p>
              <p className="text-emerald-200/70 text-[13px] font-medium">
                Seller · {crop.farmer?.name ?? crop.seller?.name ?? 'Farmer'}
              </p>
              <p className="text-amber-300 font-bold text-sm mt-0.5">
                ₹{unitPrice?.toLocaleString('en-IN')} <span className="text-emerald-200/60 font-medium text-xs">/ quintal</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — order summary / form ───────────────────── */}
        <div className="bg-white px-8 sm:px-12 lg:px-14 py-10 lg:py-12 flex flex-col justify-between">

          {/* Heading with icon badge */}
          <div>
            <div className="flex items-center gap-4 pb-6 mb-6 border-b border-stone-100">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                  <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-[26px] font-extrabold text-stone-900 tracking-tight leading-tight">
                  Order Summary
                </h2>
                <p className="text-stone-400 text-sm">
                  Secure checkout, protected by <span className="text-emerald-600 font-semibold">Razorpay</span>
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Product card */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-3">You selected</p>
                <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] p-4 flex items-center gap-4">
                  {crop.images?.[0] ? (
                    <img
                      src={typeof crop.images[0] === 'string' ? crop.images[0] : crop.images[0]?.url}
                      alt={crop.title || crop.cropName || crop.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 ring-1 ring-stone-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl flex-shrink-0">
                      🥭
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[15px] text-stone-900 truncate capitalize">
                      {crop.title || crop.cropName || crop.name}
                    </p>
                    <p className="text-emerald-600 font-bold text-sm">₹{unitPrice?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-3">Quantity (quintals)</p>
                <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] px-4 py-3.5 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-9 h-9 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-emerald-600 font-bold text-lg hover:bg-emerald-50 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                    className="w-10 bg-transparent text-center font-bold text-stone-800 text-lg focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQty(qty + 1)}
                    className="w-9 h-9 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-emerald-600 font-bold text-lg hover:bg-emerald-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Delivery address */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-3">Delivery Address</p>
                <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] px-4 py-3.5 flex items-start gap-3 focus-within:ring-4 focus-within:ring-emerald-500/15 focus-within:border-emerald-500 transition-all duration-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500 mt-0.5 flex-shrink-0">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Village, District, State, PIN"
                    className="w-full bg-transparent text-[15px] text-stone-800 resize-none placeholder:text-stone-400
                               focus:outline-none"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3 flex items-start gap-2">
                  <span className="flex-shrink-0 mt-px">⚠️</span>
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Total + CTA block */}
          <div className="bg-stone-50 border border-stone-100 rounded-2xl p-5 mt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-bold text-stone-800">Total Price</span>
              <span className="text-2xl font-extrabold text-emerald-600 tracking-tight">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full h-[52px] bg-emerald-700 hover:bg-emerald-800
                         hover:shadow-[0_10px_25px_-8px_rgba(4,120,87,0.6)]
                         disabled:opacity-60 disabled:hover:shadow-none
                         text-white font-bold rounded-xl transition-all duration-300 text-sm tracking-wide uppercase
                         inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                  Submit · Pay ₹{totalAmount.toLocaleString('en-IN')}
                </>
              )}
            </button>

            <p className="text-center text-xs text-stone-400 font-medium mt-4">
              🛡️ Payments are secured by <span className="text-emerald-600 font-semibold">Razorpay</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
