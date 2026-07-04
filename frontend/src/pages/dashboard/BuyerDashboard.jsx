import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatPrice, formatDate } from "../../utils/formatters";
import useAuth from "../../hooks/useAuth";
import axiosInstance from "../../utils/axiosInstance";
 
// ── Status badge config (unchanged — same colors/labels/logic) ──────────────
const ORDER_STATUS = {
  delivered: { label: "Delivered", bg: "#dcfce7", color: "#166534", border: "#86efac", icon: "✅" },
  shipped:   { label: "Shipped",   bg: "#dbeafe", color: "#1e40af", border: "#93c5fd", icon: "🚚" },
  confirmed: { label: "Confirmed", bg: "#fef3c7", color: "#92400e", border: "#fcd34d", icon: "📋" },
  placed:    { label: "Placed",    bg: "#f3f4f6", color: "#374151", border: "#d1d5db", icon: "🛒" },
  cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#991b1b", border: "#fca5a5", icon: "❌" },
};
 
const PAYMENT_STATUS = {
  paid:    { label: "Paid",    bg: "#dcfce7", color: "#166534", border: "#86efac" },
  pending: { label: "Pending", bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
  failed:  { label: "Failed",  bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
};
 
// ── StatusBadge (unchanged) ──────────────────────────────────────────────────
function StatusBadge({ status, map }) {
  const cfg = map[status] || map[Object.keys(map)[0]];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "4px 12px", borderRadius: "999px",
      fontSize: "11px", fontWeight: 700,
      background: cfg.bg, color: cfg.color,
      border: `1.5px solid ${cfg.border}`,
      whiteSpace: "nowrap",
    }}>
      {cfg.icon && <span>{cfg.icon}</span>}
      {cfg.label}
    </span>
  );
}
 
// ── Small inline icons — same convention as FarmerDashboard.jsx ─────────────
const Icon = {
  leaf: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M11 20A7 7 0 0 1 4 13c0-6 6-10 15-11 1 9-3 15-11 15Z" /><path d="M4 20 12 12" />
    </svg>
  ),
  cart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  heart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  ),
  clock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" />
    </svg>
  ),
  bell: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  ),
};
 
// ── Small reusable stat card (same shape as FarmerDashboard's StatCard) ──────
const StatCard = ({ icon, label, value, sub, accent = 'green' }) => (
  <div className="bd-stat-card">
    <div className="bd-stat-top">
      <div className={`bd-stat-icon bd-stat-icon--${accent}`}>{icon}</div>
    </div>
    <p className={`bd-stat-value bd-stat-value--${accent}`}>{value}</p>
    <p className="bd-stat-label">{label}</p>
    {sub && <p className="bd-stat-sub">{sub}</p>}
  </div>
);
 
// ── Empty state (same shape as FarmerDashboard's empty state) ───────────────
function EmptyState({ icon, title, sub, ctaTo, ctaLabel }) {
  return (
    <div className="bd-empty-state">
      <span className="bd-empty-icon">{icon}</span>
      <p className="bd-empty-text">{title}</p>
      {sub && <p className="bd-empty-sub">{sub}</p>}
      {ctaTo && (
        <Link to={ctaTo} className="bd-empty-cta">{ctaLabel}</Link>
      )}
    </div>
  );
}
 
// ── Loader ────────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div className="bd-loader">
      <div className="bd-loader-icon">🌾</div>
      <p className="bd-loader-text">Loading your dashboard...</p>
    </div>
  );
}
 
