// src/pages/dashboard/FarmerDashboard.jsx
// Shows: stats cards, active listings, received orders, earnings summary
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCrops, deleteCrop } from '../../redux/slices/cropSlice';
import { fetchFarmerOrders, updateOrderStatus } from '../../redux/slices/cartSlice';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';

// ─── Status badge colours ──────────────────────────────────────
const STATUS_STYLES = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50   text-blue-700   border-blue-200',
  shipped:   'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50  text-green-700  border-green-200',
  cancelled: 'bg-red-50    text-red-600    border-red-200',
};

const STATUS_ACTIONS = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['shipped',   'cancelled'],
  shipped:   ['delivered'],
  delivered: [],
  cancelled: [],
};

// ─── Small reusable stat card ──────────────────────────────────
const StatCard = ({ icon, label, value, sub, color = 'text-gray-800' }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
    <div className="text-3xl">{icon}</div>
    <div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────
const FarmerDashboard = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user, name } = useAuth();

  const { list: crops,  loading: cropLoading  } = useSelector((s) => s.crops);
  const { orders,       loading: orderLoading  } = useSelector((s) => s.cart);

  const [activeTab,    setActiveTab]    = useState('listings'); // 'listings' | 'orders' | 'earnings'
  const [deletingId,   setDeletingId]   = useState(null);
  const [updatingId,   setUpdatingId]   = useState(null);

  // Fetch farmer's own listings + orders on mount
  useEffect(() => {
    if (user?._id) {
      dispatch(fetchCrops({ sellerId: user._id }));
      dispatch(fetchFarmerOrders());
    }
  }, [user, dispatch]);

  // ── Derived stats ──────────────────────────────────────────
  const myListings     = crops.filter((c) => c.seller?._id === user?._id || c.seller === user?._id);
  const totalEarnings  = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders  = orders.filter((o) => o.status === 'pending').length;
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

  const isLoading = cropLoading || orderLoading;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {name || 'Farmer'} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Here's what's happening with your farm today
            </p>
          </div>
          <Link
            to="/marketplace/add"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
          >
            + Add New Listing
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {isLoading && <Loader />}

        {!isLoading && (
          <>
            {/* ── Stats row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon="🌾"
                label="Active Listings"
                value={activeListings}
                color="text-green-700"
              />
              <StatCard
                icon="📦"
                label="Total Orders"
                value={orders.length}
                sub={`${pendingOrders} pending`}
                color="text-blue-700"
              />
              <StatCard
                icon="💰"
                label="Total Earnings"
                value={`₹${totalEarnings.toLocaleString('en-IN')}`}
                sub="from delivered orders"
                color="text-orange-600"
              />
              <StatCard
                icon="⭐"
                label="Delivered"
                value={orders.filter((o) => o.status === 'delivered').length}
                sub="orders completed"
                color="text-purple-700"
              />
            </div>

            {/* ── Tab bar ── */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
              {[
                { key: 'listings', label: '🌾 My Listings' },
                { key: 'orders',   label: '📦 Orders'      },
                { key: 'earnings', label: '💰 Earnings'    },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                    activeTab === key
                      ? 'bg-white text-green-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ═══════════════════════════════════════════════
                TAB: MY LISTINGS
            ═══════════════════════════════════════════════ */}
            {activeTab === 'listings' && (
              <div className="space-y-3">
                {myListings.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center py-16 text-gray-400">
                    <span className="text-5xl mb-3">🌾</span>
                    <p className="font-medium text-gray-500">No listings yet</p>
                    <Link
                      to="/marketplace/add"
                      className="mt-4 text-sm text-green-600 hover:underline font-medium"
                    >
                      + Add your first crop listing
                    </Link>
                  </div>
                ) : (
                  myListings.map((crop) => (
                    <div
                      key={crop._id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {crop.images?.[0] ? (
                          <img
                            src={crop.images[0]}
                            alt={crop.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🌾</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{crop.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{crop.type}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>₹{crop.price}/qtl</span>
                          <span>·</span>
                          <span>{crop.quantity} qtl</span>
                          <span>·</span>
                          <span>{crop.district}, {crop.state}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => navigate(`/marketplace/${crop._id}`)}
                          className="text-xs px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(crop._id)}
                          disabled={deletingId === crop._id}
                          className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition disabled:opacity-50"
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
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center py-16 text-gray-400">
                    <span className="text-5xl mb-3">📦</span>
                    <p className="font-medium text-gray-500">No orders received yet</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                    >
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        {/* Order info */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-800">
                              {order.crop?.name || 'Crop'}
                            </p>
                            <span
                              className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full capitalize ${
                                STATUS_STYLES[order.status] || STATUS_STYLES.pending
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 space-y-0.5">
                            <p>Buyer: <span className="text-gray-600">{order.buyer?.name || '—'}</span></p>
                            <p>Qty: <span className="text-gray-600">{order.quantity} qtl</span></p>
                            <p>Amount: <span className="font-medium text-green-700">₹{order.totalAmount?.toLocaleString('en-IN')}</span></p>
                            <p>Ordered: <span className="text-gray-600">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                  })
                                : '—'}
                            </span></p>
                          </div>
                        </div>

                        {/* Status update buttons */}
                        {STATUS_ACTIONS[order.status]?.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {STATUS_ACTIONS[order.status].map((nextStatus) => (
                              <button
                                key={nextStatus}
                                onClick={() => handleStatusChange(order._id, nextStatus)}
                                disabled={updatingId === order._id}
                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50 capitalize ${
                                  nextStatus === 'cancelled'
                                    ? 'bg-red-50 hover:bg-red-100 text-red-500'
                                    : 'bg-green-50 hover:bg-green-100 text-green-700'
                                }`}
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
              <div className="space-y-4">

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: 'Total Earned',
                      value: `₹${totalEarnings.toLocaleString('en-IN')}`,
                      sub: 'from delivered orders',
                      icon: '💰',
                      color: 'text-green-700',
                      bg: 'bg-green-50',
                    },
                    {
                      label: 'Pending Amount',
                      value: `₹${orders
                        .filter((o) => ['pending', 'confirmed', 'shipped'].includes(o.status))
                        .reduce((s, o) => s + (o.totalAmount || 0), 0)
                        .toLocaleString('en-IN')}`,
                      sub: 'awaiting delivery',
                      icon: '⏳',
                      color: 'text-orange-600',
                      bg: 'bg-orange-50',
                    },
                    {
                      label: 'Cancelled Value',
                      value: `₹${orders
                        .filter((o) => o.status === 'cancelled')
                        .reduce((s, o) => s + (o.totalAmount || 0), 0)
                        .toLocaleString('en-IN')}`,
                      sub: 'from cancelled orders',
                      icon: '❌',
                      color: 'text-red-500',
                      bg: 'bg-red-50',
                    },
                  ].map(({ label, value, sub, icon, color, bg }) => (
                    <div key={label} className={`${bg} rounded-2xl p-5`}>
                      <div className="text-2xl mb-2">{icon}</div>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Per-order earnings table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-50">
                    <h3 className="font-semibold text-gray-800 text-sm">Order Breakdown</h3>
                  </div>
                  {orders.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">
                      No orders yet
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {['Crop', 'Buyer', 'Qty (qtl)', 'Amount', 'Status', 'Date'].map((h) => (
                              <th
                                key={h}
                                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50 transition">
                              <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">
                                {order.crop?.name || '—'}
                              </td>
                              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                {order.buyer?.name || '—'}
                              </td>
                              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                {order.quantity}
                              </td>
                              <td className="px-4 py-3 font-semibold text-green-700 whitespace-nowrap">
                                ₹{order.totalAmount?.toLocaleString('en-IN') || '—'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full capitalize ${
                                    STATUS_STYLES[order.status] || STATUS_STYLES.pending
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
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
          </>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
