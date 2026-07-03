import { useState, useEffect } from "react";
import { formatPrice, formatDate } from "../../utils/formatters";
import Navbar from "../../components/common/Navbar";
import useAuth from "../../hooks/useAuth";
import axiosInstance from "../../utils/axiosInstance";

// ── Status badge config ──────────────────────────────────────────────────────
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

// ── StatusBadge ──────────────────────────────────────────────────────────────
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

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: "56px", marginBottom: "14px" }}>{icon}</div>
      <p style={{ fontSize: "16px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>{title}</p>
      <p style={{ fontSize: "13px", color: "#9ca3af" }}>{sub}</p>
    </div>
  );
}

// ── Loader ────────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: "48px", marginBottom: "14px", animation: "pulse 1.5s ease-in-out infinite" }}>🌾</div>
      <p style={{ color: "#16a34a", fontWeight: 600, fontSize: "15px" }}>Loading your dashboard...</p>
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

  const TABS = [
    { id: "orders",          label: "My Orders",       icon: "📦", count: orders.length },
    { id: "wishlist",        label: "Saved Wishlist",  icon: "💚", count: wishlist.length },
    { id: "recently-viewed", label: "Recently Viewed", icon: "🕒", count: recentlyViewed.length },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f0fdf4 0%, #f7fef9 40%, #ecfdf5 80%, #f0fdfa 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <Navbar />

      {/* ── Hero Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #052e16 0%, #14532d 40%, #166534 70%, #065f46 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:"-60px", right:"180px", width:"260px", height:"260px", borderRadius:"50%", background:"rgba(134,239,172,0.07)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-40px", left:"80px", width:"180px", height:"180px", borderRadius:"50%", background:"rgba(52,211,153,0.06)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"20px", left:"50%", width:"120px", height:"120px", borderRadius:"50%", background:"rgba(167,243,208,0.05)", pointerEvents:"none" }} />

        <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"36px 48px", position:"relative", zIndex:1 }}>
          <div style={{ color:"#86efac", fontSize:"11px", fontWeight:700, letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:"10px" }}>
            AgriConnect • Buyer Dashboard
          </div>

          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:"32px", flexWrap:"wrap" }}>
            <div>
              <h1 style={{ margin:0, color:"#fff", fontSize:"32px", fontWeight:900, letterSpacing:"-0.5px", lineHeight:1.15 }}>
                🛒 Welcome back, {name || "Buyer"}!
              </h1>
              <p style={{ margin:"10px 0 0", color:"#a7f3d0", fontSize:"15px", fontWeight:400, maxWidth:"520px", lineHeight:1.6 }}>
                Track your crop purchases, manage your wishlist, and stay updated on your order status — all in one place.
              </p>
            </div>

            {/* Account mini-card */}
            <div style={{
              background: "rgba(255,255,255,0.08)",
              border: "1.5px solid rgba(134,239,172,0.25)",
              borderRadius: "16px",
              padding: "18px 24px",
              backdropFilter: "blur(10px)",
              minWidth: "220px",
            }}>
              <p style={{ margin:0, color:"#86efac", fontSize:"10px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", marginBottom:"10px" }}>Account</p>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
                <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"linear-gradient(135deg,#16a34a,#059669)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ color:"#fff", fontWeight:800, fontSize:"14px" }}>{(name || "B")[0].toUpperCase()}</span>
                </div>
                <div>
                  <p style={{ margin:0, color:"#fff", fontWeight:700, fontSize:"14px" }}>{name || "Buyer"}</p>
                  <p style={{ margin:0, color:"#a7f3d0", fontSize:"11px" }}>{email || "—"}</p>
                </div>
              </div>
              <div style={{ background:"rgba(134,239,172,0.15)", borderRadius:"8px", padding:"6px 10px", display:"inline-flex", alignItems:"center", gap:"6px" }}>
                <span style={{ color:"#6ee7b7", fontSize:"10px" }}>🟢</span>
                <span style={{ color:"#a7f3d0", fontSize:"11px", fontWeight:600 }}>Buyer Account · Live Data</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ribbon ── */}
        <div style={{ background:"rgba(0,0,0,0.18)", borderTop:"1px solid rgba(134,239,172,0.12)" }}>
          <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"14px 48px", display:"flex", gap:"40px", alignItems:"center", flexWrap:"wrap" }}>
            {[
              { val: orders.length,          label: "Total Orders",    icon: "📦" },
              { val: activeOrders,           label: "Active Orders",   icon: "⏳" },
              { val: wishlist.length,        label: "Wishlist Items",  icon: "💚" },
              { val: formatPrice(totalSpent),label: "Total Spent",     icon: "💰" },
              { val: recentlyViewed.length,  label: "Recently Viewed", icon: "🕒" },
            ].map(s => (
              <div key={s.label} style={{ display:"flex", alignItems:"center", gap:"9px" }}>
                <span style={{ fontSize:"16px" }}>{s.icon}</span>
                <div>
                  <span style={{ color:"#fff", fontWeight:800, fontSize:"16px", marginRight:"6px" }}>{s.val}</span>
                  <span style={{ color:"#6ee7b7", fontSize:"11px", fontWeight:500 }}>{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"36px 48px 64px" }}>

        {/* Error banner */}
        {error && (
          <div style={{ marginBottom:"20px", padding:"14px 20px", borderRadius:"12px", background:"#fee2e2", border:"1.5px solid #fca5a5", color:"#991b1b", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px" }}>
            <span style={{ fontWeight:600, fontSize:"14px" }}>⚠️ {error}</span>
            <button onClick={fetchData} style={{ padding:"6px 14px", borderRadius:"8px", background:"#991b1b", color:"#fff", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:700 }}>
              Retry
            </button>
          </div>
        )}

        {/* ── Tab Bar ── */}
        <div style={{ display:"flex", gap:"10px", marginBottom:"28px", flexWrap:"wrap", alignItems:"center" }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display:"flex", alignItems:"center", gap:"8px",
                  padding:"10px 22px",
                  borderRadius:"999px",
                  fontSize:"13px", fontWeight:700,
                  cursor:"pointer",
                  border: isActive ? "2px solid #166534" : "2px solid #d1fae5",
                  background: isActive ? "#166534" : "#fff",
                  color: isActive ? "#fff" : "#374151",
                  boxShadow: isActive ? "0 4px 16px rgba(22,101,52,0.25)" : "0 1px 4px rgba(0,0,0,0.07)",
                  transform: isActive ? "translateY(-2px)" : "scale(1)",
                  transition: "all 0.18s ease",
                  outline: "none",
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
                <span style={{
                  padding:"2px 9px", borderRadius:"999px", fontSize:"11px",
                  background: isActive ? "rgba(255,255,255,0.2)" : "#dcfce7",
                  color: isActive ? "#fff" : "#166534",
                  fontWeight:800,
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Loading state ── */}
        {loading ? (
          <div style={{ background:"#fff", borderRadius:"20px", border:"1.5px solid #d1fae5", boxShadow:"0 4px 24px rgba(22,101,52,0.07)" }}>
            <Loader />
          </div>
        ) : (
          <>
            {/* ── Orders Tab ── */}
            {activeTab === "orders" && (
              <div style={{ background:"#fff", borderRadius:"20px", border:"1.5px solid #d1fae5", overflow:"hidden", boxShadow:"0 4px 24px rgba(22,101,52,0.07)" }}>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1.2fr 1.2fr 1.2fr 1.5fr 1fr", padding:"14px 24px", background:"linear-gradient(90deg,#f0fdf4,#ecfdf5)", borderBottom:"1.5px solid #d1fae5" }}>
                  {["Crop", "Quantity", "Total Price", "Order Status", "Payment", "Farmer & Date", "Action"].map(h => (
                    <span key={h} style={{ fontSize:"11px", fontWeight:800, color:"#166534", textTransform:"uppercase", letterSpacing:"0.8px" }}>{h}</span>
                  ))}
                </div>

                {orders.length === 0
                  ? <EmptyState icon="📦" title="No orders yet" sub="Browse the marketplace to place your first crop order." />
                  : orders.map((order, i) => {
                    const canCancel = ["placed", "confirmed"].includes(order.orderStatus);
                    const imgSrc = order.listing?.images?.[0]?.url || order.listing?.images?.[0];

                    return (
                      <div
                        key={order._id}
                        style={{
                          display:"grid", gridTemplateColumns:"2fr 1fr 1.2fr 1.2fr 1.2fr 1.5fr 1fr",
                          padding:"16px 24px",
                          borderBottom: i < orders.length - 1 ? "1px solid #f0fdf4" : "none",
                          alignItems:"center",
                          transition:"background 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        {/* Crop */}
                        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                          <div style={{ width:"40px", height:"40px", borderRadius:"10px", background:"linear-gradient(135deg,#dcfce7,#bbf7d0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0, overflow:"hidden" }}>
                            {imgSrc
                              ? <img src={imgSrc} alt={order.cropName} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                              : "🌾"}
                          </div>
                          <div>
                            <p style={{ margin:0, fontWeight:700, color:"#111827", fontSize:"14px" }}>{order.cropName}</p>
                            <p style={{ margin:0, fontSize:"11px", color:"#9ca3af" }}>ID: {order._id?.slice(-6)}</p>
                          </div>
                        </div>

                        {/* Quantity */}
                        <span style={{ fontSize:"13px", color:"#374151", fontWeight:600 }}>
                          {order.quantity} <span style={{ color:"#9ca3af", fontWeight:400 }}>{order.unit}</span>
                        </span>

                        {/* Total */}
                        <span style={{ fontSize:"15px", fontWeight:800, color:"#166534" }}>
                          {formatPrice(order.totalPrice)}
                        </span>

                        {/* Order Status */}
                        <StatusBadge status={order.orderStatus} map={ORDER_STATUS} />

                        {/* Payment */}
                        <StatusBadge status={order.paymentStatus} map={PAYMENT_STATUS} />

                        {/* Farmer & Date */}
                        <div>
                          <p style={{ margin:0, fontSize:"13px", fontWeight:600, color:"#374151" }}>
                            👨‍🌾 {order.farmer?.name || "—"}
                          </p>
                          <p style={{ margin:0, fontSize:"11px", color:"#9ca3af", marginTop:"2px" }}>
                            {formatDate(order.createdAt)}
                          </p>
                        </div>

                        {/* Cancel Action */}
                        <div>
                          {canCancel ? (
                            <button
                              onClick={() => handleCancel(order._id)}
                              disabled={cancellingId === order._id}
                              style={{
                                padding:"6px 14px", borderRadius:"8px", cursor:"pointer", fontSize:"11px", fontWeight:700,
                                background: cancellingId === order._id ? "#f3f4f6" : "#fee2e2",
                                color: cancellingId === order._id ? "#9ca3af" : "#991b1b",
                                border: "1.5px solid #fca5a5",
                                transition:"all 0.15s",
                              }}
                            >
                              {cancellingId === order._id ? "Cancelling..." : "Cancel"}
                            </button>
                          ) : (
                            <span style={{ fontSize:"11px", color:"#d1d5db", fontStyle:"italic" }}>—</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            )}

            {/* ── Wishlist Tab ── */}
            {activeTab === "wishlist" && (
              <div style={{ background:"#fff", borderRadius:"20px", border:"1.5px solid #d1fae5", overflow:"hidden", boxShadow:"0 4px 24px rgba(22,101,52,0.07)" }}>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1.2fr 1.5fr 1.5fr 1fr", padding:"14px 24px", background:"linear-gradient(90deg,#f0fdf4,#ecfdf5)", borderBottom:"1.5px solid #d1fae5" }}>
                  {["Crop", "Quantity", "Price / Unit", "Farmer", "Location"].map(h => (
                    <span key={h} style={{ fontSize:"11px", fontWeight:800, color:"#166534", textTransform:"uppercase", letterSpacing:"0.8px" }}>{h}</span>
                  ))}
                </div>

                {wishlist.length === 0
                  ? <EmptyState icon="💚" title="Your wishlist is empty" sub="Tap the heart icon on any crop listing in the marketplace to save it here." />
                  : wishlist.map((item, i) => (
                    <div
                      key={item._id}
                      style={{ display:"grid", gridTemplateColumns:"2fr 1.2fr 1.5fr 1.5fr 1fr", padding:"16px 24px", borderBottom: i < wishlist.length - 1 ? "1px solid #f0fdf4" : "none", alignItems:"center", transition:"background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                        <div style={{ width:"40px", height:"40px", borderRadius:"10px", background:"linear-gradient(135deg,#fef3c7,#fde68a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0, overflow:"hidden" }}>
                          {item.images?.[0]
                            ? <img src={item.images[0]} alt={item.crop} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                            : "🌿"}
                        </div>
                        <span style={{ fontWeight:700, color:"#111827", fontSize:"14px" }}>{item.crop}</span>
                      </div>
                      <span style={{ fontSize:"13px", color:"#374151", fontWeight:600 }}>
                        {item.quantity} <span style={{ color:"#9ca3af", fontWeight:400 }}>{item.unit}</span>
                      </span>
                      <span style={{ fontSize:"15px", fontWeight:800, color:"#166534" }}>{formatPrice(item.pricePerUnit)}</span>
                      <span style={{ fontSize:"13px", color:"#374151" }}>👨‍🌾 {item.farmer}</span>
                      <span style={{ fontSize:"11px", color:"#9ca3af" }}>{item.location?.district}, {item.location?.state}</span>
                    </div>
                  ))
                }
              </div>
            )}

            {/* ── Recently Viewed Tab ── */}
            {activeTab === "recently-viewed" && (
              <div style={{ background:"#fff", borderRadius:"20px", border:"1.5px solid #d1fae5", overflow:"hidden", boxShadow:"0 4px 24px rgba(22,101,52,0.07)" }}>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1.2fr 1.5fr 1.5fr", padding:"14px 24px", background:"linear-gradient(90deg,#f0fdf4,#ecfdf5)", borderBottom:"1.5px solid #d1fae5" }}>
                  {["Crop", "Quantity", "Price / Unit", "Farmer"].map(h => (
                    <span key={h} style={{ fontSize:"11px", fontWeight:800, color:"#166534", textTransform:"uppercase", letterSpacing:"0.8px" }}>{h}</span>
                  ))}
                </div>

                {recentlyViewed.length === 0
                  ? <EmptyState icon="🕒" title="Nothing viewed recently" sub="Crops you open in the marketplace will automatically appear here." />
                  : recentlyViewed.map((item, i) => (
                    <div
                      key={item._id || i}
                      style={{ display:"grid", gridTemplateColumns:"2fr 1.2fr 1.5fr 1.5fr", padding:"16px 24px", borderBottom: i < recentlyViewed.length - 1 ? "1px solid #f0fdf4" : "none", alignItems:"center", transition:"background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                        <div style={{ width:"40px", height:"40px", borderRadius:"10px", background:"linear-gradient(135deg,#ede9fe,#ddd6fe)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0, overflow:"hidden" }}>
                          {item.images?.[0]
                            ? <img src={item.images[0]} alt={item.cropName || item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                            : "🕒"}
                        </div>
                        <span style={{ fontWeight:700, color:"#111827", fontSize:"14px" }}>{item.cropName || item.name}</span>
                      </div>
                      <span style={{ fontSize:"13px", color:"#374151", fontWeight:600 }}>
                        {item.quantity} <span style={{ color:"#9ca3af", fontWeight:400 }}>{item.unit || "quintal"}</span>
                      </span>
                      <span style={{ fontSize:"15px", fontWeight:800, color:"#166534" }}>{formatPrice(item.pricePerUnit)}</span>
                      <span style={{ fontSize:"13px", color:"#374151" }}>👨‍🌾 {item.farmer?.name || item.farmer || "—"}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}