  import { useState, useEffect } from "react";
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
    const [activeTab, setActiveTab] = useState("overview");
    const [users, setUsers] = useState([]);
    const [listings, setListings] = useState([]);
    const [donations, setDonations] = useState([]);
    const [news, setNews] = useState([]);
    const [orders, setOrders] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  
    useEffect(() => {
      fetchAllData();
    }, []);

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersRes, listingsRes, donationsRes, newsRes, ordersRes] = await Promise.all([
          axiosInstance.get("/v1/user"),
          axiosInstance.get("/v1/listing"),
          axiosInstance.get("/v1/donations"),
          axiosInstance.get("/v1/news"),
          axiosInstance.get("/v1/orders"),
        ]);

        setUsers(usersRes.data.data || []);
        setListings(listingsRes.data.data || []);
        setDonations(donationsRes.data.data || []);
        setNews(newsRes.data.data || []);
        setOrders(ordersRes.data.data || []);

      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError(err.response?.data?.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };


    const navItems = [
      { key: "overview", label: "Overview", icon: Icon.overview },
      { key: "users", label: "Users", icon: Icon.users },
      { key: "listings", label: "Listings", icon: Icon.listings },
      { key: "donations", label: "Donations", icon: Icon.donations },
      { key: "news", label: "News", icon: Icon.news },
    ];

    const farmerCount = users.filter((u) => u.role === "farmer").length;
    const buyerCount = users.filter((u) => u.role === "buyer").length;

    return (
      <div className="adm-page">
      <div className="adm-shell">
        <aside className="adm-sidebar">
          <div className="adm-brand">
            <div className="adm-brand-icon">
              <Icon.leaf width={18} height={18} />
            </div>
            <div>
              <p className="adm-brand-name">AgriConnect</p>
              <p className="adm-brand-sub">Admin Console</p>
            </div>
          </div>

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
              <StatCard icon={<Icon.donations width={18} height={18} />} label="Active Donations" value={donations.length} accent="forest" />
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
                      <span className="adm-quick-value">{listings.length}</span>
                    </div>
                    <div className="adm-quick-item adm-quick-item--green">
                      <span className="adm-quick-label">Campaigns</span>
                      <span className="adm-quick-value">{donations.length}</span>
                    </div>
                  </div>
                </>
              )}

              

              {activeTab === "users" && (
                <>
                  <SectionHeader title="Users" subtitle={`${users.length} registered accounts`} />
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td className="adm-td-strong">{user.name}</td>
                            <td className="adm-td-muted">{user.email}</td>
                            <td><Badge tone={badgeToneForRole(user.role)}>{user.role}</Badge></td>
                            <td className="adm-td-faint">{new Date(user.createdAt).toLocaleDateString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {activeTab === "listings" && (
                <>
                  <SectionHeader title="Pending Listings" subtitle="Review and approve new crop listings" />
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr><th>Crop</th><th>Quantity</th><th>Farmer</th><th>Action</th></tr>
                      </thead>
                      <tbody>
                        {listings.map((listing) => (
                          <tr key={listing._id}>
                            <td className="adm-td-strong">{listing.cropName}</td>
                            <td className="adm-td-muted">{listing.quantity} quintal</td>
                            <td className="adm-td-muted">{listing.farmer}</td>
                            <td>
                              <div className="adm-action-row">
                                <button className="adm-btn adm-btn--approve">
                                  <Icon.check width={14} height={14} /> Approve
                                </button>
                                <button className="adm-btn adm-btn--reject">
                                  <Icon.x width={14} height={14} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {activeTab === "donations" && (
                <>
                  <SectionHeader title="Donation Campaigns" subtitle="Track fundraising progress across farmers" />
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr><th>Farmer</th><th>Cause</th><th>Progress</th><th>Amount</th></tr>
                      </thead>
                      <tbody>
                        {donations.map((d) => {
                          const percent = Math.min(Math.round((d.raised / d.goal) * 100), 100);
                          return (
                            <tr key={d._id}>
                              <td className="adm-td-strong">{d.farmer}</td>
                              <td className="adm-td-muted" style={{ textTransform: "capitalize" }}>{d.cause.replace("-", " ")}</td>
                              <td>
                                <div className="adm-progress-row">
                                  <div className="adm-progress-track">
                                    <div className="adm-progress-fill" style={{ width: `${percent}%` }} />
                                  </div>
                                  <span className="adm-progress-pct">{percent}%</span>
                                </div>
                              </td>
                              <td className="adm-td-muted">
                                ₹{d.raised.toLocaleString("en-IN")}{" "}
                                <span className="adm-td-faint">/ ₹{d.goal.toLocaleString("en-IN")}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
                        </div> 
            </>
          )}

          </main>
        </div>
      </div>
      

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
        `}</style>
      </div>
    );
  }

  export default AdminDashboard;