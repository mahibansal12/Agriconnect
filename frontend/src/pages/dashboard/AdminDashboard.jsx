import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";


const Icon = {
  overview: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="7" height="9" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" />
      <rect x="14" y="12" width="7" height="9" rx="2" /><rect x="3" y="16" width="7" height="5" rx="2" />
    </svg>
  ),
  users: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  listings: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 7 12 3 4 7v10l8 4 8-4V7Z" /><path d="M4 7l8 4 8-4" /><path d="M12 11v10" />
    </svg>
  ),
  donations: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  ),
  news: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 4h13a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M8 8h8M8 12h8M8 16h4" />
    </svg>
  ),
  orders: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  x: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  bell: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  ),
  leaf: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M11 20A7 7 0 0 1 4 13c0-6 6-10 15-11 1 9-3 15-11 15Z" /><path d="M4 20 12 12" />
    </svg>
  ),
};

const StatCard = ({ icon, label, value, accent }) => (
  <div className="adm-stat-card">
    <div className="adm-stat-top">
      <p className="adm-stat-label">{label}</p>
      <div className={`adm-stat-icon adm-stat-icon--${accent}`}>{icon}</div>
    </div>
    <p className="adm-stat-value">{value}</p>
  </div>
);

const Badge = ({ children, tone = "gray" }) => (
  <span className={`adm-badge adm-badge--${tone}`}>{children}</span>
);

const badgeToneForRole = (role) => (role === "farmer" ? "green" : "gold");

