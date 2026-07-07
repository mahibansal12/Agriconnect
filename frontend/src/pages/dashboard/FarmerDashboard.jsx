import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { fetchCrops, deleteCrop } from '../../redux/slices/cropSlice';
import { fetchFarmerOrders, updateOrderStatus } from '../../redux/slices/cartSlice';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import axiosInstance from '../../utils/axiosInstance';
// ─── Status badge styles (now scoped classNames, not Tailwind) ──
const STATUS_STYLES = {
  placed: 'fd-badge--pending',
  confirmed: 'fd-badge--confirmed',
  shipped: 'fd-badge--shipped',
  delivered: 'fd-badge--delivered',
  cancelled: 'fd-badge--cancelled',
};

const STATUS_ACTIONS = {
  placed: ['confirmed'],
  confirmed: ['shipped',],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

// ─── Small inline icons for sidebar / topbar / brand ────────────
const Icon = {
  leaf: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M11 20A7 7 0 0 1 4 13c0-6 6-10 15-11 1 9-3 15-11 15Z" /><path d="M4 20 12 12" />
    </svg>
  ),
  listings: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 7 12 3 4 7v10l8 4 8-4V7Z" /><path d="M4 7l8 4 8-4" /><path d="M12 11v10" />
    </svg>
  ),
  orders: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  earnings: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M12 7v10M9 9.5a2.5 2.5 0 0 1 2.5-1.5h1a2 2 0 1 1 0 4h-1a2 2 0 1 0 0 4h1a2.5 2.5 0 0 0 2.5-1.5" />
    </svg>
  ),
  // ── donation request icon
  donations: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  bell: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  ),
};

// ─── Small reusable stat card ──────────────────────────────────
const StatCard = ({ icon, label, value, sub, accent = 'green' }) => (
  <div className="fd-stat-card">
    <div className="fd-stat-top">
      <div className={`fd-stat-icon fd-stat-icon--${accent}`}>{icon}</div>
    </div>
    <p className={`fd-stat-value fd-stat-value--${accent}`}>{value}</p>
    <p className="fd-stat-label">{label}</p>
    {sub && <p className="fd-stat-sub">{sub}</p>}
  </div>
);