// ── Main Component ────────────────────────────────────────────────────────────
export default function BuyerDashboard() {
  const [activeTab, setActiveTab]       = useState("orders");
  const [orders, setOrders]             = useState([]);
  const [wishlist, setWishlist]         = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const { name, email, user }           = useAuth();
 
  // ── Fetch all data on mount ─────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
 
      // 1. My real orders from backend
      const ordersRes = await axiosInstance.get("/v1/orders/my").catch(() => ({ data: { data: [] } }));
      const fetchedOrders = ordersRes.data.data || [];
      setOrders(fetchedOrders);
 
      // 2. Wishlist — fetch all listings, filter by wishlistedBy containing current user
      const listingsRes = await axiosInstance.get("/v1/listing?limit=1000").catch(() => ({ data: { data: { listings: [] } } }));
      const allListings = listingsRes.data.data?.listings || listingsRes.data.data || [];
      const userId = user?._id?.toString();
      const myWishlist = allListings.filter(item =>
        Array.isArray(item.wishlistedBy) &&
        item.wishlistedBy.some(id => id.toString() === userId)
      ).map(item => ({
        _id:          item._id,
        crop:         item.cropName,
        quantity:     item.quantity,
        pricePerUnit: item.pricePerUnit,
        farmer:       item.farmer?.name || "—",
        unit:         item.unit || "quintal",
        location:     item.location,
        images:       Array.isArray(item.images)
                        ? item.images.map(img => (typeof img === "string" ? img : img?.url)).filter(Boolean)
                        : [],
      }));
      setWishlist(myWishlist);
 
      // 3. Recently viewed — stored in localStorage by CropDetail page
      const recent = JSON.parse(localStorage.getItem("agriconnect_recent_viewed") || "[]");
      setRecentlyViewed(recent);
 
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    if (user?._id) fetchData();
  }, [user?._id]);
 
  // ── Cancel order ────────────────────────────────────────────────────────
  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order? This cannot be undone.")) return;
    try {
      setCancellingId(orderId);
      await axiosInstance.patch(`/v1/orders/${orderId}/cancel`);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: "cancelled" } : o));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancellingId(null);
    }
  };
 
  // ── Derived stats ───────────────────────────────────────────────────────
  const activeOrders = orders.filter(o => !["cancelled", "delivered"].includes(o.orderStatus)).length;
  const totalSpent   = orders.filter(o => o.paymentStatus === "paid").reduce((s, o) => s + (o.totalPrice || 0), 0);
 
  const navItems = [
    { key: "orders",          label: "My Orders",       icon: Icon.cart,  count: orders.length },
    { key: "wishlist",        label: "Saved Wishlist",  icon: Icon.heart, count: wishlist.length },
    { key: "recently-viewed", label: "Recently Viewed", icon: Icon.clock, count: recentlyViewed.length },
  ];
 
  const activeLabel = navItems.find(t => t.key === activeTab)?.label || "";
 
  return (
    <div className="bd-page">
      <div className="bd-shell">
        {/* ── Sidebar ── */}
        <aside className="bd-sidebar">
          <Link to="/" className="bd-brand">
            <div className="bd-brand-icon">
              <Icon.leaf width={18} height={18} />
            </div>
            <div>
              <p className="bd-brand-name">AgriConnect</p>
              <p className="bd-brand-sub">Buyer Console</p>
            </div>
          </Link>
 
          <nav className="bd-nav">
            {navItems.map((item) => {
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`bd-nav-item${active ? ' bd-nav-item--active' : ''}`}
                >
                  <item.icon width={18} height={18} className="bd-nav-icon" />
                  <span>{item.label}</span>
                  <span className="bd-nav-count">{item.count}</span>
                  {active && <span className="bd-nav-dot" />}
                </button>
              );
            })}
          </nav>
 
          <div className="bd-sidebar-cta">
            <Link to="/marketplace" className="bd-browse-btn">
              Browse Marketplace
            </Link>
          </div>
 
          <div className="bd-profile-card">
            <p className="bd-profile-label">Signed in as</p>
            <div className="bd-profile-row">
              <div className="bd-profile-avatar">{(name || 'Buyer').charAt(0).toUpperCase()}</div>
              <div className="bd-profile-info">
                <p className="bd-profile-name">{name || 'Buyer'}</p>
                <p className="bd-profile-role">Buyer account</p>
              </div>
            </div>
          </div>
        </aside>
 
        {/* ── Main ── */}
        <div className="bd-main">
          <header className="bd-topbar">
            <div>
              <p className="bd-topbar-eyebrow">Buyer Console</p>
              <h1 className="bd-topbar-title">{activeLabel}</h1>
            </div>
            <button className="bd-bell-btn">
              <Icon.bell width={18} height={18} />
            </button>
          </header>
 
          <main className="bd-content">
            <div className="bd-page-head">
              <h2 className="bd-page-title">🛒 Welcome back, {name || 'Buyer'}</h2>
              <p className="bd-page-subtitle">
                Track your crop purchases, manage your wishlist, and stay updated on your order status.
              </p>
            </div>
 
            {/* Error banner */}
            {error && (
              <div className="bd-error-banner">
                <span>⚠️ {error}</span>
                <button onClick={fetchData} className="bd-retry-btn">Retry</button>
              </div>
            )}
 
            {loading && <Loader />}
 
            {!loading && (
              <>
                {/* ── Stats row ── */}
                <div className="bd-stats-grid">
                  <StatCard icon="📦" label="Total Orders" value={orders.length} accent="green" />
                  <StatCard icon="⏳" label="Active Orders" value={activeOrders} accent="sky" />
                  <StatCard icon="💚" label="Wishlist Items" value={wishlist.length} accent="violet" />
                  <StatCard icon="💰" label="Total Spent" value={formatPrice(totalSpent)} sub="from paid orders" accent="gold" />
                  <StatCard icon="🕒" label="Recently Viewed" value={recentlyViewed.length} accent="rose" />
                </div>
 
                {/* ── Mobile tab bar (mirrors sidebar) ── */}
                <div className="bd-mobile-tabs">
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`bd-mobile-tab${activeTab === item.key ? ' bd-mobile-tab--active' : ''}`}
                    >
                      {item.label} <span className="bd-mobile-tab-count">{item.count}</span>
                    </button>
                  ))}
                </div>
 
                {/* ═══════════════════════════════════════════════
                    TAB: MY ORDERS
                ═══════════════════════════════════════════════ */}
                {activeTab === "orders" && (
                  <div className="bd-list">
                    {orders.length === 0 ? (
                      <EmptyState
                        icon="📦"
                        title="No orders yet"
                        sub="Browse the marketplace to place your first crop order."
                        ctaTo="/marketplace"
                        ctaLabel="+ Browse the marketplace"
                      />
                    ) : (
                      orders.map((order) => {
                        const canCancel = ["placed", "confirmed"].includes(order.orderStatus);
                        const imgSrc = order.listing?.images?.[0]?.url || order.listing?.images?.[0];
 
                        return (
                          <div key={order._id} className="bd-item-card">
                            <div className="bd-item-top">
                              <div className="bd-thumb">
                                {imgSrc ? <img src={imgSrc} alt={order.cropName} className="bd-thumb-img" /> : <div className="bd-thumb-fallback">🌾</div>}
                              </div>
                              <div className="bd-item-info">
                                <p className="bd-item-name">{order.cropName}</p>
                                <p className="bd-item-sub">ID: {order._id?.slice(-6)}</p>
                              </div>
                              <div className="bd-item-badges">
                                <StatusBadge status={order.orderStatus} map={ORDER_STATUS} />
                                <StatusBadge status={order.paymentStatus} map={PAYMENT_STATUS} />
                              </div>
                            </div>
 
                            <div className="bd-meta-grid">
                              <div className="bd-meta-cell">
                                <p className="bd-meta-label">Quantity</p>
                                <p className="bd-meta-value">{order.quantity} {order.unit}</p>
                              </div>
                              <div className="bd-meta-cell">
                                <p className="bd-meta-label">Total Price</p>
                                <p className="bd-meta-value bd-meta-value--accent">{formatPrice(order.totalPrice)}</p>
                              </div>
                              <div className="bd-meta-cell">
                                <p className="bd-meta-label">Farmer</p>
                                <p className="bd-meta-value">{order.farmer?.name || "—"}</p>
                              </div>
                              <div className="bd-meta-cell">
                                <p className="bd-meta-label">Ordered</p>
                                <p className="bd-meta-value">{formatDate(order.createdAt)}</p>
                              </div>
                            </div>
 
                            <div className="bd-item-actions">
                              {canCancel ? (
                                <button
                                  onClick={() => handleCancel(order._id)}
                                  disabled={cancellingId === order._id}
                                  className="bd-btn bd-btn--danger"
                                >
                                  {cancellingId === order._id ? "Cancelling..." : "Cancel Order"}
                                </button>
                              ) : (
                                <span className="bd-no-action">No actions available</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
 
                {/* ═══════════════════════════════════════════════
                    TAB: SAVED WISHLIST
                ═══════════════════════════════════════════════ */}
                {activeTab === "wishlist" && (
                  <div className="bd-list">
                    {wishlist.length === 0 ? (
                      <EmptyState
                        icon="💚"
                        title="Your wishlist is empty"
                        sub="Tap the heart icon on any crop listing in the marketplace to save it here."
                      />
                    ) : (
                      wishlist.map((item) => (
                        <div key={item._id} className="bd-item-card">
                          <div className="bd-item-top">
                            <div className="bd-thumb">
                              {item.images?.[0] ? <img src={item.images[0]} alt={item.crop} className="bd-thumb-img" /> : <div className="bd-thumb-fallback">🌿</div>}
                            </div>
                            <div className="bd-item-info">
                              <p className="bd-item-name">{item.crop}</p>
                              <p className="bd-item-sub">{item.location?.district}, {item.location?.state}</p>
                            </div>
                          </div>
 
                          <div className="bd-meta-grid">
                            <div className="bd-meta-cell">
                              <p className="bd-meta-label">Quantity</p>
                              <p className="bd-meta-value">{item.quantity} {item.unit}</p>
                            </div>
                            <div className="bd-meta-cell">
                              <p className="bd-meta-label">Price / Unit</p>
                              <p className="bd-meta-value bd-meta-value--accent">{formatPrice(item.pricePerUnit)}</p>
                            </div>
                            <div className="bd-meta-cell">
                              <p className="bd-meta-label">Farmer</p>
                              <p className="bd-meta-value">{item.farmer}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
 
                {/* ═══════════════════════════════════════════════
                    TAB: RECENTLY VIEWED
                ═══════════════════════════════════════════════ */}
                {activeTab === "recently-viewed" && (
                  <div className="bd-list">
                    {recentlyViewed.length === 0 ? (
                      <EmptyState
                        icon="🕒"
                        title="Nothing viewed recently"
                        sub="Crops you open in the marketplace will automatically appear here."
                      />
                    ) : (
                      recentlyViewed.map((item, i) => (
                        <div key={item._id || i} className="bd-item-card">
                          <div className="bd-item-top">
                            <div className="bd-thumb">
                              {item.images?.[0] ? <img src={item.images[0]} alt={item.cropName || item.name} className="bd-thumb-img" /> : <div className="bd-thumb-fallback">🕒</div>}
                            </div>
                            <div className="bd-item-info">
                              <p className="bd-item-name">{item.cropName || item.name}</p>
                            </div>
                          </div>
 
                          <div className="bd-meta-grid">
                            <div className="bd-meta-cell">
                              <p className="bd-meta-label">Quantity</p>
                              <p className="bd-meta-value">{item.quantity} {item.unit || "quintal"}</p>
                            </div>
                            <div className="bd-meta-cell">
                              <p className="bd-meta-label">Price / Unit</p>
                              <p className="bd-meta-value bd-meta-value--accent">{formatPrice(item.pricePerUnit)}</p>
                            </div>
                            <div className="bd-meta-cell">
                              <p className="bd-meta-label">Farmer</p>
                              <p className="bd-meta-value">{item.farmer?.name || item.farmer || "—"}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
 
      {/* ─────────────────────────────────────────────────────────
          Scoped styles — plain CSS, mirroring FarmerDashboard.jsx's
          structure and tokens exactly (gold/green glass, same
          farmer-bg.jpg photo), so this page reads as the same
          product just re-skinned for the buyer role.
         ───────────────────────────────────────────────────────── */}
      <style>{`
        .bd-page {
          min-height: 100vh;
          padding: 26px;
          background:
            linear-gradient(160deg, rgba(255,251,235,0.30) 0%, rgba(240,253,224,0.24) 45%, rgba(255,247,204,0.30) 100%),
            radial-gradient(circle at 15% 8%, rgba(250,204,21,0.14), transparent 45%),
            radial-gradient(circle at 90% 88%, rgba(132,204,22,0.14), transparent 50%),
            url('/images/buyer-bg.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        }
        .bd-shell {
          display: flex;
          min-height: calc(100vh - 52px);
          background: rgba(255,255,255,0.22);
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 24px 60px -14px rgba(120,90,10,0.28), 0 2px 10px rgba(0,0,0,0.08);
          border: 1px solid rgba(255,255,255,0.55);
        }
 
        /* ── Sidebar ── */
        .bd-sidebar {
          position: sticky; top: 0;
          display: flex; flex-direction: column;
          width: 264px; flex-shrink: 0;
          height: calc(100vh - 52px);
          background: rgba(255,255,255,0.4);
          border-right: 1px solid rgba(234,179,8,0.18);
        }
        .bd-brand {
          display: flex; align-items: center; gap: 11px;
          padding: 26px 22px 22px;
          text-decoration: none; cursor: pointer;
          transition: opacity 0.15s ease;
        }
        .bd-brand:hover { opacity: 0.8; }
        .bd-brand-icon {
          display: grid; place-items: center;
          width: 38px; height: 38px; border-radius: 12px;
          background: linear-gradient(135deg, #FACC15, #65A30D);
          color: #fff;
          box-shadow: 0 4px 12px rgba(202,138,4,0.3);
          flex-shrink: 0;
        }
        .bd-brand-name { font-size: 15px; font-weight: 600; color: #1F2937; line-height: 1.3; }
        .bd-brand-sub { font-size: 11.5px; font-weight: 500; color: #92702A; margin-top: 1px; letter-spacing: 0.02em; }
 
        .bd-nav { display: flex; flex-direction: column; gap: 4px; padding: 8px 14px; flex: 1; }
        .bd-nav-item {
          display: flex; align-items: center; gap: 12px;
          width: 100%; padding: 10px 14px; border: none;
          background: transparent; border-radius: 11px;
          font-size: 14px; font-weight: 500; color: #57534E;
          cursor: pointer; text-align: left;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .bd-nav-item:hover { background: rgba(255,255,255,0.5); color: #1F2937; }
        .bd-nav-item--active {
          background: linear-gradient(135deg, #FACC15, #65A30D);
          color: #fff;
          box-shadow: 0 4px 14px rgba(101,163,13,0.35);
        }
        .bd-nav-icon { color: #A8A29E; flex-shrink: 0; }
        .bd-nav-item--active .bd-nav-icon { color: #fff; }
        .bd-nav-item span:first-of-type { flex: 1; }
        .bd-nav-count {
          font-size: 11px; font-weight: 700; padding: 1px 8px; border-radius: 999px;
          background: rgba(0,0,0,0.06); color: #78716C;
        }
        .bd-nav-item--active .bd-nav-count { background: rgba(255,255,255,0.25); color: #fff; }
        .bd-nav-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; flex-shrink: 0; margin-left: 6px; }
 
        .bd-sidebar-cta { padding: 6px 14px 4px; }
        .bd-browse-btn {
          display: block; text-align: center;
          padding: 10px 14px; border-radius: 11px;
          background: linear-gradient(135deg, #FACC15, #CA8A04);
          color: #fff; font-size: 13.5px; font-weight: 600;
          text-decoration: none;
          box-shadow: 0 6px 16px rgba(202,138,4,0.32);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .bd-browse-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(202,138,4,0.4); }
 
        .bd-profile-card {
          margin: 18px 14px 22px; padding: 14px; border-radius: 14px;
          background: rgba(255,255,255,0.5);
          border: 1px solid rgba(234,179,8,0.15);
        }
        .bd-profile-label { font-size: 11.5px; font-weight: 500; color: #92702A; margin-bottom: 10px; }
        .bd-profile-row { display: flex; align-items: center; gap: 10px; }
        .bd-profile-avatar {
          display: grid; place-items: center;
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #FACC15, #65A30D); color: #fff;
          font-size: 12px; font-weight: 700; flex-shrink: 0;
        }
        .bd-profile-name { font-size: 13.5px; font-weight: 600; color: #1F2937; }
        .bd-profile-role { font-size: 11.5px; color: #92702A; margin-top: 1px; }
 
        /* ── Main / Topbar ── */
        .bd-main { flex: 1; min-width: 0; }
        .bd-topbar {
          position: sticky; top: 0; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 32px;
          background: rgba(255,255,255,0.3);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(234,179,8,0.15);
        }
        .bd-topbar-eyebrow { font-size: 12px; font-weight: 600; color: #A16207; margin-bottom: 2px; letter-spacing: 0.04em; text-transform: uppercase; }
        .bd-topbar-title { font-size: 18px; font-weight: 600; color: #1F2937; }
        .bd-bell-btn {
          display: grid; place-items: center;
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid rgba(234,179,8,0.2); background: rgba(255,255,255,0.5); color: #57534E;
          cursor: pointer;
        }
        .bd-bell-btn:hover { background: rgba(250,204,21,0.16); color: #A16207; }
 
        .bd-content { padding: 32px; max-width: 1200px; }
        .bd-page-head { margin-bottom: 28px; }
        .bd-page-title { font-size: 24px; font-weight: 700; color: #1F2937; letter-spacing: -0.01em; }
        .bd-page-subtitle { font-size: 14px; color: #6B5A2E; margin-top: 6px; }
 
        /* ── Error banner ── */
        .bd-error-banner {
          margin-bottom: 20px; padding: 12px 18px; border-radius: 13px;
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.28); color: #DC2626;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          font-size: 13.5px; font-weight: 600;
        }
        .bd-retry-btn { padding: 6px 14px; border-radius: 8px; background: #DC2626; color: #fff; border: none; cursor: pointer; font-size: 12px; font-weight: 700; }
 
        /* ── Stats ── */
        .bd-stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 28px; }
        .bd-stat-card {
          background: rgba(255,255,255,0.45);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 18px; padding: 20px;
          backdrop-filter: blur(12px);
          transition: box-shadow 0.15s ease, transform 0.15s ease;
        }
        .bd-stat-card:hover { box-shadow: 0 10px 24px rgba(120,90,10,0.14); transform: translateY(-1px); }
        .bd-stat-top { margin-bottom: 10px; }
        .bd-stat-icon {
          display: inline-grid; place-items: center;
          width: 40px; height: 40px; border-radius: 12px; font-size: 19px;
        }
        .bd-stat-icon--green  { background: rgba(101,163,13,0.14); }
        .bd-stat-icon--sky    { background: rgba(14,165,233,0.12); }
        .bd-stat-icon--gold   { background: rgba(250,204,21,0.18); }
        .bd-stat-icon--violet { background: rgba(168,85,247,0.12); }
        .bd-stat-icon--rose   { background: rgba(239,68,68,0.10); }
        .bd-stat-value { font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
        .bd-stat-value--green  { color: #4D7C0F; }
        .bd-stat-value--sky    { color: #0369A1; }
        .bd-stat-value--gold   { color: #A16207; }
        .bd-stat-value--violet { color: #7E22CE; }
        .bd-stat-value--rose   { color: #DC2626; }
        .bd-stat-label { font-size: 13.5px; color: #57534E; margin-top: 2px; }
        .bd-stat-sub { font-size: 11.5px; color: #A8A29E; margin-top: 2px; }
 
        /* ── Mobile tabs ── */
        .bd-mobile-tabs { display: none; }
 
        /* ── Lists / cards ── */
        .bd-list { display: flex; flex-direction: column; gap: 12px; }
        .bd-empty-state {
          background: rgba(255,255,255,0.4);
          border: 1px dashed rgba(234,179,8,0.35);
          border-radius: 18px;
          display: flex; flex-direction: column; align-items: center;
          padding: 56px 20px; color: #A8A29E; text-align: center;
        }
        .bd-empty-icon { font-size: 42px; margin-bottom: 10px; }
        .bd-empty-text { font-weight: 500; color: #78716C; }
        .bd-empty-sub { font-size: 12.5px; color: #A8A29E; margin-top: 4px; max-width: 320px; }
        .bd-empty-cta { margin-top: 14px; font-size: 13.5px; color: #4D7C0F; font-weight: 600; text-decoration: none; }
        .bd-empty-cta:hover { text-decoration: underline; }
 
        .bd-item-card {
          background: rgba(255,255,255,0.45);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 18px; padding: 18px;
          backdrop-filter: blur(10px);
          display: flex; flex-direction: column; gap: 16px;
        }
        .bd-item-top { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .bd-thumb { width: 56px; height: 56px; border-radius: 14px; overflow: hidden; background: rgba(0,0,0,0.05); flex-shrink: 0; }
        .bd-thumb-img { width: 100%; height: 100%; object-fit: cover; }
        .bd-thumb-fallback { width: 100%; height: 100%; display: grid; place-items: center; font-size: 22px; }
        .bd-item-info { flex: 1; min-width: 120px; }
        .bd-item-name { font-weight: 600; color: #1F2937; font-size: 14.5px; }
        .bd-item-sub { font-size: 12px; color: #A8A29E; margin-top: 2px; }
        .bd-item-badges { display: flex; gap: 8px; flex-wrap: wrap; }
 
        .bd-meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .bd-meta-cell { background: rgba(255,255,255,0.5); border: 1px solid rgba(0,0,0,0.05); border-radius: 12px; padding: 10px 13px; }
        .bd-meta-label { font-size: 11px; color: #A8A29E; margin-bottom: 2px; }
        .bd-meta-value { font-size: 13.5px; font-weight: 600; color: #1F2937; }
        .bd-meta-value--accent { color: #4D7C0F; }
 
        .bd-item-actions { display: flex; justify-content: flex-end; }
        .bd-no-action { font-size: 12px; color: #A8A29E; font-style: italic; }
 
        /* ── Buttons ── */
        .bd-btn {
          font-size: 12.5px; font-weight: 600; padding: 8px 16px;
          border-radius: 9px; border: 1px solid transparent;
          cursor: pointer; transition: background 0.15s ease, opacity 0.15s ease;
        }
        .bd-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .bd-btn--danger { background: rgba(239,68,68,0.12); color: #DC2626; }
        .bd-btn--danger:hover { background: rgba(239,68,68,0.2); }
 
        /* ── Loader ── */
        .bd-loader { text-align: center; padding: 80px 20px; }
        .bd-loader-icon { font-size: 48px; margin-bottom: 14px; animation: bd-pulse 1.5s ease-in-out infinite; }
        .bd-loader-text { color: #4D7C0F; font-weight: 600; font-size: 15px; }
        @keyframes bd-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
 
        /* ── Responsive ── */
        @media (max-width: 900px) {
          .bd-page { padding: 0; }
          .bd-shell { border-radius: 0; min-height: 100vh; border: none; }
          .bd-sidebar { display: none; }
          .bd-content { padding: 18px; }
          .bd-topbar { padding: 14px 18px; }
          .bd-stats-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
          .bd-meta-grid { grid-template-columns: 1fr 1fr; }
          .bd-mobile-tabs { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 20px; padding-bottom: 4px; }
          .bd-mobile-tab {
            flex-shrink: 0; white-space: nowrap; padding: 9px 16px; border-radius: 999px;
            border: 1px solid rgba(234,179,8,0.25); background: rgba(255,255,255,0.5);
            color: #57534E; font-size: 13.5px; font-weight: 500; cursor: pointer;
            display: flex; align-items: center; gap: 6px;
          }
          .bd-mobile-tab-count { font-size: 10.5px; font-weight: 700; padding: 1px 7px; border-radius: 999px; background: rgba(0,0,0,0.06); }
          .bd-mobile-tab--active { background: linear-gradient(135deg, #FACC15, #65A30D); border-color: transparent; color: #fff; }
          .bd-mobile-tab--active .bd-mobile-tab-count { background: rgba(255,255,255,0.25); color: #fff; }
        }
        @media (max-width: 560px) {
          .bd-stats-grid { grid-template-columns: 1fr; }
          .bd-meta-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}