const SectionHeader = ({ title, subtitle }) => (
  <div className="adm-card-head">
    <h3 className="adm-card-title">{title}</h3>
    {subtitle && <p className="adm-card-subtitle">{subtitle}</p>}
  </div>
);

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [donationRequests, setDonationRequests] = useState([]);
  const [news, setNews] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [rejectNote, setRejectNote] = useState({});  // { [id]: noteText }

  // User detail drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userActionId, setUserActionId] = useState(null); // id of user currently being banned/deleted (for button loading state)


  // useEffect(() => {
  //   fetchAllData();
  // }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersRes, listingsRes, donationsRes, newsRes, ordersRes, payoutsRes, donReqRes, payoutHistoryRes] = await Promise.all([
        axiosInstance.get("/v1/admin/users"),
        axiosInstance.get("/v1/admin/listings"), // fetch ALL listings (not just pending) so approved/rejected stay visible for admin history
        axiosInstance.get("/v1/admin/donations"),
        axiosInstance.get("/v1/news"),
        axiosInstance.get("/v1/admin/orders"),
        axiosInstance.get("/v1/admin/payouts"),
        axiosInstance.get("/v1/admin/donation-requests"),
        axiosInstance.get("/v1/admin/payouts/history"),
      ]);

      setUsers(usersRes.data.data?.users || []);
      setListings(listingsRes.data.data?.listings || []);
      setDonations(donationsRes.data.data || []);
      setNews(newsRes.data.data || []);
      setOrders(ordersRes.data.data?.orders || []);
      setPayouts(payoutsRes.data.data || []);
      setDonationRequests(donReqRes.data.data || []);
      setPayoutHistory(payoutHistoryRes.data.data || []);

    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const approveListing = async (id) => {
    try {
      const res = await axiosInstance.patch(`/v1/admin/listings/${id}/approve`);
      const updatedStatus = res.data?.data?.status || "approved";
      // update this row only — keep every listing visible for admin history
      setListings((prev) => prev.map((l) => (l._id === id ? { ...l, status: updatedStatus } : l)));
    } catch (err) {
      console.error(err);
      alert("Failed to approve listing");
    }
  };

  const rejectListing = async (id) => {
    try {
      const res = await axiosInstance.patch(`/v1/admin/listings/${id}/reject`);
      const updatedStatus = res.data?.data?.status || "rejected";
      // update this row only — keep every listing visible for admin history
      setListings((prev) => prev.map((l) => (l._id === id ? { ...l, status: updatedStatus } : l)));
    } catch (err) {
      console.error(err);
      alert("Failed to reject listing");
    }
  };

  // ── Users: fetch only the users list (used to refresh after ban/delete actions) ──
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/v1/admin/users");
      setUsers(res.data.data?.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // open the user detail drawer and load full details for that user
  const openUserDrawer = async (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
    setUserDetail(null);
    setUserDetailLoading(true);
    try {
      const res = await axiosInstance.get(`/v1/admin/users/${user._id}`);
      setUserDetail(res.data?.data || null);
    } catch (err) {
      console.error("Error fetching user detail:", err);
    } finally {
      setUserDetailLoading(false);
    }
  };

  const closeUserDrawer = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
    setUserDetail(null);
  };

  const handleToggleBan = async (user, e) => {
    e?.stopPropagation();
    const action = user.isActive ? "ban" : "unban";
    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) return;
    try {
      setUserActionId(user._id);
      const res = await axiosInstance.patch(`/v1/admin/users/${user._id}/ban`);
      const isActive = res.data?.data?.isActive;
      await fetchUsers(); // refresh only the users list, no full page reload
      setUserDetail((prev) => (prev && prev.user?._id === user._id ? { ...prev, user: { ...prev.user, isActive } } : prev));
      setSelectedUser((prev) => (prev && prev._id === user._id ? { ...prev, isActive } : prev));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setUserActionId(null);
    }
  };

  const handleDeleteUser = async (user, e) => {
    e?.stopPropagation();
    if (!window.confirm(`Delete ${user.name}? This action cannot be undone.`)) return;
    try {
      setUserActionId(user._id);
      await axiosInstance.delete(`/v1/admin/users/${user._id}`);
      await fetchUsers(); // refresh only the users list, no full page reload
      if (selectedUser?._id === user._id) closeUserDrawer();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setUserActionId(null);
    }
  };

  const markPayoutPaid = async (farmerId) => {
    if (!window.confirm("Confirm you've actually sent this money?")) return;
    try {
      await axiosInstance.patch(`/v1/admin/payouts/${farmerId}/mark-paid`);
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Failed to mark payout as paid");
    }
  };

  const approveDonationRequest = async (id) => {
    try {
      await axiosInstance.patch(`/v1/admin/donation-requests/${id}/approve`);
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Failed to approve donation request");
    }
  };

  const rejectDonationRequest = async (id) => {
    const note = rejectNote[id] || "";
    try {
      await axiosInstance.patch(`/v1/admin/donation-requests/${id}/reject`, { adminNote: note });
      setRejectNote((prev) => ({ ...prev, [id]: "" }));
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Failed to reject donation request");
    }
  };

  const deleteDonationRequest = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this campaign?")) return;
    try {
      await axiosInstance.delete(`/v1/admin/donation-requests/${id}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete donation request");
    }
  };


  const navItems = [
    { key: "overview", label: "Overview", icon: Icon.overview },
    { key: "users", label: "Users", icon: Icon.users },
    { key: "listings", label: "Listings", icon: Icon.listings },
    { key: "donations", label: "Donations", icon: Icon.donations },
    { key: "donation-requests", label: "Campaign Requests", icon: Icon.donations },
    { key: "news", label: "News", icon: Icon.news },
    { key: "payouts", label: "Payouts", icon: Icon.donations },
  ];

  const farmerCount = users.filter((u) => u.role === "farmer").length;
  const buyerCount = users.filter((u) => u.role === "buyer").length;

  return (
    <div className="adm-page">
      <div className="adm-shell">
        <aside className="adm-sidebar">
          <button
            type="button"
            className="adm-brand adm-brand--clickable"
            onClick={() => navigate("/")}
            aria-label="Go to homepage"
          >
            <div className="adm-brand-icon">
              <Icon.leaf width={18} height={18} />
            </div>
            <div>
              <p className="adm-brand-name">AgriConnect</p>
              <p className="adm-brand-sub">Admin Console</p>
            </div>
          </button>

          <nav className="adm-nav">
            {navItems.map((item) => {
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`adm-nav-item${active ? " adm-nav-item--active" : ""}`}
                >
                  <item.icon width={18} height={18} className="adm-nav-icon" />
                  <span>{item.label}</span>
                  {active && <span className="adm-nav-dot" />}
                </button>
              );
            })}
          </nav>

          <div className="adm-profile-card">
            <p className="adm-profile-label">Signed in as</p>
            <div className="adm-profile-row">
              <div className="adm-profile-avatar">A</div>
              <div className="adm-profile-info">
                <p className="adm-profile-name">Admin</p>
                <p className="adm-profile-role">Platform administrator</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="adm-main">
          <header className="adm-topbar">
            <div>
              <p className="adm-topbar-eyebrow">Admin Console</p>
              <h1 className="adm-topbar-title">{activeTab.replace("-", " ")}</h1>
            </div>
            <button className="adm-bell-btn">
              <Icon.bell width={18} height={18} />
              <span className="adm-bell-dot" />
            </button>
          </header>

          <main className="adm-content">
            <div className="adm-page-head">
              <h2 className="adm-page-title">Admin Dashboard</h2>
              <p className="adm-page-subtitle">Manage users, listings, donations, and content.</p>
            </div>

            {loading && (
              <div className="adm-card" style={{ padding: "40px", textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "48px", marginBottom: "14px" }}>⏳</div>
                <p>Loading admin data...</p>
              </div>
            )}

            {error && (
              <div
                className="adm-card"
                style={{
                  padding: "24px",
                  marginBottom: "24px",
                  border: "1px solid #f87171",
                }}
              >
                <p style={{ color: "#dc2626", fontWeight: 600 }}>
                  ❌ {error}
                </p>

                <button
                  onClick={fetchAllData}
                  className="adm-btn adm-btn--approve"
                  style={{ marginTop: "16px" }}
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="adm-stats-grid">
                  <StatCard icon={<Icon.users width={18} height={18} />} label="Total Users" value={users.length} accent="green" />
                  <StatCard icon={<Icon.listings width={18} height={18} />} label="Pending Listings" value={listings.filter(l => l.status === "pending").length} accent="amber" />
                  <StatCard icon={<Icon.donations width={18} height={18} />} label="Active Donations" value={donations.filter(d => d.status === "completed").length} accent="forest" />
                  <StatCard icon={<Icon.orders width={18} height={18} />} label="Total Orders" value={orders.length} accent="gold" />
                </div>

                <div className="adm-mobile-tabs">
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`adm-mobile-tab${activeTab === item.key ? " adm-mobile-tab--active" : ""}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="adm-card">
                  {activeTab === "overview" && (
                    <>
                      <SectionHeader title="Quick Stats" subtitle="A snapshot of platform activity" />
                      <div className="adm-quick-grid">
                        <div className="adm-quick-item adm-quick-item--green">
                          <span className="adm-quick-label">Farmers</span>
                          <span className="adm-quick-value">{farmerCount}</span>
                        </div>
                        <div className="adm-quick-item adm-quick-item--gold">
                          <span className="adm-quick-label">Buyers</span>
                          <span className="adm-quick-value">{buyerCount}</span>
                        </div>
                        <div className="adm-quick-item adm-quick-item--gold">
                          <span className="adm-quick-label">Pending Approvals</span>
                          <span className="adm-quick-value">{listings.filter(l => l.status === "pending").length}</span>
                        </div>
                        <div className="adm-quick-item adm-quick-item--green">
                          <span className="adm-quick-label">Campaigns</span>
                          <span className="adm-quick-value">{donationRequests.filter(r => r.status === "approved").length}</span>
                        </div>
                      </div>
                    </>
                  )}



                  {activeTab === "users" && (
                    <>
                      <SectionHeader title="Users" subtitle={`${users.length} registered accounts · click a row to view details`} />
                      <div className="adm-table-wrap">
                        <table className="adm-table">
                          <thead>
                            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr>
                          </thead>
                          <tbody>
                            {users.map((user) => {
                              const isAdmin = user.role === "admin";
                              const acting = userActionId === user._id;
                              return (
                                <tr
                                  key={user._id}
                                  className="adm-row-clickable"
                                  onClick={() => openUserDrawer(user)}
                                >
                                  <td className="adm-td-strong">{user.name}</td>
                                  <td className="adm-td-muted">{user.email}</td>
                                  <td><Badge tone={badgeToneForRole(user.role)}>{user.role}</Badge></td>
                                  <td><Badge tone={user.isActive === false ? "red" : "green"}>{user.isActive === false ? "Banned" : "Active"}</Badge></td>
                                  <td className="adm-td-faint">{new Date(user.createdAt).toLocaleDateString("en-IN")}</td>
                                  <td>
                                    <div className="adm-action-row">
                                      <button
                                        className="adm-btn adm-btn--approve"
                                        disabled={isAdmin || acting}
                                        title={isAdmin ? "Admins cannot be banned" : undefined}
                                        onClick={(e) => handleToggleBan(user, e)}
                                      >
                                        {user.isActive === false ? "Unban" : "Ban"}
                                      </button>
                                      <button
                                        className="adm-btn adm-btn--reject"
                                        disabled={isAdmin || acting}
                                        title={isAdmin ? "Admins cannot be deleted" : undefined}
                                        onClick={(e) => handleDeleteUser(user, e)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {activeTab === "listings" && (
                    <>
                      <SectionHeader title="Listings" subtitle="Full listing history — approve or reject pending crops" />
                      <div className="adm-table-wrap">
                        <table className="adm-table">
                          <thead>
                            <tr><th>Crop</th><th>Quantity</th><th>Price</th><th>Farmer</th><th>Created</th><th>Status</th><th>Action</th></tr>
                          </thead>
                          <tbody>
                            {listings.map((listing) => {
                              const status = listing.status || "pending";
                              const isPending = status === "pending";
                              const statusTone = status === "approved" ? "green" : status === "rejected" ? "red" : "amber";
                              return (
                                <tr
                                  key={listing._id}
                                  className="adm-row-clickable"
                                  onClick={() => navigate(`/marketplace/${listing._id}`)}
                                >
                                  <td className="adm-td-strong">{listing.cropName}</td>
                                  <td className="adm-td-muted">{listing.quantity} {listing.unit || "quintal"}</td>
                                  <td className="adm-td-muted">
                                    {listing.pricePerUnit != null ? `₹${listing.pricePerUnit.toLocaleString("en-IN")}/${listing.unit || "quintal"}` : "-"}
                                  </td>
                                  <td className="adm-td-muted">
                                    <div className="adm-farmer-cell">
                                      <span className="adm-td-strong">{listing.farmer?.name || "-"}</span>
                                      {listing.farmer?.email && <span className="adm-td-faint">{listing.farmer.email}</span>}
                                      {listing.farmer?.phone && <span className="adm-td-faint">{listing.farmer.phone}</span>}
                                    </div>
                                  </td>
                                  <td className="adm-td-faint">{listing.createdAt ? new Date(listing.createdAt).toLocaleDateString("en-IN") : "-"}</td>
                                  <td><Badge tone={statusTone}>{status}</Badge></td>
                                  <td onClick={(e) => e.stopPropagation()}>
                                    {isPending ? (
                                      <div className="adm-action-row">
                                        <button className="adm-btn adm-btn--approve"
                                          onClick={() => approveListing(listing._id)}>
                                          <Icon.check width={14} height={14} /> Approve
                                        </button>
                                        <button className="adm-btn adm-btn--reject"
                                          onClick={() => rejectListing(listing._id)}>
                                          <Icon.x width={14} height={14} /> Reject
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="adm-action-row">
                                        <button className="adm-btn adm-btn--approve" disabled>
                                          <Icon.check width={14} height={14} /> Approve
                                        </button>
                                        <button className="adm-btn adm-btn--reject" disabled>
                                          <Icon.x width={14} height={14} /> Reject
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {activeTab === "donations" && (
                    <>
                      <SectionHeader title="Donations History" subtitle="List of individual donor contributions" />
                      <div className="adm-table-wrap">
                        <table className="adm-table">
                          <thead>
                            <tr>
                              <th>Donor</th>
                              <th>Cause</th>
                              <th>Campaign ID / Title</th>
                              <th>Amount</th>
                              <th>Transaction ID</th>
                              <th>Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {donations.length === 0 ? (
                              <tr>
                                <td colSpan="7" style={{ textAlign: "center", color: "#9ca3af", padding: "20px" }}>
                                  No donations recorded yet.
                                </td>
                              </tr>
                            ) : (
                              donations.map((d) => {
                                const statusMeta = {
                                  pending: { color: "#D97706", bg: "#FEF3C7", label: "⏳ Pending" },
                                  completed: { color: "#16A34A", bg: "#DCFCE7", label: "✅ Paid" },
                                  failed: { color: "#DC2626", bg: "#FEE2E2", label: "❌ Failed" }
                                }[d.status] || { color: "#374151", bg: "#F3F4F6", label: d.status || "Completed" };
                                return (
                                  <tr key={d._id}>
                                    <td className="adm-td-strong">{d.donorName}</td>
                                    <td className="adm-td-muted" style={{ textTransform: "capitalize" }}>{d.cause ? d.cause.replace("-", " ") : "General"}</td>
                                    <td className="adm-td-muted">{d.campaignId?.title || d.campaignId || "Direct Donation"}</td>
                                    <td className="adm-td-strong" style={{ color: "#16A34A" }}>₹{d.amount?.toLocaleString("en-IN")}</td>
                                    <td className="adm-td-faint" style={{ fontFamily: "monospace" }}>{d.paymentId || "—"}</td>
                                    <td className="adm-td-faint">{d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                                    <td>
                                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "999px", color: statusMeta.color, background: statusMeta.bg }}>
                                        {statusMeta.label}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {activeTab === "payouts" && (
                    <>
                      <SectionHeader title="Farmer payouts" subtitle="Amounts owed for delivered orders & received donations" />
                      <div className="adm-table-wrap">
                        <table className="adm-table">
                          <thead>
                            <tr>
                              <th>Farmer</th>
                              <th>UPI ID</th>
                              <th>Orders Owed</th>
                              <th>Donations Owed</th>
                              <th>Total Owed</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payouts.length === 0 ? (
                              <tr>
                                <td colSpan="6" style={{ textAlign: "center", color: "#9ca3af", padding: "20px" }}>
                                  No pending payouts to farmers.
                                </td>
                              </tr>
                            ) : (
                              payouts.map((p) => (
                                <tr key={p.farmerId}>
                                  <td className="adm-td-strong">{p.farmerName}</td>
                                  <td className="adm-td-muted">{p.payoutDetails?.upiId || "Not set"}</td>
                                  <td className="adm-td-muted">
                                    {p.orderCount || 0} orders
                                    <span style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#6B7280" }}>
                                      ₹{(p.ordersOwed || 0).toLocaleString("en-IN")}
                                    </span>
                                  </td>
                                  <td className="adm-td-muted">
                                    {p.donationCount || 0} donations
                                    <span style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#6B7280" }}>
                                      ₹{(p.donationsOwed || 0).toLocaleString("en-IN")}
                                    </span>
                                  </td>
                                  <td className="adm-td-strong" style={{ color: "#16A34A" }}>
                                    ₹{p.totalOwed.toLocaleString("en-IN")}
                                  </td>
                                  <td>
                                    <button className="adm-btn adm-btn--approve" onClick={() => markPayoutPaid(p.farmerId)}>
                                      Mark as paid
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div style={{ marginTop: "32px" }}>
                        <SectionHeader title="Payout history" subtitle="Every payout that has been made to farmers so far" />
                        <div className="adm-table-wrap">
                          <table className="adm-table">
                            <thead>
                              <tr>
                                <th>Farmer</th>
                                <th>UPI ID</th>
                                <th>Orders</th>
                                <th>Donations</th>
                                <th>Total Paid</th>
                                <th>Paid On</th>
                              </tr>
                            </thead>
                            <tbody>
                              {payoutHistory.length === 0 ? (
                                <tr>
                                  <td colSpan="6" style={{ textAlign: "center", color: "#9ca3af", padding: "20px" }}>
                                    No payouts have been made yet.
                                  </td>
                                </tr>
                              ) : (
                                payoutHistory.map((p) => (
                                  <tr key={p._id}>
                                    <td className="adm-td-strong">{p.farmerName}</td>
                                    <td className="adm-td-muted">{p.upiId || "Not set"}</td>
                                    <td className="adm-td-muted">
                                      {p.orderCount || 0} orders
                                      <span style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#6B7280" }}>
                                        ₹{(p.ordersAmount || 0).toLocaleString("en-IN")}
                                      </span>
                                    </td>
                                    <td className="adm-td-muted">
                                      {p.donationCount || 0} donations
                                      <span style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#6B7280" }}>
                                        ₹{(p.donationsAmount || 0).toLocaleString("en-IN")}
                                      </span>
                                    </td>
                                    <td className="adm-td-strong" style={{ color: "#16A34A" }}>
                                      ₹{(p.totalAmount || 0).toLocaleString("en-IN")}
                                    </td>
                                    <td className="adm-td-muted">
                                      {new Date(p.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "news" && (
                    <>
                      <SectionHeader title="News & Content" subtitle="Manage published and draft articles" />
                      <div className="adm-table-wrap">
                        <table className="adm-table">
                          <thead>
                            <tr><th>Title</th><th>Category</th><th>Status</th></tr>
                          </thead>
                          <tbody>
                            {news.map((news) => (
                              <tr key={news._id}>
                                <td className="adm-td-strong">{news.title}</td>
                                <td className="adm-td-muted" style={{ textTransform: "capitalize" }}>{news.category}</td>
                                <td><Badge tone={news.status === "published" ? "green" : "gray"}>{news.status}</Badge></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {activeTab === "donation-requests" && (
                    <>
                      <SectionHeader
                        title="💚 Farmer Campaign Requests"
                        subtitle={`${donationRequests.filter(r => r.status === 'pending').length} pending · ${donationRequests.filter(r => r.status === 'approved').length} approved · ${donationRequests.filter(r => r.status === 'rejected').length} rejected`}
                      />
                      {donationRequests.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "48px 20px", color: "#9ca3af", fontSize: 14 }}>No donation requests yet.</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "0 26px 26px" }}>
                          {donationRequests.map((req) => {
                            const statusMeta = {
                              pending: { color: "#A16207", bg: "rgba(250,204,21,0.16)", label: "⏳ Pending" },
                              approved: { color: "#4D7C0F", bg: "rgba(101,163,13,0.14)", label: "✅ Approved" },
                              rejected: { color: "#DC2626", bg: "rgba(239,68,68,0.12)", label: "❌ Rejected" },
                            }[req.status] || {};
                            const causeIcon = { education: "🎓", healthcare: "🏥", "disaster relief": "🌊", equipment: "🚜", general: "💚" }[req.cause] || "💚";
                            return (
                              <div key={req._id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e5e7eb", padding: "18px 22px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                                      <span style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>{causeIcon} {req.title}</span>
                                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 999, background: statusMeta.bg, color: statusMeta.color }}>{statusMeta.label}</span>
                                    </div>
                                    <p style={{ margin: "0 0 4px", fontSize: 12, color: "#6b7280" }}>
                                      Farmer: <strong>{req.farmer?.name || "—"}</strong> ({req.farmer?.email || "—"})
                                    </p>
                                    <p style={{ margin: "0 0 4px", fontSize: 12, color: "#6b7280", textTransform: "capitalize" }}>
                                      Cause: {req.cause} · Target: ₹{req.targetAmount?.toLocaleString("en-IN")} · Raised: ₹{(req.amountRaised || 0).toLocaleString("en-IN")}
                                    </p>
                                    {/* Progress bar */}
                                    {req.status === 'approved' && (
                                      <div style={{ marginTop: 8, marginBottom: 8, maxWidth: "400px" }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#6B7280', marginBottom: 4 }}>
                                          <span>₹{(req.amountRaised || 0).toLocaleString('en-IN')} raised</span>
                                          <span>{Math.min(100, Math.round(((req.amountRaised || 0) / req.targetAmount) * 100))}% of ₹{req.targetAmount?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div style={{ height: 6, borderRadius: 999, background: '#f0fdf4', overflow: 'hidden', border: "1px solid #dcfce7" }}>
                                          <div style={{ height: '100%', width: `${Math.min(100, Math.round(((req.amountRaised || 0) / req.targetAmount) * 100))}%`, background: 'linear-gradient(90deg,#16a34a,#65A30D)', borderRadius: 999 }} />
                                        </div>
                                      </div>
                                    )}
                                    {req.description && <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#9ca3af" }}>{req.description}</p>}
                                    {req.adminNote && <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#DC2626", fontStyle: "italic" }}>Admin note: {req.adminNote}</p>}
                                  </div>
                                  <div style={{ flexShrink: 0, textAlign: "right", fontSize: 11, color: "#9ca3af" }}>
                                    {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                  </div>
                                </div>

                                {/* Action buttons */}
                                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                                  {req.status === "pending" && (
                                    <>
                                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        <button
                                          className="adm-btn adm-btn--approve"
                                          onClick={() => approveDonationRequest(req._id)}
                                        >
                                          ✅ Approve Campaign
                                        </button>
                                      </div>
                                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                        <input
                                          placeholder="Rejection reason (optional)"
                                          value={rejectNote[req._id] || ""}
                                          onChange={(e) => setRejectNote(prev => ({ ...prev, [req._id]: e.target.value }))}
                                          style={{ flex: 1, minWidth: 160, padding: "7px 12px", borderRadius: 8, border: "1.5px solid #fca5a5", fontSize: 12, fontFamily: "inherit", outline: "none" }}
                                        />
                                        <button
                                          className="adm-btn adm-btn--reject"
                                          onClick={() => rejectDonationRequest(req._id)}
                                        >
                                          ❌ Reject
                                        </button>
                                      </div>
                                    </>
                                  )}

                                  {req.status === "approved" && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        <button
                                          className="adm-btn adm-btn--approve"
                                          style={{ background: "#16a34a", borderColor: "#15803d" }}
                                          onClick={() => navigate(`/donations/campaign/${req._id}`)}
                                        >
                                          👁️ View Campaign Page
                                        </button>
                                      </div>
                                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                        <input
                                          placeholder="Rejection reason (optional)"
                                          value={rejectNote[req._id] || ""}
                                          onChange={(e) => setRejectNote(prev => ({ ...prev, [req._id]: e.target.value }))}
                                          style={{ flex: 1, minWidth: 160, padding: "7px 12px", borderRadius: 8, border: "1.5px solid #fca5a5", fontSize: 12, fontFamily: "inherit", outline: "none" }}
                                        />
                                        <button
                                          className="adm-btn adm-btn--reject"
                                          onClick={() => rejectDonationRequest(req._id)}
                                        >
                                          ❌ Reject Campaign
                                        </button>
                                        <button
                                          className="adm-btn adm-btn--reject"
                                          style={{ background: "#EF4444", borderColor: "#DC2626" }}
                                          onClick={() => deleteDonationRequest(req._id)}
                                        >
                                          🗑️ Delete
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {req.status === "rejected" && (
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                      <button
                                        className="adm-btn adm-btn--approve"
                                        onClick={() => approveDonationRequest(req._id)}
                                      >
                                        ✅ Re-Approve Campaign
                                      </button>
                                      <button
                                        className="adm-btn adm-btn--reject"
                                        style={{ background: "#EF4444", borderColor: "#DC2626" }}
                                        onClick={() => deleteDonationRequest(req._id)}
                                      >
                                        🗑️ Delete Campaign
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}

          </main>

        </div>
      </div>

      {drawerOpen && selectedUser && (
        <div className="adm-drawer-overlay" onClick={closeUserDrawer}>
          <aside className="adm-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="adm-drawer-head">
              <div>
                <p className="adm-drawer-eyebrow">User details</p>
                <h3 className="adm-drawer-title">{selectedUser.name}</h3>
              </div>
              <button className="adm-drawer-close" onClick={closeUserDrawer} aria-label="Close">
                <Icon.x width={16} height={16} />
              </button>
            </div>

            <div className="adm-drawer-body">
              {userDetailLoading && (
                <p className="adm-td-muted" style={{ padding: "4px 0 16px" }}>Loading details…</p>
              )}

              {!userDetailLoading && (
                <>
                  <div className="adm-drawer-badges">
                    <Badge tone={badgeToneForRole((userDetail?.user || selectedUser).role)}>
                      {(userDetail?.user || selectedUser).role}
                    </Badge>
                    <Badge tone={(userDetail?.user || selectedUser).isActive === false ? "red" : "green"}>
                      {(userDetail?.user || selectedUser).isActive === false ? "Banned" : "Active"}
                    </Badge>
                  </div>

                  <div className="adm-drawer-field">
                    <span className="adm-drawer-label">Email</span>
                    <span className="adm-drawer-value">{(userDetail?.user || selectedUser).email}</span>
                  </div>
                  <div className="adm-drawer-field">
                    <span className="adm-drawer-label">Phone</span>
                    <span className="adm-drawer-value">{(userDetail?.user || selectedUser).phone || "Not provided"}</span>
                  </div>
                  <div className="adm-drawer-field">
                    <span className="adm-drawer-label">Joined</span>
                    <span className="adm-drawer-value">
                      {new Date((userDetail?.user || selectedUser).createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>

                  {(userDetail?.user?.payoutDetails) && (
                    Object.values(userDetail.user.payoutDetails).some(Boolean) && (
                      <>
                        <p className="adm-drawer-subhead">Payout details</p>
                        {userDetail.user.payoutDetails.upiId && (
                          <div className="adm-drawer-field">
                            <span className="adm-drawer-label">UPI ID</span>
                            <span className="adm-drawer-value">{userDetail.user.payoutDetails.upiId}</span>
                          </div>
                        )}
                        {userDetail.user.payoutDetails.accountHolderName && (
                          <div className="adm-drawer-field">
                            <span className="adm-drawer-label">Account holder</span>
                            <span className="adm-drawer-value">{userDetail.user.payoutDetails.accountHolderName}</span>
                          </div>
                        )}
                        {userDetail.user.payoutDetails.bankAccountNumber && (
                          <div className="adm-drawer-field">
                            <span className="adm-drawer-label">Bank account</span>
                            <span className="adm-drawer-value">{userDetail.user.payoutDetails.bankAccountNumber}</span>
                          </div>
                        )}
                        {userDetail.user.payoutDetails.ifscCode && (
                          <div className="adm-drawer-field">
                            <span className="adm-drawer-label">IFSC</span>
                            <span className="adm-drawer-value">{userDetail.user.payoutDetails.ifscCode}</span>
                          </div>
                        )}
                      </>
                    )
                  )}

                  {userDetail && (
                    <>
                      <p className="adm-drawer-subhead">Activity</p>
                      <div className="adm-quick-grid" style={{ padding: 0 }}>
                        <div className="adm-quick-item adm-quick-item--green">
                          <span className="adm-quick-label">Listings</span>
                          <span className="adm-quick-value">{userDetail.listings?.length ?? 0}</span>
                        </div>
                        <div className="adm-quick-item adm-quick-item--gold">
                          <span className="adm-quick-label">Orders</span>
                          <span className="adm-quick-value">{userDetail.orders?.length ?? 0}</span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="adm-drawer-footer">
              <button
                className="adm-btn adm-btn--approve"
                disabled={selectedUser.role === "admin" || userActionId === selectedUser._id}
                onClick={(e) => handleToggleBan(userDetail?.user || selectedUser, e)}
              >
                {(userDetail?.user || selectedUser).isActive === false ? "Unban user" : "Ban user"}
              </button>
              <button
                className="adm-btn adm-btn--reject"
                disabled={selectedUser.role === "admin" || userActionId === selectedUser._id}
                onClick={(e) => handleDeleteUser(userDetail?.user || selectedUser, e)}
              >
                Delete user
              </button>
            </div>
          </aside>
        </div>
      )}

      <style>{`
          .adm-page {
            min-height: 100vh;
            padding: 26px;
            background: linear-gradient(160deg, #DFF3E2 0%, #E9F7E6 45%, #F3F9E9 100%);
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          }
          .adm-shell {
            display: flex;
            min-height: calc(100vh - 52px);
            background: #F7F9FB;
            border-radius: 32px;
            overflow: hidden;
            box-shadow: 0 24px 60px -14px rgba(20, 83, 45, 0.22), 0 2px 10px rgba(20, 83, 45, 0.08);
          }
 
          .adm-sidebar {
            position: sticky;
            top: 0;
            display: flex;
            flex-direction: column;
            width: 264px;
            flex-shrink: 0;
            height: calc(100vh - 52px);
            background: linear-gradient(165deg, #4E9435 0%, #2D6A2E 55%, #1F5024 100%);
            position: relative;
            overflow: hidden;
          }
          .adm-sidebar::before {
            content: "";
            position: absolute;
            top: -60px; right: -60px;
            width: 200px; height: 200px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(250,204,21,0.16), transparent 70%);
            pointer-events: none;
          }
          .adm-brand {
            display: flex;
            align-items: center;
            gap: 11px;
            padding: 26px 22px 22px;
            position: relative;
          }
          .adm-brand--clickable {
            border: none;
            background: transparent;
            width: 100%;
            text-align: left;
            font: inherit;
            color: inherit;
            cursor: pointer;
            border-radius: 12px;
            transition: background 0.15s ease;
          }
          .adm-brand--clickable:hover { background: rgba(255,255,255,0.08); }
          .adm-brand--clickable:focus-visible { outline: 2px solid #FACC15; outline-offset: -2px; }
          .adm-brand-icon {
            display: grid;
            place-items: center;
            width: 38px;
            height: 38px;
            border-radius: 12px;
            background: #fff;
            color: #1B7A3D;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            flex-shrink: 0;
          }
          .adm-brand-name { font-size: 15px; font-weight: 600; color: #fff; line-height: 1.3; }
          .adm-brand-sub { font-size: 11.5px; font-weight: 500; color: rgba(255,255,255,0.6); margin-top: 1px; letter-spacing: 0.02em; }
 
          .adm-nav {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 8px 14px;
            flex: 1;
            position: relative;
          }
          .adm-nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 10px 14px;
            border: none;
            background: transparent;
            border-radius: 11px;
            font-size: 14px;
            font-weight: 500;
            color: rgba(255,255,255,0.72);
            cursor: pointer;
            text-align: left;
            transition: background 0.15s ease, color 0.15s ease;
          }
          .adm-nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
          .adm-nav-item--active { background: #fff; color: #1B4A22; box-shadow: 0 4px 12px rgba(0,0,0,0.14); }
          .adm-nav-icon { color: rgba(255,255,255,0.55); flex-shrink: 0; }
          .adm-nav-item--active .adm-nav-icon { color: #F59E0B; }
          .adm-nav-item span:first-of-type { flex: 1; }
          .adm-nav-dot { width: 6px; height: 6px; border-radius: 50%; background: #FACC15; flex-shrink: 0; }
 
          .adm-profile-card {
            margin: 18px 14px 22px;
            padding: 14px;
            border-radius: 14px;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.12);
            position: relative;
          }
          .adm-profile-label { font-size: 11.5px; font-weight: 500; color: rgba(255,255,255,0.55); margin-bottom: 10px; }
          .adm-profile-row { display: flex; align-items: center; gap: 10px; }
          .adm-profile-avatar {
            display: grid; place-items: center;
            width: 32px; height: 32px; border-radius: 50%;
            background: linear-gradient(135deg, #FACC15, #F59E0B); color: #1B4A22;
            font-size: 12px; font-weight: 700; flex-shrink: 0;
          }
          .adm-profile-name { font-size: 13.5px; font-weight: 600; color: #fff; }
          .adm-profile-role { font-size: 11.5px; color: rgba(255,255,255,0.55); margin-top: 1px; }
 
          .adm-main { flex: 1; min-width: 0; background: linear-gradient(145deg, #E2F4B3 0%, #C4E491 60%, #A8D173 100%); }
          .adm-topbar {
            position: sticky;
            top: 0;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 32px;
            background: rgba(255,255,255,0.85);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #E9EEE9;
          }
          .adm-topbar-eyebrow { font-size: 12px; font-weight: 600; color: #1B7A3D; margin-bottom: 2px; letter-spacing: 0.02em; text-transform: uppercase; }
          .adm-topbar-title { font-size: 18px; font-weight: 600; color: #111827; text-transform: capitalize; }
          .adm-bell-btn {
            display: grid; place-items: center;
            width: 38px; height: 38px; border-radius: 50%;
            border: 1px solid #E9EEE9; background: #fff; color: #4B5563;
            cursor: pointer;
            position: relative;
          }
          .adm-bell-btn:hover { background: #F0FDF4; color: #16A34A; }
          .adm-bell-dot {
            position: absolute;
            top: 8px; right: 9px;
            width: 7px; height: 7px;
            border-radius: 50%;
            background: #F59E0B;
            border: 1.5px solid #fff;
          }
 
          .adm-content { padding: 32px; max-width: 1200px; }
 
          .adm-page-head { margin-bottom: 28px; }
          .adm-page-title { font-size: 26px; font-weight: 700; color: #111827; letter-spacing: -0.02em; }
          .adm-page-subtitle { font-size: 14px; color: #6B7280; margin-top: 6px; }
 
          .adm-stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 18px;
            margin-bottom: 28px;
          }
          .adm-stat-card {
            background: linear-gradient(150deg, #F6FBF3 0%, #FCFAEF 100%);
            border: 1px solid #ECF2E4;
            border-radius: 18px;
            padding: 20px;
            box-shadow: 0 1px 2px rgba(16,24,40,0.04);
            transition: box-shadow 0.15s ease, transform 0.15s ease;
          }
          .adm-stat-card:hover { box-shadow: 0 8px 20px rgba(20,83,45,0.09); transform: translateY(-1px); }
          .adm-stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
          .adm-stat-label { font-size: 13.5px; font-weight: 500; color: #6B7280; }
          .adm-stat-icon {
            display: grid; place-items: center;
            width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          }
          .adm-stat-icon--green  { background: #E9F9EE; color: #16A34A; }
          .adm-stat-icon--amber  { background: #FEF7E0; color: #D97706; }
          .adm-stat-icon--forest { background: #E4F3E6; color: #15803D; }
          .adm-stat-icon--gold   { background: #FDF3C7; color: #A16207; }
          .adm-stat-value { font-size: 30px; font-weight: 700; color: #111827; letter-spacing: -0.02em; }
 
          .adm-mobile-tabs { display: none; }
 
          .adm-card {
            background: #fff;
            border: 1px solid #E9EEE9;
            border-radius: 22px;
            box-shadow: 0 1px 2px rgba(16,24,40,0.04);
            overflow: hidden;
          }
          .adm-card-head { padding: 22px 26px; border-bottom: 1px solid #E9EEE9; }
          .adm-card-title { font-size: 15.5px; font-weight: 600; color: #111827; }
          .adm-card-subtitle { font-size: 13.5px; color: #6B7280; margin-top: 3px; }
 
          .adm-quick-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            padding: 26px;
          }
          .adm-quick-item {
            display: flex; align-items: center; justify-content: space-between;
            padding: 15px 18px;
            border-radius: 14px;
            border: 1px solid transparent;
            position: relative;
            padding-left: 22px;
          }
          .adm-quick-item::before {
            content: "";
            position: absolute;
            left: 0; top: 12px; bottom: 12px;
            width: 3px;
            border-radius: 999px;
          }
          .adm-quick-item--green { background: #E8F8EA; border-color: #D2F0D6; }
          .adm-quick-item--green::before { background: #16A34A; }
          .adm-quick-item--gold { background: #FDF3D6; border-color: #FAE7AE; }
          .adm-quick-item--gold::before { background: #D97706; }
          .adm-quick-label { font-size: 13.5px; color: #4B5563; font-weight: 500; }
          .adm-quick-value { font-size: 15px; font-weight: 700; color: #111827; }
 
          .adm-table-wrap { overflow-x: auto; }
          .adm-table { width: 100%; border-collapse: collapse; }
          .adm-table thead tr { border-bottom: 1px solid #E9EEE9; }
          .adm-row-clickable { cursor: pointer; transition: background 0.15s ease; }
          .adm-row-clickable:hover { background: rgba(101,163,13,0.06); }
          .adm-table th {
            text-align: left;
            padding: 12px 24px;
            font-size: 11.5px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #9CA3AF;
          }
          .adm-table tbody tr { border-bottom: 1px solid #F1F5F1; transition: background 0.15s ease; }
          .adm-table tbody tr:last-child { border-bottom: none; }
          .adm-table tbody tr:hover { background: #F8FCF8; }
          .adm-table td { padding: 16px 24px; font-size: 13.5px; vertical-align: middle; }
          .adm-td-strong { font-weight: 600; color: #111827; }
          .adm-td-muted { color: #6B7280; }
          .adm-td-faint { color: #9CA3AF; }
 
          .adm-badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 500;
            text-transform: capitalize;
          }
          .adm-badge--gray  { background: #F3F4F6; color: #4B5563; }
          .adm-badge--green { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
          .adm-badge--gold  { background: #FEF9E7; color: #A16207; border: 1px solid #FDE68A; }
          .adm-badge--amber { background: #FFFBEB; color: #B45309; border: 1px solid #FDE68A; }
          .adm-badge--red   { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
 
          .adm-action-row { display: flex; gap: 8px; }
          .adm-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 14px;
            border-radius: 8px;
            font-size: 12.5px;
            font-weight: 500;
            border: 1px solid transparent;
            cursor: pointer;
            transition: background 0.15s ease;
          }
          .adm-btn--approve { background: #ECFDF5; color: #047857; border-color: #A7F3D0; }
          .adm-btn--approve:hover { background: #D1FAE5; }
          .adm-btn--reject { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }
          .adm-btn--reject:hover { background: #FEE2E2; }
          .adm-btn:disabled { opacity: 0.45; cursor: not-allowed; }
          .adm-btn:disabled:hover { background: inherit; }
 
          .adm-row-clickable { cursor: pointer; }
          .adm-farmer-cell { display: flex; flex-direction: column; gap: 2px; }
          .adm-farmer-cell .adm-td-faint { font-size: 12px; }
 
          .adm-progress-row { display: flex; align-items: center; gap: 12px; }
          .adm-progress-track { width: 130px; height: 8px; border-radius: 999px; background: #F1F2F4; overflow: hidden; flex-shrink: 0; }
          .adm-progress-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #16A34A, #FACC15); }
          .adm-progress-pct { font-size: 12.5px; font-weight: 500; color: #6B7280; flex-shrink: 0; }
 
          @media (max-width: 900px) {
            .adm-page { padding: 0; }
            .adm-shell { border-radius: 0; min-height: 100vh; }
            .adm-sidebar { display: none; }
            .adm-content { padding: 20px; }
            .adm-topbar { padding: 14px 20px; }
            .adm-stats-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
            .adm-quick-grid { grid-template-columns: 1fr; }
            .adm-mobile-tabs {
              display: flex;
              gap: 8px;
              overflow-x: auto;
              margin-bottom: 20px;
              padding-bottom: 4px;
            }
            .adm-mobile-tab {
              flex-shrink: 0;
              white-space: nowrap;
              padding: 9px 16px;
              border-radius: 999px;
              border: 1px solid #E9EEE9;
              background: #fff;
              color: #4B5563;
              font-size: 13.5px;
              font-weight: 500;
              cursor: pointer;
            }
            .adm-mobile-tab--active { background: linear-gradient(135deg, #16A34A, #15803D); border-color: transparent; color: #fff; }
          }
          @media (max-width: 560px) {
            .adm-stats-grid { grid-template-columns: 1fr; }
          }
 
          .adm-drawer-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 30, 20, 0.45);
            backdrop-filter: blur(2px);
            display: flex;
            justify-content: flex-end;
            z-index: 100;
            animation: adm-fade-in 0.15s ease;
          }
          @keyframes adm-fade-in { from { opacity: 0; } to { opacity: 1; } }
 
          .adm-drawer {
            width: 380px;
            max-width: 92vw;
            height: 100%;
            background: #fff;
            box-shadow: -12px 0 40px rgba(20,83,45,0.18);
            display: flex;
            flex-direction: column;
            animation: adm-slide-in 0.2s ease;
          }
          @keyframes adm-slide-in { from { transform: translateX(24px); opacity: 0.6; } to { transform: translateX(0); opacity: 1; } }
 
          .adm-drawer-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            padding: 22px 24px 16px;
            border-bottom: 1px solid #E9EEE9;
          }
          .adm-drawer-eyebrow { font-size: 11.5px; font-weight: 600; color: #16A34A; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
          .adm-drawer-title { font-size: 18px; font-weight: 700; color: #111827; }
          .adm-drawer-close {
            display: grid; place-items: center;
            width: 30px; height: 30px; border-radius: 50%;
            border: 1px solid #E9EEE9; background: #fff; color: #6B7280;
            cursor: pointer; flex-shrink: 0;
          }
          .adm-drawer-close:hover { background: #F8FCF8; color: #DC2626; }
 
          .adm-drawer-body { padding: 20px 24px; overflow-y: auto; flex: 1; }
          .adm-drawer-badges { display: flex; gap: 8px; margin-bottom: 18px; }
          .adm-drawer-field {
            display: flex; align-items: center; justify-content: space-between;
            padding: 10px 0; border-bottom: 1px solid #F1F5F1; gap: 12px;
          }
          .adm-drawer-label { font-size: 12.5px; color: #9CA3AF; font-weight: 500; flex-shrink: 0; }
          .adm-drawer-value { font-size: 13.5px; color: #111827; font-weight: 500; text-align: right; word-break: break-word; }
          .adm-drawer-subhead { font-size: 12.5px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.03em; margin: 20px 0 10px; }
 
          .adm-drawer-footer {
            display: flex; gap: 10px;
            padding: 16px 24px 22px;
            border-top: 1px solid #E9EEE9;
          }
          .adm-drawer-footer .adm-btn { flex: 1; justify-content: center; padding: 10px 14px; }
 
          @media (max-width: 560px) {
            .adm-drawer { width: 100%; max-width: 100%; }
          }
        `}</style>
    </div>
  );
}

export default AdminDashboard;