// ─── Empty state reusable component ────────────────────────────
function EmptyState({ icon, title, sub, ctaTo, ctaLabel }) {
  return (
    <div className="fd-empty-state">
      <span className="fd-empty-icon">{icon}</span>
      <p className="fd-empty-text">{title}</p>
      {sub && <p className="fd-empty-sub">{sub}</p>}
      {ctaTo && (
        <Link to={ctaTo} className="fd-empty-cta">{ctaLabel}</Link>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
const FarmerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, name } = useAuth();

  const { list: crops, loading: cropLoading } = useSelector((s) => s.crops);
  const { orders, loading: orderLoading } = useSelector((s) => s.cart);

  // Open the correct tab; supports navigating here with location.state = { tab: 'donations' }
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'listings');
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [upiId, setUpiId] = useState(user?.payoutDetails?.upiId || '');
  const [savingUpi, setSavingUpi] = useState(false);

  // ── Donation request state ─────────────────────────────────────
  const [myRequests, setMyRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [reqForm, setReqForm] = useState({ title: '', cause: 'general', targetAmount: '', description: '' });
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [reqError, setReqError] = useState(null);
  const [reqSuccess, setReqSuccess] = useState(false);
  const [receivedDonations, setReceivedDonations] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [myDonationsLoading, setMyDonationsLoading] = useState(false);

  // Fetch farmer's own listings + orders + donation requests on mount
  useEffect(() => {
    if (user?._id) {
      dispatch(fetchCrops({ sellerId: user._id }));
      dispatch(fetchFarmerOrders());
      fetchMyRequests();
      fetchReceivedDonations();
      fetchMyDonations();
    }
  }, [user, dispatch]);

  // ── Derived stats ──────────────────────────────────────────
  const myListings = crops.filter((c) => c.seller?._id === user?._id || c.seller === user?._id);

  // 1. Calculate orders financial stats
  const ordersTotal = orders
    .filter((o) => o.orderStatus === 'delivered')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;

  const ordersPaidOut = orders
    .filter((o) => o.payoutStatus === 'paid')
    .reduce((s, o) => s + (o.farmerPayoutAmount || 0), 0);
  const ordersPendingPayout = orders
    .filter((o) => o.orderStatus === 'delivered' && o.payoutStatus === 'pending')
    .reduce((s, o) => s + (o.farmerPayoutAmount || 0), 0);

  // 2. Calculate donations financial stats (where status === "completed")
  const completedDonations = receivedDonations.filter((d) => d.status === 'completed');
  
  const donationsTotal = completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
  
  const donationsPaidOut = completedDonations
    .filter((d) => d.payoutStatus === 'paid')
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  const donationsPendingPayout = completedDonations
    .filter((d) => d.payoutStatus !== 'paid') // matches "pending" or missing status
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  // 3. Combined derived stats
  const totalEarnings = ordersTotal + donationsTotal;
  const paidOut = ordersPaidOut + donationsPaidOut;
  const pendingPayout = ordersPendingPayout + donationsPendingPayout;

  const activeListings = myListings.length;

  // ── Handlers ───────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    setDeletingId(id);
    await dispatch(deleteCrop(id));
    setDeletingId(null);
  };

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    await dispatch(updateOrderStatus({ orderId, status }));
    setUpdatingId(null);
  };

  const fetchMyRequests = async () => {
    try {
      setReqLoading(true);
      const res = await axiosInstance.get('/v1/donation-requests/farmer/mine');
      setMyRequests(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch donation requests:', err);
    } finally {
      setReqLoading(false);
    }
  };

  const fetchReceivedDonations = async () => {
    try {
      const res = await axiosInstance.get('/v1/donations/farmer/received');
      setReceivedDonations(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch received donations:', err);
    }
  };

  const fetchMyDonations = async () => {
    try {
      setMyDonationsLoading(true);
      const res = await axiosInstance.get('/v1/donations/my/donations');
      setMyDonations(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch my donations:', err);
    } finally {
      setMyDonationsLoading(false);
    }
  };

  const handleReqSubmit = async (e) => {
    e.preventDefault();
    setReqError(null);
    setReqSuccess(false);
    if (!reqForm.title || !reqForm.cause || !reqForm.targetAmount) {
      setReqError('Please fill in all required fields.');
      return;
    }
    if (Number(reqForm.targetAmount) <= 0) {
      setReqError('Target amount must be greater than 0.');
      return;
    }
    try {
      setReqSubmitting(true);
      await axiosInstance.post('/v1/donation-requests', {
        title: reqForm.title,
        cause: reqForm.cause,
        targetAmount: Number(reqForm.targetAmount),
        description: reqForm.description,
      });
      setReqSuccess(true);
      setReqForm({ title: '', cause: 'general', targetAmount: '', description: '' });
      fetchMyRequests();
    } catch (err) {
      setReqError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setReqSubmitting(false);
    }
  };

  const handleSaveUpi = async () => {
    setSavingUpi(true);
    try {
      await axiosInstance.patch('/v1/user/payout-details', { upiId });
      alert('UPI ID saved');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save UPI ID');
    } finally {
      setSavingUpi(false);
    }
  };

  const isLoading = cropLoading || orderLoading;

  const navItems = [
    { key: 'listings', label: 'My Listings', icon: Icon.listings },
    { key: 'orders', label: 'Orders', icon: Icon.orders },
    { key: 'earnings', label: 'Earnings', icon: Icon.earnings },
    { key: 'donations', label: 'Donation Requests', icon: Icon.donations },
    { key: 'my-donations', label: 'My Donations', icon: Icon.donations },
  ];

  return (
    <div className="fd-page">
      <div className="fd-shell">
        {/* ── Sidebar ── */}
        <aside className="fd-sidebar">
          <Link to="/" className="fd-brand">
            <div className="fd-brand-icon">
              <Icon.leaf width={18} height={18} />
            </div>
            <div>
              <p className="fd-brand-name">AgriConnect</p>
              <p className="fd-brand-sub">Farmer Console</p>
            </div>
          </Link>

          <nav className="fd-nav">
            {navItems.map((item) => {
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`fd-nav-item${active ? ' fd-nav-item--active' : ''}`}
                >
                  <item.icon width={18} height={18} className="fd-nav-icon" />
                  <span>{item.label}</span>
                  {active && <span className="fd-nav-dot" />}
                </button>
              );
            })}
          </nav>

          <div className="fd-sidebar-cta">
            <Link to="/marketplace/add" className="fd-add-btn">
              + Add New Listing
            </Link>
          </div>

          <div className="fd-profile-card">
            <p className="fd-profile-label">Signed in as</p>
            <div className="fd-profile-row">
              <div className="fd-profile-avatar">{(name || 'Farmer').charAt(0).toUpperCase()}</div>
              <div className="fd-profile-info">
                <p className="fd-profile-name">{name || 'Farmer'}</p>
                <p className="fd-profile-role">Farmer account</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="fd-main">
          <header className="fd-topbar">
            <div>
              <p className="fd-topbar-eyebrow">Farmer Console</p>
              <h1 className="fd-topbar-title">{activeTab.replace('-', ' ')}</h1>
            </div>
            <button className="fd-bell-btn">
              <Icon.bell width={18} height={18} />
            </button>
          </header>

          <main className="fd-content">
            <div className="fd-page-head">
              <h2 className="fd-page-title">Welcome back, {name || 'Farmer'} 👋</h2>
              <p className="fd-page-subtitle">Here's what's happening with your farm today</p>
            </div>

            {isLoading && <Loader />}

            {!isLoading && (
              <>
                {/* ── Stats row ── */}
                <div className="fd-stats-grid">
                  <StatCard
                    icon="🌾"
                    label="Active Listings"
                    value={activeListings}
                    accent="green"
                  />
                  <StatCard
                    icon="📦"
                    label="Total Orders"
                    value={orders.length}
                    sub={`${pendingOrders} pending`}
                    accent="sky"
                  />
                  <StatCard
                    icon="💰"
                    label="Total Earnings"
                    value={`₹${totalEarnings.toLocaleString('en-IN')}`}
                    sub="from delivered orders"
                    accent="gold"
                  />
                  <StatCard
                    icon="⭐"
                    label="Delivered"
                    value={orders.filter((o) => o.status === 'delivered').length}
                    sub="orders completed"
                    accent="violet"
                  />
                </div>

                {/* ── Mobile tab bar (mirrors sidebar) ── */}
                <div className="fd-mobile-tabs">
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`fd-mobile-tab${activeTab === item.key ? ' fd-mobile-tab--active' : ''}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* ═══════════════════════════════════════════════
                    TAB: MY LISTINGS
                ═══════════════════════════════════════════════ */}
                {activeTab === 'listings' && (
                  <div className="fd-list">
                    {myListings.length === 0 ? (
                      <div className="fd-empty-state">
                        <span className="fd-empty-icon">🌾</span>
                        <p className="fd-empty-text">No listings yet</p>
                        <Link to="/marketplace/add" className="fd-empty-cta">
                          + Add your first crop listing
                        </Link>
                      </div>
                    ) : (
                      myListings.map((crop) => (
                        <div key={crop._id} className="fd-listing-card">
                          {/* Thumbnail */}
                          <div className="fd-thumb">
                            {crop.images?.[0] ? (
                              <img src={crop.images[0]} alt={crop.name} className="fd-thumb-img" />
                            ) : (
                              <div className="fd-thumb-fallback">🌾</div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="fd-listing-info">
                            <p className="fd-listing-name">{crop.name}</p>
                            <p className="fd-listing-type">{crop.type}</p>
                            <div className="fd-listing-meta">
                              <span>₹{crop.price}/qtl</span>
                              <span>·</span>
                              <span>{crop.quantity} qtl</span>
                              <span>·</span>
                              <span>{crop.district}, {crop.state}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="fd-listing-actions">
                            <button onClick={() => navigate(`/marketplace/${crop._id}`)} className="fd-btn fd-btn--neutral">
                              View
                            </button>
                            <button onClick={() => navigate(`/marketplace/edit/${crop._id}`)} className="fd-btn fd-btn--update">
                              Update
                            </button>
                            <button
                              onClick={() => handleDelete(crop._id)}
                              disabled={deletingId === crop._id}
                              className="fd-btn fd-btn--danger"
                            >
                              {deletingId === crop._id ? '...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ═══════════════════════════════════════════════
                    TAB: ORDERS
                ═══════════════════════════════════════════════ */}
                {activeTab === 'orders' && (
                  <div className="fd-list">
                    {orders.length === 0 ? (
                      <div className="fd-empty-state">
                        <span className="fd-empty-icon">📦</span>
                        <p className="fd-empty-text">No orders received yet</p>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div key={order._id}
                          className="fd-order-card"
                          onClick={() => navigate(`/farmer/orders/${order._id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="fd-order-row">
                            {/* Order info */}
                            <div>
                              <div className="fd-order-title-row">
                                <p className="fd-order-crop">{order.listing?.cropName || 'Crop'}</p>
                                <span className={`fd-badge ${STATUS_STYLES[order.orderStatus] || STATUS_STYLES.placed}`}>
                                  {order.orderStatus}
                                </span>
                              </div>
                              <div className="fd-order-meta">
                                <p>Buyer: <span className="fd-order-meta-strong">{order.buyer?.name || '—'}</span></p>
                                <p>Qty: <span className="fd-order-meta-strong">{order.quantity} qtl</span></p>
                                <p>Amount: <span className="fd-order-amount">₹{order.totalPrice?.toLocaleString('en-IN')}</span></p>
                                <p>Ordered: <span className="fd-order-meta-strong">
                                  {order.createdAt
                                    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                      day: '2-digit', month: 'short', year: 'numeric',
                                    })
                                    : '—'}
                                </span></p>
                              </div>
                            </div>

                            {/* Status update buttons */}
                            {STATUS_ACTIONS[order.orderStatus]?.length > 0 && (
                              <div className="fd-order-actions">
                                {STATUS_ACTIONS[order.orderStatus].map((nextStatus) => (
                                  <button
                                    key={nextStatus}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(order._id, nextStatus);
                                    }}
                                    disabled={updatingId === order._id}
                                    className={`fd-btn ${nextStatus === 'cancelled' ? 'fd-btn--danger' : 'fd-btn--progress'}`}
                                  >
                                    {updatingId === order._id ? '...' : `Mark ${nextStatus}`}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ═══════════════════════════════════════════════
                    TAB: EARNINGS
                ═══════════════════════════════════════════════ */}
                {activeTab === 'earnings' && (
                  <div className="fd-earnings">
                    <div className="fd-card" style={{ marginBottom: 18, padding: 16 }}>
                      <p className="fd-card-title" style={{ marginBottom: 8 }}>Payout UPI ID</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@upi"
                          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #d6d3d1' }}
                        />
                        <button onClick={handleSaveUpi} disabled={savingUpi} className="fd-btn fd-btn--progress">
                          {savingUpi ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>


                    {/* Summary cards */}
                    <div className="fd-summary-grid">
                      {[
                        {
                          label: 'Total Earned',
                          value: `₹${totalEarnings.toLocaleString('en-IN')}`,
                          sub: 'from delivered orders',
                          icon: '💰',
                          accent: 'green',
                        },
                        {
                          label: 'Pending Amount',
                          value: `₹${orders
                            .filter((o) => ['placed', 'confirmed', 'shipped'].includes(o.orderStatus))
                            .reduce((s, o) => s + (o.totalPrice || 0), 0)
                            .toLocaleString('en-IN')}`,
                          sub: 'awaiting delivery',
                          icon: '⏳',
                          accent: 'gold',
                        },
                        {
                          label: 'Cancelled Value',
                          value: `₹${orders
                            .filter((o) => o.orderStatus === 'cancelled')
                            .reduce((s, o) => s + (o.totalPrice || 0), 0)
                            .toLocaleString('en-IN')}`,
                          sub: 'from cancelled orders',
                          icon: '❌',
                          accent: 'rose',
                        },
                        {                                                              // ← paste starts here
                          label: 'Paid Out',
                          value: `₹${paidOut.toLocaleString('en-IN')}`,
                          sub: 'already transferred to you',
                          icon: '✅',
                          accent: 'green',
                        },
                        {
                          label: 'Awaiting Payout',
                          value: `₹${pendingPayout.toLocaleString('en-IN')}`,
                          sub: 'delivered, payment on the way',
                          icon: '🕒',
                          accent: 'gold',
                        },
                      ].map(({ label, value, sub, icon, accent }) => (
                        <div key={label} className={`fd-summary-card fd-summary-card--${accent}`}>
                          <div className="fd-summary-icon">{icon}</div>
                          <p className={`fd-summary-value fd-summary-value--${accent}`}>{value}</p>
                          <p className="fd-summary-label">{label}</p>
                          <p className="fd-summary-sub">{sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* Per-order earnings table */}
                    <div className="fd-card">
                      <div className="fd-card-head">
                        <h3 className="fd-card-title">Order Breakdown</h3>
                      </div>
                      {orders.length === 0 ? (
                        <div className="fd-table-empty">No orders yet</div>
                      ) : (
                        <div className="fd-table-wrap">
                          <table className="fd-table">
                            <thead>
                              <tr>
                                {['Crop', 'Buyer', 'Qty (qtl)', 'Amount', 'Status', 'Date'].map((h) => (
                                  <th key={h}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {orders.map((order) => (
                                <tr key={order._id}>
                                  <td className="fd-td-strong">{order.crop?.name || '—'}</td>
                                  <td className="fd-td-muted">{order.buyer?.name || '—'}</td>
                                  <td className="fd-td-muted">{order.quantity}</td>
                                  <td className="fd-td-accent">₹{order.totalPrice?.toLocaleString('en-IN') || '—'}</td>
                                  <td>
                                    <span className={`fd-badge ${STATUS_STYLES[order.orderStatus] || STATUS_STYLES.placed}`}>
                                      {order.orderStatus}
                                    </span>
                                  </td>
                                  <td className="fd-td-faint">
                                    {order.createdAt
                                      ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                        day: '2-digit', month: 'short', year: 'numeric',
                                      })
                                      : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* ═══════════════════════════════════════════════
                     TAB: DONATION REQUESTS
                 ═══════════════════════════════════════════════ */}
                {activeTab === 'donations' && (
                  <div className="fd-donations-wrap">

                    {/* ── Request form ── */}
                    <div className="fd-card" style={{ marginBottom: 20 }}>
                      <div className="fd-card-head" style={{ background: 'linear-gradient(135deg,rgba(22,101,52,0.08),rgba(101,163,13,0.06))' }}>
                        <h3 className="fd-card-title">💚 Raise a Donation Campaign</h3>
                        <p style={{ fontSize: 12, color: '#6B5A2E', marginTop: 4 }}>Submit a request to receive donations from the AgriConnect community. Admin approval required before it goes live.</p>
                      </div>
                      <form onSubmit={handleReqSubmit} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Title */}
                        <div>
                          <label className="fd-req-label">Campaign Title *</label>
                          <input
                            className="fd-req-input"
                            placeholder="e.g. Help rebuild after flood damage"
                            value={reqForm.title}
                            onChange={(e) => setReqForm(f => ({ ...f, title: e.target.value }))}
                            disabled={reqSubmitting}
                          />
                        </div>
                        {/* Cause + Amount row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label className="fd-req-label">Cause *</label>
                            <select
                              className="fd-req-input"
                              value={reqForm.cause}
                              onChange={(e) => setReqForm(f => ({ ...f, cause: e.target.value }))}
                              disabled={reqSubmitting}
                            >
                              <option value="general">💚 General</option>
                              <option value="education">🎓 Education</option>
                              <option value="healthcare">🏥 Healthcare</option>
                              <option value="disaster relief">🌊 Disaster Relief</option>
                              <option value="equipment">🚜 Equipment</option>
                            </select>
                          </div>
                          <div>
                            <label className="fd-req-label">Target Amount (₹) *</label>
                            <input
                              className="fd-req-input"
                              type="number"
                              min="1"
                              placeholder="e.g. 50000"
                              value={reqForm.targetAmount}
                              onChange={(e) => setReqForm(f => ({ ...f, targetAmount: e.target.value }))}
                              disabled={reqSubmitting}
                            />
                          </div>
                        </div>
                        {/* Description */}
                        <div>
                          <label className="fd-req-label">Description (optional)</label>
                          <textarea
                            className="fd-req-input"
                            rows={3}
                            placeholder="Tell donors why you need help..."
                            value={reqForm.description}
                            onChange={(e) => setReqForm(f => ({ ...f, description: e.target.value }))}
                            disabled={reqSubmitting}
                            style={{ resize: 'vertical', minHeight: 72 }}
                          />
                        </div>

                        {reqError && <p style={{ color: '#DC2626', fontSize: 12, fontWeight: 600, margin: 0 }}>⚠️ {reqError}</p>}
                        {reqSuccess && <p style={{ color: '#16a34a', fontSize: 12, fontWeight: 700, margin: 0 }}>🎉 Request submitted! Awaiting admin approval.</p>}

                        <button
                          type="submit"
                          disabled={reqSubmitting}
                          className="fd-req-submit"
                        >
                          {reqSubmitting ? 'Submitting...' : '💚 Submit Campaign Request'}
                        </button>
                      </form>
                    </div>

                    {/* ── My existing requests ── */}
                    <div className="fd-card">
                      <div className="fd-card-head">
                        <h3 className="fd-card-title">📋 My Campaign Requests ({myRequests.length})</h3>
                      </div>
                      {reqLoading ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#A8A29E', fontSize: 13 }}>Loading...</div>
                      ) : myRequests.length === 0 ? (
                        <div className="fd-table-empty">No requests yet. Submit your first campaign above!</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                          {myRequests.map((req) => {
                            const statusMeta = {
                              pending: { color: '#A16207', bg: 'rgba(250,204,21,0.16)', label: '⏳ Pending Review' },
                              approved: { color: '#4D7C0F', bg: 'rgba(101,163,13,0.14)', label: '✅ Approved' },
                              rejected: { color: '#DC2626', bg: 'rgba(239,68,68,0.12)', label: '❌ Rejected' },
                            }[req.status] || { color: '#57534E', bg: '#f3f4f6', label: req.status };
                            const pct = req.targetAmount > 0 ? Math.min(100, Math.round((req.amountRaised / req.targetAmount) * 100)) : 0;
                            const causeIcon = { education: '🎓', healthcare: '🏥', 'disaster relief': '🌊', equipment: '🚜', general: '💚' }[req.cause] || '💚';
                            return (
                              <div key={req._id} className="fd-req-item">
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1F2937' }}>{causeIcon} {req.title}</span>
                                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999, background: statusMeta.bg, color: statusMeta.color }}>{statusMeta.label}</span>
                                    </div>
                                    <p style={{ fontSize: 12, color: '#78716C', margin: '0 0 8px', textTransform: 'capitalize' }}>Cause: {req.cause} · Target: ₹{req.targetAmount?.toLocaleString('en-IN')}</p>
                                    {req.description && <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: '0 0 8px' }}>{req.description}</p>}
                                    {/* Progress bar */}
                                    {req.status === 'approved' && (
                                      <div style={{ marginTop: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 4 }}>
                                          <span>₹{req.amountRaised?.toLocaleString('en-IN')} raised</span>
                                          <span>{pct}% of ₹{req.targetAmount?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div style={{ height: 6, borderRadius: 999, background: '#f0fdf4', overflow: 'hidden' }}>
                                          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#16a34a,#65A30D)', borderRadius: 999, transition: 'width 0.5s ease' }} />
                                        </div>
                                      </div>
                                    )}
                                    {req.status === 'rejected' && req.adminNote && (
                                      <p style={{ fontSize: 11.5, color: '#DC2626', marginTop: 6, padding: '6px 10px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
                                        📝 Admin note: {req.adminNote}
                                      </p>
                                    )}
                                  </div>
                                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                    <p style={{ fontSize: 11, color: '#A8A29E', margin: 0 }}>{new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    {req.status === 'approved' && (
                                      <Link to={`/donations/campaign/${req._id}`} style={{ fontSize: 11.5, color: '#4D7C0F', fontWeight: 700, textDecoration: 'none', display: 'block', marginTop: 6 }}>View Campaign →</Link>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════
                     TAB: MY DONATIONS (CONTRIBUTED BY FARMER)
                 ═══════════════════════════════════════════════ */}
                {activeTab === 'my-donations' && (
                  <div className="fd-donations-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="fd-card">
                      <div className="fd-card-head" style={{ background: 'linear-gradient(135deg,rgba(22,101,52,0.08),rgba(101,163,13,0.06))' }}>
                        <h3 className="fd-card-title">💚 Contributions History</h3>
                        <p style={{ fontSize: 12, color: '#6B5A2E', marginTop: 4 }}>List of donation campaigns you have personally contributed to help other farmers.</p>
                      </div>
                      
                      {myDonationsLoading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#78716C' }}>Loading your donations...</div>
                      ) : myDonations.length === 0 ? (
                        <div style={{ padding: '40px 20px' }}>
                          <EmptyState
                            icon="💚"
                            title="No contributions made yet"
                            sub="Support other farmers by making a donation to active campaigns."
                            ctaTo="/donations"
                            ctaLabel="View Active Campaigns"
                          />
                        </div>
                      ) : (
                        <div style={{ overflowX: 'auto' }}>
                          <table className="fd-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: '#f9fafb', borderBottom: '1.5px solid #e5e7eb', textAlign: 'left' }}>
                                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#4b5563' }}>Campaign / Cause</th>
                                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#4b5563' }}>Amount</th>
                                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#4b5563' }}>Transaction ID</th>
                                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#4b5563' }}>Date</th>
                                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#4b5563' }}>Receipt</th>
                              </tr>
                            </thead>
                            <tbody>
                              {myDonations.map((d) => (
                                <tr key={d._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                  <td style={{ padding: '14px 18px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#1f2937' }}>
                                      {d.campaignId?.title || d.campaignId || "Direct Contribution"}
                                    </div>
                                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#e0f2fe', color: '#0369a1', textTransform: 'capitalize', display: 'inline-block', marginTop: '4px' }}>
                                      {d.cause || 'general'}
                                    </span>
                                  </td>
                                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#16a34a', fontSize: '13px' }}>
                                    ₹{d.amount?.toLocaleString('en-IN')}
                                  </td>
                                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: '11.5px', color: '#6b7280' }}>
                                    {d.paymentId || '—'}
                                  </td>
                                  <td style={{ padding: '14px 18px', fontSize: '12px', color: '#6b7280' }}>
                                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                  </td>
                                  <td style={{ padding: '14px 18px' }}>
                                    <Link to={`/donations/${d._id}`} style={{ fontSize: '11.5px', fontWeight: 700, color: '#16a34a', textDecoration: 'none', padding: '5px 12px', borderRadius: '8px', background: '#dcfce7', border: '1.5px solid #86efac', display: 'inline-block', whiteSpace: 'nowrap' }}>View →</Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          Scoped styles — plain CSS, same approach used across
          AdminDashboard.jsx / BuyerDashboard.jsx in this project,
          to stay safe from the index.css global-reset bug that
          overrides Tailwind spacing utilities.
         ───────────────────────────────────────────────────────── */}
      <style>{`
        .fd-page {
          min-height: 100vh;
          padding: 26px;
          background:
            linear-gradient(160deg, rgba(255,251,235,0.30) 0%, rgba(240,253,224,0.24) 45%, rgba(255,247,204,0.30) 100%),
            radial-gradient(circle at 15% 8%, rgba(250,204,21,0.14), transparent 45%),
            radial-gradient(circle at 90% 88%, rgba(132,204,22,0.14), transparent 50%),
            url('/images/farmer-bg.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        }
        .fd-shell {
          display: flex;
          min-height: calc(100vh - 52px);
          background: rgba(255,255,255,0.22);
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 24px 60px -14px rgba(120,90,10,0.28), 0 2px 10px rgba(0,0,0,0.08);
          border: 1px solid rgba(255,255,255,0.55);
        }
 
        /* ── Sidebar ── */
        .fd-sidebar {
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          width: 264px;
          flex-shrink: 0;
          height: calc(100vh - 52px);
          background: rgba(255,255,255,0.4);
          border-right: 1px solid rgba(234,179,8,0.18);
        }
        .fd-brand {
          display: flex; align-items: center; gap: 11px;
          padding: 26px 22px 22px;
          text-decoration: none;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }
        .fd-brand:hover { opacity: 0.8; }
        .fd-brand-icon {
          display: grid; place-items: center;
          width: 38px; height: 38px; border-radius: 12px;
          background: linear-gradient(135deg, #FACC15, #65A30D);
          color: #fff;
          box-shadow: 0 4px 12px rgba(202,138,4,0.3);
          flex-shrink: 0;
        }
        .fd-brand-name { font-size: 15px; font-weight: 600; color: #1F2937; line-height: 1.3; }
        .fd-brand-sub { font-size: 11.5px; font-weight: 500; color: #92702A; margin-top: 1px; letter-spacing: 0.02em; }
 
        .fd-nav { display: flex; flex-direction: column; gap: 4px; padding: 8px 14px; flex: 1; }
        .fd-nav-item {
          display: flex; align-items: center; gap: 12px;
          width: 100%; padding: 10px 14px; border: none;
          background: transparent; border-radius: 11px;
          font-size: 14px; font-weight: 500; color: #57534E;
          cursor: pointer; text-align: left;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .fd-nav-item:hover { background: rgba(255,255,255,0.5); color: #1F2937; }
        .fd-nav-item--active {
          background: linear-gradient(135deg, #FACC15, #65A30D);
          color: #fff;
          box-shadow: 0 4px 14px rgba(101,163,13,0.35);
        }
        .fd-nav-icon { color: #A8A29E; flex-shrink: 0; }
        .fd-nav-item--active .fd-nav-icon { color: #fff; }
        .fd-nav-item span:first-of-type { flex: 1; }
        .fd-nav-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; flex-shrink: 0; }
 
        .fd-sidebar-cta { padding: 6px 14px 4px; }
        .fd-add-btn {
          display: block; text-align: center;
          padding: 10px 14px; border-radius: 11px;
          background: linear-gradient(135deg, #FACC15, #CA8A04);
          color: #fff; font-size: 13.5px; font-weight: 600;
          text-decoration: none;
          box-shadow: 0 6px 16px rgba(202,138,4,0.32);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .fd-add-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(202,138,4,0.4); }
 
        .fd-profile-card {
          margin: 18px 14px 22px; padding: 14px; border-radius: 14px;
          background: rgba(255,255,255,0.5);
          border: 1px solid rgba(234,179,8,0.15);
        }
        .fd-profile-label { font-size: 11.5px; font-weight: 500; color: #92702A; margin-bottom: 10px; }
        .fd-profile-row { display: flex; align-items: center; gap: 10px; }
        .fd-profile-avatar {
          display: grid; place-items: center;
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #FACC15, #65A30D); color: #fff;
          font-size: 12px; font-weight: 700; flex-shrink: 0;
        }
        .fd-profile-name { font-size: 13.5px; font-weight: 600; color: #1F2937; }
        .fd-profile-role { font-size: 11.5px; color: #92702A; margin-top: 1px; }
 
        /* ── Main / Topbar ── */
        .fd-main { flex: 1; min-width: 0; }
        .fd-topbar {
          position: sticky; top: 0; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 32px;
          background: rgba(255,255,255,0.3);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(234,179,8,0.15);
        }
        .fd-topbar-eyebrow { font-size: 12px; font-weight: 600; color: #A16207; margin-bottom: 2px; letter-spacing: 0.04em; text-transform: uppercase; }
        .fd-topbar-title { font-size: 18px; font-weight: 600; color: #1F2937; text-transform: capitalize; }
        .fd-bell-btn {
          display: grid; place-items: center;
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid rgba(234,179,8,0.2); background: rgba(255,255,255,0.5); color: #57534E;
          cursor: pointer;
        }
        .fd-bell-btn:hover { background: rgba(250,204,21,0.16); color: #A16207; }
 
        .fd-content { padding: 32px; max-width: 1200px; }
        .fd-page-head { margin-bottom: 28px; }
        .fd-page-title { font-size: 24px; font-weight: 700; color: #1F2937; letter-spacing: -0.01em; }
        .fd-page-subtitle { font-size: 14px; color: #6B5A2E; margin-top: 6px; }
 
        /* ── Stats ── */
        .fd-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 28px; }
        .fd-stat-card {
          background: rgba(255,255,255,0.45);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 18px; padding: 20px;
          backdrop-filter: blur(12px);
          transition: box-shadow 0.15s ease, transform 0.15s ease;
        }
        .fd-stat-card:hover { box-shadow: 0 10px 24px rgba(120,90,10,0.14); transform: translateY(-1px); }
        .fd-stat-top { margin-bottom: 10px; }
        .fd-stat-icon {
          display: inline-grid; place-items: center;
          width: 40px; height: 40px; border-radius: 12px; font-size: 19px;
        }
        .fd-stat-icon--green  { background: rgba(101,163,13,0.14); }
        .fd-stat-icon--sky    { background: rgba(14,165,233,0.12); }
        .fd-stat-icon--gold   { background: rgba(250,204,21,0.18); }
        .fd-stat-icon--violet { background: rgba(168,85,247,0.12); }
        .fd-stat-value { font-size: 24px; font-weight: 700; letter-spacing: -0.01em; }
        .fd-stat-value--green  { color: #4D7C0F; }
        .fd-stat-value--sky    { color: #0369A1; }
        .fd-stat-value--gold   { color: #A16207; }
        .fd-stat-value--violet { color: #7E22CE; }
        .fd-stat-label { font-size: 13.5px; color: #57534E; margin-top: 2px; }
        .fd-stat-sub { font-size: 11.5px; color: #A8A29E; margin-top: 2px; }
 
        /* ── Mobile tabs ── */
        .fd-mobile-tabs { display: none; }
 
        /* ── Shared list / card look ── */
        .fd-list { display: flex; flex-direction: column; gap: 12px; }
        .fd-empty-state {
          background: rgba(255,255,255,0.4);
          border: 1px dashed rgba(234,179,8,0.35);
          border-radius: 18px;
          display: flex; flex-direction: column; align-items: center;
          padding: 56px 20px; color: #A8A29E;
        }
        .fd-empty-icon { font-size: 42px; margin-bottom: 10px; }
        .fd-empty-text { font-weight: 500; color: #78716C; }
        .fd-empty-cta { margin-top: 14px; font-size: 13.5px; color: #4D7C0F; font-weight: 600; text-decoration: none; }
        .fd-empty-cta:hover { text-decoration: underline; }
 
        .fd-listing-card {
          background: rgba(255,255,255,0.45);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 18px; padding: 16px;
          display: flex; align-items: center; gap: 16px;
          backdrop-filter: blur(10px);
        }
        .fd-thumb { width: 64px; height: 64px; border-radius: 14px; overflow: hidden; background: rgba(0,0,0,0.05); flex-shrink: 0; }
        .fd-thumb-img { width: 100%; height: 100%; object-fit: cover; }
        .fd-thumb-fallback { width: 100%; height: 100%; display: grid; place-items: center; font-size: 24px; }
        .fd-listing-info { flex: 1; min-width: 0; }
        .fd-listing-name { font-weight: 600; color: #1F2937; }
        .fd-listing-type { font-size: 13.5px; color: #6B5A2E; text-transform: capitalize; }
        .fd-listing-meta { display: flex; align-items: center; gap: 8px; margin-top: 4px; font-size: 12px; color: #A8A29E; }
        .fd-listing-actions { display: flex; gap: 8px; flex-shrink: 0; }
 
        .fd-order-card {
          background: rgba(255,255,255,0.45);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 18px; padding: 16px;
          backdrop-filter: blur(10px);
        }
        .fd-order-row { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .fd-order-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .fd-order-crop { font-weight: 600; color: #1F2937; }
        .fd-order-meta { font-size: 12px; color: #A8A29E; display: flex; flex-direction: column; gap: 2px; }
        .fd-order-meta-strong { color: #57534E; }
        .fd-order-amount { font-weight: 600; color: #4D7C0F; }
        .fd-order-actions { display: flex; gap: 8px; flex-wrap: wrap; }
 
        /* ── Buttons ── */
        .fd-btn {
          font-size: 12.5px; font-weight: 500; padding: 7px 14px;
          border-radius: 9px; border: 1px solid transparent;
          cursor: pointer; transition: background 0.15s ease, opacity 0.15s ease;
          text-transform: capitalize;
        }
        .fd-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .fd-btn--neutral { background: rgba(0,0,0,0.05); color: #57534E; }
        .fd-btn--neutral:hover { background: rgba(0,0,0,0.09); }
        .fd-btn--update { background: rgba(14,165,233,0.14); color: #0369A1; }
        .fd-btn--update:hover { background: rgba(14,165,233,0.24); }
        .fd-btn--danger { background: rgba(239,68,68,0.12); color: #DC2626; }
        .fd-btn--danger:hover { background: rgba(239,68,68,0.2); }
        .fd-btn--progress { background: rgba(101,163,13,0.14); color: #4D7C0F; }
        .fd-btn--progress:hover { background: rgba(101,163,13,0.22); }
 
        /* ── Badges ── */
        .fd-badge {
          display: inline-flex; align-items: center;
          padding: 3px 10px; border-radius: 999px;
          font-size: 10.5px; font-weight: 600; text-transform: capitalize;
          border: 1px solid transparent;
        }
        .fd-badge--pending   { background: rgba(250,204,21,0.16); color: #A16207; border-color: rgba(250,204,21,0.35); }
        .fd-badge--confirmed { background: rgba(14,165,233,0.12); color: #0369A1; border-color: rgba(14,165,233,0.3); }
        .fd-badge--shipped   { background: rgba(168,85,247,0.12); color: #7E22CE; border-color: rgba(168,85,247,0.3); }
        .fd-badge--delivered { background: rgba(101,163,13,0.14); color: #4D7C0F; border-color: rgba(101,163,13,0.32); }
        .fd-badge--cancelled { background: rgba(239,68,68,0.12); color: #DC2626; border-color: rgba(239,68,68,0.3); }
 
        /* ── Earnings ── */
        .fd-earnings { display: flex; flex-direction: column; gap: 18px; }
        .fd-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .fd-summary-card {
          border-radius: 18px; padding: 20px;
          border: 1px solid rgba(255,255,255,0.6);
          backdrop-filter: blur(10px);
        }
        .fd-summary-card--green { background: rgba(101,163,13,0.12); }
        .fd-summary-card--gold  { background: rgba(250,204,21,0.16); }
        .fd-summary-card--rose  { background: rgba(239,68,68,0.10); }
        .fd-summary-icon { font-size: 22px; margin-bottom: 8px; }
        .fd-summary-value { font-size: 22px; font-weight: 700; }
        .fd-summary-value--green { color: #4D7C0F; }
        .fd-summary-value--gold  { color: #A16207; }
        .fd-summary-value--rose  { color: #DC2626; }
        .fd-summary-label { font-size: 13.5px; color: #57534E; margin-top: 3px; }
        .fd-summary-sub { font-size: 11.5px; color: #A8A29E; margin-top: 2px; }
 
        .fd-card {
          background: rgba(255,255,255,0.45);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 18px;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        .fd-card-head { padding: 18px 22px; border-bottom: 1px solid rgba(234,179,8,0.15); }
        .fd-card-title { font-size: 14.5px; font-weight: 600; color: #1F2937; }
        .fd-table-empty { text-align: center; padding: 40px 20px; color: #A8A29E; font-size: 13.5px; }
        .fd-table-wrap { overflow-x: auto; }
        .fd-table { width: 100%; border-collapse: collapse; }
        .fd-table thead tr { border-bottom: 1px solid rgba(234,179,8,0.18); }
        .fd-table th {
          text-align: left; padding: 12px 22px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.04em; color: #92702A;
          white-space: nowrap;
        }
        .fd-table tbody tr { border-bottom: 1px solid rgba(0,0,0,0.05); }
        .fd-table tbody tr:last-child { border-bottom: none; }
        .fd-table tbody tr:hover { background: rgba(250,204,21,0.08); }
        .fd-table td { padding: 14px 22px; font-size: 13px; white-space: nowrap; }
        .fd-td-strong { font-weight: 600; color: #1F2937; }
        .fd-td-muted { color: #57534E; }
        .fd-td-accent { font-weight: 600; color: #4D7C0F; }
        .fd-td-faint { color: #A8A29E; font-size: 12px; }
 
        /* ── Responsive ── */
        @media (max-width: 900px) {
          .fd-page { padding: 0; }
          .fd-shell { border-radius: 0; min-height: 100vh; border: none; }
          .fd-sidebar { display: none; }
          .fd-content { padding: 18px; }
          .fd-topbar { padding: 14px 18px; }
          .fd-stats-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
          .fd-summary-grid { grid-template-columns: 1fr; }
          .fd-mobile-tabs { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 20px; padding-bottom: 4px; }
          .fd-mobile-tab {
            flex-shrink: 0; white-space: nowrap; padding: 9px 16px; border-radius: 999px;
            border: 1px solid rgba(234,179,8,0.25); background: rgba(255,255,255,0.5);
            color: #57534E; font-size: 13.5px; font-weight: 500; cursor: pointer;
          }
          .fd-mobile-tab--active { background: linear-gradient(135deg, #FACC15, #65A30D); border-color: transparent; color: #fff; }
        }
        @media (max-width: 560px) {
          .fd-stats-grid { grid-template-columns: 1fr; }
        }

        /* ── Donation Requests Tab ── */
        .fd-donations-wrap { display: flex; flex-direction: column; gap: 18px; }
        .fd-req-label {
          display: block; font-size: 12px; font-weight: 600;
          color: #6B5A2E; margin-bottom: 5px;
        }
        .fd-req-input {
          width: 100%; box-sizing: border-box;
          padding: 10px 13px; border-radius: 10px;
          border: 1.5px solid rgba(234,179,8,0.3);
          background: rgba(255,255,255,0.7);
          font-size: 13.5px; font-family: inherit; color: #1F2937;
          outline: none; transition: border 0.18s ease;
        }
        .fd-req-input:focus { border-color: #65A30D; background: #fff; }
        .fd-req-input:disabled { opacity: 0.6; cursor: not-allowed; }
        .fd-req-submit {
          padding: 12px 20px; border-radius: 11px; border: none;
          background: linear-gradient(135deg, #16a34a, #65A30D);
          color: #fff; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 4px 16px rgba(101,163,13,0.32);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .fd-req-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(101,163,13,0.42); }
        .fd-req-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .fd-req-item {
          padding: 16px 22px;
          border-bottom: 1px solid rgba(234,179,8,0.12);
          transition: background 0.12s ease;
        }
        .fd-req-item:last-child { border-bottom: none; }
        .fd-req-item:hover { background: rgba(250,204,21,0.05); }

        /* ── Empty State ── */
        .fd-empty-state {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 40px 20px; text-align: center;
        }
        .fd-empty-icon { font-size: 40px; margin-bottom: 12px; }
        .fd-empty-text { font-size: 14px; font-weight: 700; color: #374151; margin: 0 0 6px; }
        .fd-empty-sub  { font-size: 12px; color: #9ca3af; margin: 0 0 16px; line-height: 1.6; }
        .fd-empty-cta  {
          display: inline-flex; align-items: center;
          padding: 10px 22px; border-radius: 10px;
          background: linear-gradient(135deg,#16a34a,#65A30D);
          color: #fff; font-weight: 700; font-size: 13px;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};

export default FarmerDashboard;
