// src/pages/order/OrderForm.jsx
import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

// ── Razorpay loader ────────────────────────────────────────────
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
  try { return JSON.parse(localStorage.getItem('agriconnect_user') || 'null'); }
  catch { return null; }
};

// Build the flat address string from structured fields
const buildAddressString = (fields) => {
  const { house, area, pincode, district, state } = fields;
  return [house, area, district, state, pincode].filter(Boolean).join(', ');
};

// ── Main Component ─────────────────────────────────────────────
export default function OrderForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const crop = location.state?.crop ?? null;

  const [qty,     setQty]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Structured address fields
  const [addrFields, setAddrFields] = useState({ house: '', area: '', pincode: '', district: '', state: '' });
  const [pinLoading,   setPinLoading]   = useState(false);
  const [pinError,     setPinError]     = useState('');
  const [pinSuccess,   setPinSuccess]   = useState(false);
  const [gpsLoading,   setGpsLoading]   = useState(false);
  const [gpsStatus,    setGpsStatus]    = useState('');  // 'success' | 'error' | ''

  const setField = (key, val) => {
    setAddrFields(prev => ({ ...prev, [key]: val }));
  };

  // ── PIN code lookup (free postalpincode.in API) ──────────────
  const handlePinLookup = useCallback(async (pin) => {
    if (pin.length !== 6) return;
    setPinLoading(true);
    setPinError('');
    setPinSuccess(false);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0]?.Status === 'Success') {
        const po = data[0].PostOffice?.[0];
        if (po) {
          setAddrFields(prev => ({ ...prev, district: po.District, state: po.State }));
          setPinSuccess(true);
          setTimeout(() => setPinSuccess(false), 3000);
        }
      } else {
        setPinError('Invalid PIN code — please check and retry.');
      }
    } catch {
      setPinError('Could not reach PIN code service. Please fill district & state manually.');
    } finally {
      setPinLoading(false);
    }
  }, []);

  // ── GPS / Current Location ───────────────────────────────────
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    setGpsLoading(true);
    setGpsStatus('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Nominatim free reverse geocoding (OpenStreetMap)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const a = data.address || {};
          const village  = a.village || a.town || a.suburb || a.neighbourhood || a.hamlet || '';
          const district = a.county || a.state_district || a.district || '';
          const state    = a.state || '';
          const pincode  = a.postcode || '';
          const road     = a.road || a.pedestrian || '';

          setAddrFields(prev => ({
            ...prev,
            area:     village || road || prev.area,
            district: district || prev.district,
            state:    state    || prev.state,
            pincode:  pincode  || prev.pincode,
          }));
          setGpsStatus('success');
          setTimeout(() => setGpsStatus(''), 4000);
        } catch {
          setGpsStatus('error');
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        setGpsStatus('error');
        setGpsLoading(false);
      },
      { timeout: 10000, maximumAge: 30000 }
    );
  };

  if (!crop) {
    return (
      <>
        <OrderFormStyles />
        <div className="of-empty-page">
          <div className="of-empty-card">
            <div className="of-empty-icon">🌾</div>
            <h2 className="of-empty-title">No crop selected</h2>
            <p className="of-empty-sub">Go back to the marketplace to pick a crop you'd like to order.</p>
            <button onClick={() => navigate('/marketplace')} className="of-empty-btn">Browse Marketplace →</button>
          </div>
        </div>
      </>
    );
  }

  const unitPrice    = crop.pricePerUnit ?? crop.pricePerQtl ?? crop.price ?? 0;
  const totalAmount  = qty * unitPrice;
  const cropName     = crop.title || crop.cropName || crop.name;
  const sellerName   = crop.farmer?.name ?? crop.seller?.name ?? 'Farmer';
  const cropImg      = crop.images?.[0]
    ? (typeof crop.images[0] === 'string' ? crop.images[0] : crop.images[0]?.url)
    : null;
  const addressReady = addrFields.area.trim() && addrFields.district.trim() && addrFields.state.trim();

  const handlePayment = async () => {
    setError(null);
    if (!addressReady) { setError('Please complete your delivery address (area, district, state are required).'); return; }
    if (qty < 1)       { setError('Quantity must be at least 1 quintal.'); return; }

    const fullAddress = buildAddressString(addrFields);
    setLoading(true);
    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) throw new Error('Failed to load payment gateway. Check your internet connection.');

      const user = getStoredUser();
      const { data: orderData } = await axiosInstance.post('/v1/orders', {
        listingId: crop._id,
        quantity:  qty,
        state:     addrFields.state    || 'Unknown',
        district:  addrFields.district || 'Unknown',
        village:   [addrFields.house, addrFields.area].filter(Boolean).join(', ') || '',
        pincode:   addrFields.pincode  || '',
        phone:     user?.phone || crop.farmer?.phone || crop.seller?.phone || '0000000000',
      });

      const { order, razorpayOrderId, amount, currency, key } = orderData.data;

      const rzpOptions = {
        key, amount, currency: currency ?? 'INR',
        name: 'AgriConnect',
        description: `Order for ${cropName}`,
        image: '/favicon.svg',
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await axiosInstance.post('/v1/orders/verify-payment', {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId:           order._id,
            });
            navigate('/buyer/dashboard', { state: { successMessage: 'Order placed successfully! 🎉' } });
          } catch {
            setError('Payment received but order verification failed. Please contact support.');
          }
        },
        prefill: { name: '', email: '', contact: '' },
        theme:   { color: '#16a34a' },
        modal:   { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <>
      <OrderFormStyles />
      <div className="of-page">
        <div className="of-bg-overlay" />

        <div className="of-card">
          {/* ════ LEFT PANEL ════ */}
          <div className="of-left" style={{ backgroundImage: "url('/images/order-bg.jpg')" }}>
            <div className="of-left-overlay" />
            <div className="of-left-top">
              <div className="of-brand">
                <span className="of-brand-icon">🌾</span>
                <span className="of-brand-name">AgriConnect</span>
              </div>
              <h1 className="of-hero-title">Complete<br />Your <span className="of-hero-accent">Order</span></h1>
              <div className="of-hero-divider">
                <span className="of-hero-divider-line" />
                <span className="of-hero-divider-leaf">🌿</span>
                <span className="of-hero-divider-line" />
              </div>
              <p className="of-hero-sub">
                Farm-fresh produce delivered straight from the source to your doorstep. Transparent pricing, secure checkout.
              </p>
              <div className="of-chips">
                <span className="of-chip">✅ Verified Farmers</span>
                <span className="of-chip">🔒 Secure Payment</span>
                <span className="of-chip">🚚 Direct Delivery</span>
              </div>
            </div>

            <div className="of-product-banner">
              <div className="of-product-img-wrap">
                {cropImg
                  ? <img src={cropImg} alt={cropName} className="of-product-img" />
                  : <div className="of-product-img-fallback">🌾</div>
                }
              </div>
              <div className="of-product-info">
                <p className="of-product-name">{cropName}</p>
                <p className="of-product-seller">Sold by {sellerName}</p>
                <p className="of-product-price">₹{unitPrice?.toLocaleString('en-IN')}<span className="of-product-unit"> / quintal</span></p>
              </div>
              <div className="of-product-badge">FRESH</div>
            </div>
          </div>

          {/* ════ RIGHT PANEL ════ */}
          <div className="of-right">
            <div className="of-right-header">
              <div className="of-right-header-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="of-right-title">Order Summary</h2>
                <p className="of-right-subtitle">Secure checkout via <span className="of-razorpay-tag">Razorpay</span></p>
              </div>
            </div>

            <div className="of-form-body">

              {/* Item preview */}
              <div className="of-section">
                <label className="of-label">🛒 You are ordering</label>
                <div className="of-item-card">
                  <div className="of-item-img-wrap">
                    {cropImg
                      ? <img src={cropImg} alt={cropName} className="of-item-img" />
                      : <div className="of-item-img-fallback">🥕</div>
                    }
                  </div>
                  <div className="of-item-details">
                    <p className="of-item-name">{cropName}</p>
                    <p className="of-item-seller">by {sellerName}</p>
                    <p className="of-item-price">₹{unitPrice?.toLocaleString('en-IN')}<span className="of-item-unit">/qtl</span></p>
                  </div>
                  <div className="of-item-check">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="of-section">
                <label className="of-label">📦 Quantity (Quintals)</label>
                <div className="of-qty-row">
                  <div className="of-qty-control">
                    <button type="button" className="of-qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                    <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} className="of-qty-input" />
                    <button type="button" className="of-qty-btn" onClick={() => setQty(qty + 1)}>+</button>
                  </div>
                  <div className="of-qty-total">
                    <span className="of-qty-total-label">Subtotal</span>
                    <span className="of-qty-total-value">₹{(qty * unitPrice).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* ── SMART ADDRESS ─────────────────────────────────── */}
              <div className="of-section">
                <label className="of-label">📍 Delivery Address</label>

                {/* Quick-fill buttons */}
                <div className="of-addr-actions">
                  <button
                    type="button"
                    className={`of-addr-action-btn${gpsLoading ? ' of-addr-action-btn--loading' : ''}${gpsStatus === 'success' ? ' of-addr-action-btn--success' : ''}${gpsStatus === 'error' ? ' of-addr-action-btn--error' : ''}`}
                    onClick={handleUseLocation}
                    disabled={gpsLoading}
                  >
                    {gpsLoading ? (
                      <span className="of-mini-spinner" />
                    ) : gpsStatus === 'success' ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                    ) : gpsStatus === 'error' ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/><path d="M12 9a3 3 0 0 1 3 3"/>
                      </svg>
                    )}
                    {gpsLoading ? 'Locating…' : gpsStatus === 'success' ? 'Location Detected!' : gpsStatus === 'error' ? 'Location Unavailable' : 'Use My Location'}
                  </button>
                  <div className="of-addr-divider">
                    <span>or enter manually</span>
                  </div>
                </div>

                {gpsStatus === 'error' && (
                  <p className="of-addr-gps-error">⚠️ Couldn't detect location. Please allow location access or fill in manually.</p>
                )}

                {/* Structured address fields */}
                <div className="of-addr-fields">

                  {/* House/Flat */}
                  <div className="of-addr-field-group of-addr-full">
                    <label className="of-addr-field-label">House / Flat / Building (optional)</label>
                    <div className="of-addr-input-wrap">
                      <svg className="of-addr-field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      <input
                        type="text"
                        value={addrFields.house}
                        onChange={e => setField('house', e.target.value)}
                        placeholder="e.g. 12B, Sunrise Apartments"
                        className="of-addr-input"
                      />
                    </div>
                  </div>

                  {/* Village / Area */}
                  <div className="of-addr-field-group of-addr-full">
                    <label className="of-addr-field-label">Village / Town / Area <span className="of-required">*</span></label>
                    <div className="of-addr-input-wrap">
                      <svg className="of-addr-field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <input
                        type="text"
                        value={addrFields.area}
                        onChange={e => setField('area', e.target.value)}
                        placeholder="e.g. Rampur Village"
                        className="of-addr-input"
                      />
                    </div>
                  </div>

                  {/* PIN code */}
                  <div className="of-addr-field-group of-addr-half">
                    <label className="of-addr-field-label">
                      PIN Code
                      {pinLoading && <span className="of-pin-badge of-pin-badge--loading">Fetching…</span>}
                      {pinSuccess  && <span className="of-pin-badge of-pin-badge--success">✓ Auto-filled!</span>}
                    </label>
                    <div className="of-addr-input-wrap">
                      <svg className="of-addr-field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                      </svg>
                      <input
                        type="text"
                        maxLength={6}
                        value={addrFields.pincode}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setField('pincode', v);
                          setPinError('');
                          if (v.length === 6) handlePinLookup(v);
                        }}
                        placeholder="6-digit PIN"
                        className={`of-addr-input${pinSuccess ? ' of-addr-input--success' : ''}`}
                      />
                    </div>
                    {pinError && <p className="of-addr-field-error">{pinError}</p>}
                    {!pinError && <p className="of-addr-field-hint">District & state auto-fill on valid PIN</p>}
                  </div>

                  {/* District */}
                  <div className="of-addr-field-group of-addr-half">
                    <label className="of-addr-field-label">District <span className="of-required">*</span></label>
                    <div className="of-addr-input-wrap">
                      <svg className="of-addr-field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                      </svg>
                      <input
                        type="text"
                        value={addrFields.district}
                        onChange={e => setField('district', e.target.value)}
                        placeholder="e.g. Varanasi"
                        className={`of-addr-input${pinSuccess ? ' of-addr-input--success' : ''}`}
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div className="of-addr-field-group of-addr-full">
                    <label className="of-addr-field-label">State <span className="of-required">*</span></label>
                    <div className="of-addr-input-wrap">
                      <svg className="of-addr-field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                      </svg>
                      <input
                        type="text"
                        value={addrFields.state}
                        onChange={e => setField('state', e.target.value)}
                        placeholder="e.g. Uttar Pradesh"
                        className={`of-addr-input${pinSuccess ? ' of-addr-input--success' : ''}`}
                      />
                    </div>
                  </div>

                </div>

                {/* Live address preview */}
                {addressReady && (
                  <div className="of-addr-preview">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <p className="of-addr-preview-text">{buildAddressString(addrFields)}</p>
                  </div>
                )}

              </div>
              {/* ── END SMART ADDRESS ── */}

              {/* Error */}
              {error && (
                <div className="of-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* ── Checkout strip ── */}
            <div className="of-checkout">
              <div className="of-total-row">
                <div>
                  <p className="of-total-label">Total Payable</p>
                  <p className="of-total-amount">₹{totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="of-total-breakdown">
                  <div className="of-breakdown-row"><span>Price / qtl</span><span>₹{unitPrice.toLocaleString('en-IN')}</span></div>
                  <div className="of-breakdown-row"><span>Quantity</span><span>× {qty}</span></div>
                  <div className="of-breakdown-divider" />
                  <div className="of-breakdown-row of-breakdown-total"><span>Total</span><span>₹{totalAmount.toLocaleString('en-IN')}</span></div>
                </div>
              </div>

              <button onClick={handlePayment} disabled={loading} className="of-pay-btn">
                {loading ? <span className="of-spinner" /> : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>
                  </svg>
                )}
                {loading ? 'Processing payment…' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
              </button>

              <div className="of-secure-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>256-bit SSL secured · Powered by <strong>Razorpay</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Scoped styles ──────────────────────────────────────────────
function OrderFormStyles() {
  return (
    <style>{`
      .of-page {
        min-height: 100vh; width: 100%;
        display: flex; align-items: center; justify-content: center;
        padding: 24px 16px;
        background-image: url('/images/order-bg.jpg');
        background-size: cover; background-position: center; background-repeat: no-repeat;
        font-family: 'Inter', system-ui, sans-serif;
      }
      .of-bg-overlay {
        position: fixed; inset: 0;
        background: linear-gradient(135deg, rgba(6,46,40,0.78) 0%, rgba(5,46,22,0.65) 100%);
        backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); z-index: 0;
      }
      .of-card {
        position: relative; z-index: 1; width: 100%; max-width: 1080px;
        display: grid; grid-template-columns: 1fr;
        border-radius: 28px; overflow: hidden;
        box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 32px 80px -16px rgba(0,0,0,0.65), 0 8px 24px -4px rgba(0,0,0,0.35);
      }
      @media(min-width:900px) { .of-card { grid-template-columns: 1fr 1.15fr; } }

      /* LEFT */
      .of-left { position: relative; min-height: 280px; background-size: cover; background-position: center; display: flex; flex-direction: column; justify-content: space-between; }
      .of-left-overlay { position: absolute; inset: 0; background: linear-gradient(160deg, rgba(3,28,20,0.94) 0%, rgba(6,64,43,0.84) 55%, rgba(3,28,20,0.72) 100%); }
      .of-left-top { position: relative; z-index: 1; padding: 40px 36px 0; }
      .of-brand { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 32px; }
      .of-brand-icon { font-size: 20px; }
      .of-brand-name { color: rgba(255,255,255,0.88); font-size: 12px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; }
      .of-hero-title { color: #fff; font-size: clamp(32px, 4vw, 52px); font-weight: 900; line-height: 1.04; letter-spacing: -0.025em; margin: 0 0 20px; }
      .of-hero-accent { background: linear-gradient(90deg, #4ade80, #86efac); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      .of-hero-divider { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
      .of-hero-divider-line { flex: 1; max-width: 40px; height: 1.5px; background: rgba(74,222,128,0.4); border-radius: 99px; }
      .of-hero-divider-leaf { font-size: 16px; }
      .of-hero-sub { color: rgba(220,252,231,0.62); font-size: 14px; line-height: 1.75; max-width: 310px; margin-bottom: 28px; }
      .of-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 36px; }
      .of-chip { display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: rgba(220,252,231,0.78); font-size: 12px; font-weight: 600; backdrop-filter: blur(4px); }
      .of-product-banner { position: relative; z-index: 1; display: flex; align-items: center; gap: 16px; padding: 20px 36px; background: rgba(0,0,0,0.32); border-top: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(8px); }
      .of-product-img-wrap { flex-shrink: 0; width: 58px; height: 58px; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.4); }
      .of-product-img { width: 100%; height: 100%; object-fit: cover; }
      .of-product-img-fallback { width: 100%; height: 100%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 26px; }
      .of-product-info { flex: 1; min-width: 0; }
      .of-product-name { color: #fff; font-size: 16px; font-weight: 800; text-transform: capitalize; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0 0 3px; }
      .of-product-seller { color: rgba(167,243,208,0.55); font-size: 12px; font-weight: 500; margin: 0 0 4px; }
      .of-product-price { color: #fcd34d; font-size: 15px; font-weight: 800; margin: 0; }
      .of-product-unit { color: rgba(167,243,208,0.5); font-size: 11px; font-weight: 500; }
      .of-product-badge { flex-shrink: 0; padding: 5px 11px; border-radius: 8px; background: linear-gradient(135deg, #4ade80, #22c55e); color: #052e16; font-size: 10px; font-weight: 900; letter-spacing: 0.12em; }

      /* RIGHT */
      .of-right { background: #fff; display: flex; flex-direction: column; }
      .of-right-header { display: flex; align-items: center; gap: 16px; padding: 28px 32px 24px; border-bottom: 1px solid #f0f4f8; }
      .of-right-header-icon { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1.5px solid #bbf7d0; display: flex; align-items: center; justify-content: center; color: #16a34a; flex-shrink: 0; box-shadow: 0 2px 8px rgba(22,163,74,0.15); }
      .of-right-title { font-size: 21px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; margin: 0 0 3px; }
      .of-right-subtitle { font-size: 13px; color: #94a3b8; font-weight: 500; margin: 0; }
      .of-razorpay-tag { color: #2563eb; font-weight: 700; }

      .of-form-body { flex: 1; padding: 24px 32px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; }
      .of-section { display: flex; flex-direction: column; gap: 10px; }
      .of-label { font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase; }

      .of-item-card { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 16px; border: 1.5px solid #e2e8f0; background: linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%); transition: border-color 0.2s, box-shadow 0.2s; }
      .of-item-card:hover { border-color: #86efac; box-shadow: 0 4px 16px -4px rgba(34,197,94,0.15); }
      .of-item-img-wrap { width: 56px; height: 56px; border-radius: 12px; overflow: hidden; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .of-item-img { width: 100%; height: 100%; object-fit: cover; }
      .of-item-img-fallback { width: 100%; height: 100%; background: #f0fdf4; display: flex; align-items: center; justify-content: center; font-size: 26px; }
      .of-item-details { flex: 1; min-width: 0; }
      .of-item-name { font-size: 15px; font-weight: 800; color: #0f172a; text-transform: capitalize; margin: 0 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .of-item-seller { font-size: 12px; color: #94a3b8; font-weight: 500; margin: 0 0 4px; }
      .of-item-price { font-size: 16px; font-weight: 900; color: #16a34a; margin: 0; }
      .of-item-unit { font-size: 12px; font-weight: 500; color: #94a3b8; }
      .of-item-check { width: 32px; height: 32px; border-radius: 50%; background: #16a34a; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; box-shadow: 0 2px 8px rgba(22,163,74,0.3); }

      .of-qty-row { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
      .of-qty-control { display: flex; align-items: center; border: 1.5px solid #e2e8f0; border-radius: 14px; overflow: hidden; background: #fff; box-shadow: 0 2px 8px -2px rgba(0,0,0,0.06); }
      .of-qty-btn { width: 48px; height: 52px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 300; color: #16a34a; background: #f8fafc; border: none; cursor: pointer; transition: background 0.15s; user-select: none; }
      .of-qty-btn:hover { background: #f0fdf4; }
      .of-qty-btn:active { background: #dcfce7; }
      .of-qty-input { width: 68px; height: 52px; text-align: center; font-size: 20px; font-weight: 800; color: #0f172a; border: none; border-left: 1.5px solid #e2e8f0; border-right: 1.5px solid #e2e8f0; outline: none; background: #fff; -moz-appearance: textfield; }
      .of-qty-input::-webkit-outer-spin-button, .of-qty-input::-webkit-inner-spin-button { -webkit-appearance: none; }
      .of-qty-total { display: flex; flex-direction: column; gap: 2px; }
      .of-qty-total-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }
      .of-qty-total-value { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; }

      /* ── Smart Address ── */
      .of-addr-actions { display: flex; flex-direction: column; gap: 10px; }
      .of-addr-action-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        padding: 11px 20px; border-radius: 12px;
        background: linear-gradient(135deg, #f0fdf4, #dcfce7);
        border: 1.5px solid #86efac; color: #15803d;
        font-size: 13.5px; font-weight: 700; cursor: pointer;
        transition: all 0.2s; width: 100%;
        box-shadow: 0 2px 8px -2px rgba(22,163,74,0.15);
        font-family: inherit;
      }
      .of-addr-action-btn:hover:not(:disabled) { background: linear-gradient(135deg, #dcfce7, #bbf7d0); border-color: #4ade80; box-shadow: 0 4px 14px -4px rgba(22,163,74,0.3); transform: translateY(-1px); }
      .of-addr-action-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
      .of-addr-action-btn--success { background: linear-gradient(135deg, #16a34a, #15803d); border-color: #15803d; color: #fff; box-shadow: 0 4px 14px -4px rgba(22,163,74,0.4); }
      .of-addr-action-btn--error { background: linear-gradient(135deg, #fef2f2, #fee2e2); border-color: #fca5a5; color: #dc2626; }
      .of-addr-action-btn--loading { opacity: 0.8; }

      .of-addr-divider { display: flex; align-items: center; gap: 10px; }
      .of-addr-divider::before, .of-addr-divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
      .of-addr-divider span { font-size: 12px; color: #94a3b8; font-weight: 500; white-space: nowrap; }

      .of-addr-gps-error { font-size: 12.5px; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 8px 12px; margin: 0; }

      .of-addr-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .of-addr-full { grid-column: 1 / -1; }
      .of-addr-half { grid-column: span 1; }
      @media(max-width:480px) { .of-addr-half { grid-column: 1 / -1; } }

      .of-addr-field-group { display: flex; flex-direction: column; gap: 6px; }
      .of-addr-field-label { font-size: 11.5px; font-weight: 700; color: #475569; letter-spacing: 0.02em; display: flex; align-items: center; gap: 6px; }
      .of-required { color: #ef4444; font-size: 13px; }

      .of-addr-input-wrap {
        display: flex; align-items: center; gap: 10px;
        padding: 0 14px; border-radius: 12px;
        border: 1.5px solid #e2e8f0; background: #fff;
        height: 46px;
        box-shadow: 0 1px 4px -1px rgba(0,0,0,0.05);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .of-addr-input-wrap:focus-within { border-color: #86efac; box-shadow: 0 0 0 3px rgba(74,222,128,0.12); }
      .of-addr-field-icon { color: #94a3b8; flex-shrink: 0; }
      .of-addr-input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; font-weight: 500; color: #0f172a; font-family: inherit; }
      .of-addr-input::placeholder { color: #c4cdda; }
      .of-addr-input--success { color: #15803d; }

      .of-addr-field-hint { font-size: 11px; color: #94a3b8; font-weight: 500; margin: 0; }
      .of-addr-field-error { font-size: 11.5px; color: #dc2626; font-weight: 600; margin: 0; }

      .of-pin-badge { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; margin-left: 4px; }
      .of-pin-badge--loading { background: #fef3c7; color: #92400e; }
      .of-pin-badge--success { background: #dcfce7; color: #16a34a; }

      .of-addr-preview {
        display: flex; align-items: flex-start; gap: 8px;
        padding: 12px 14px; border-radius: 12px;
        background: linear-gradient(135deg, #f0fdf4, #f8fafc);
        border: 1.5px dashed #86efac;
      }
      .of-addr-preview svg { color: #16a34a; flex-shrink: 0; margin-top: 1px; }
      .of-addr-preview-text { font-size: 13px; font-weight: 600; color: #166534; line-height: 1.5; margin: 0; }

      /* Error */
      .of-error { display: flex; align-items: flex-start; gap: 10px; padding: 14px 16px; border-radius: 12px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 13.5px; font-weight: 600; }

      /* Checkout */
      .of-checkout { padding: 20px 32px 28px; border-top: 1px solid #f0f4f8; background: linear-gradient(180deg, #fff 0%, #f8fafc 100%); }
      .of-total-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
      .of-total-label { font-size: 11.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; margin: 0 0 5px; }
      .of-total-amount { font-size: 34px; font-weight: 900; color: #0f172a; letter-spacing: -0.03em; margin: 0; }
      .of-total-breakdown { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px 14px; min-width: 150px; }
      .of-breakdown-row { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; font-weight: 500; padding: 2px 0; }
      .of-breakdown-divider { height: 1px; background: #e2e8f0; margin: 6px 0; }
      .of-breakdown-total { font-size: 13px; font-weight: 800; color: #0f172a; }

      .of-pay-btn {
        width: 100%; height: 56px;
        display: flex; align-items: center; justify-content: center; gap: 10px;
        background: linear-gradient(135deg, #16a34a 0%, #15803d 60%, #166534 100%);
        color: #fff; font-size: 16px; font-weight: 800; letter-spacing: 0.01em;
        border: none; border-radius: 16px; cursor: pointer;
        box-shadow: 0 6px 20px -4px rgba(22,163,74,0.55), 0 2px 8px -2px rgba(22,163,74,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
        transition: transform 0.15s, box-shadow 0.2s;
        position: relative; overflow: hidden;
        margin-bottom: 12px; font-family: inherit;
      }
      .of-pay-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 60%); pointer-events: none; }
      .of-pay-btn:hover:not(:disabled) { box-shadow: 0 10px 28px -4px rgba(22,163,74,0.6), 0 4px 12px -2px rgba(22,163,74,0.4); transform: translateY(-2px); }
      .of-pay-btn:active:not(:disabled) { transform: translateY(0); }
      .of-pay-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

      .of-spinner { display: inline-block; width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: of-spin 0.8s linear infinite; }
      .of-mini-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(21,128,61,0.3); border-top-color: #15803d; border-radius: 50%; animation: of-spin 0.8s linear infinite; }
      @keyframes of-spin { to { transform: rotate(360deg); } }

      .of-secure-row { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; color: #94a3b8; font-weight: 500; }
      .of-secure-row strong { color: #16a34a; font-weight: 700; }

      .of-empty-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f0fdf4, #f8fafc); }
      .of-empty-card { text-align: center; padding: 56px 48px; background: #fff; border-radius: 28px; box-shadow: 0 20px 60px -15px rgba(0,0,0,0.12); max-width: 380px; }
      .of-empty-icon { font-size: 52px; margin-bottom: 20px; }
      .of-empty-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px; }
      .of-empty-sub { font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 28px; }
      .of-empty-btn { display: inline-flex; align-items: center; gap: 6px; padding: 12px 24px; border-radius: 12px; background: #16a34a; color: #fff; font-size: 14px; font-weight: 700; border: none; cursor: pointer; transition: background 0.2s, transform 0.15s; font-family: inherit; }
      .of-empty-btn:hover { background: #15803d; transform: translateY(-1px); }
    `}</style>
  );
}
