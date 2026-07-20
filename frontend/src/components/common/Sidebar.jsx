// src/components/common/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import useAuth from "../../hooks/useAuth";
import { logoutUser } from "../../redux/slices/authSlice";

// ── Menu items per role ────────────────────────────────────────
const FARMER_MENU = [
  { to: "/farmer/dashboard",      label: "Dashboard",       icon: "grid" },
  { to: "/marketplace",           label: "Marketplace",     icon: "store" },
  { to: "/marketplace/add",       label: "Add listing",     icon: "plus" },
  { to: "/mandi",                 label: "Mandi rates",     icon: "chart" },
  { to: "/recommendations/crop",  label: "Crop advisor",    icon: "bulb" },
  { to: "/weather",               label: "Weather",         icon: "cloud" },
  { to: "/schemes",               label: "Schemes",         icon: "doc" },
  { to: "/community",             label: "Community",       icon: "users" },
  { to: "/ai-assistant",          label: "AI assistant",    icon: "bot" },
  { to: "/calculators",           label: "Calculators",     icon: "calc" },
];

const BUYER_MENU = [
  { to: "/buyer/dashboard",  label: "Dashboard",    icon: "grid" },
  { to: "/marketplace",      label: "Marketplace",  icon: "store" },
  { to: "/mandi",            label: "Mandi rates",  icon: "chart" },
  { to: "/community",        label: "Community",    icon: "users" },
  { to: "/ai-assistant",     label: "AI assistant", icon: "bot" },
];

const ADMIN_MENU = [
  { to: "/admin/dashboard",  label: "Dashboard",     icon: "grid" },
  { to: "/marketplace",      label: "Listings",      icon: "store" },
  { to: "/news",             label: "News",          icon: "news" },
  { to: "/schemes",          label: "Schemes",       icon: "doc" },
  { to: "/donations",        label: "Donations",     icon: "heart" },
  { to: "/community",        label: "Community",     icon: "users" },
];

// ── SVG icons map ──────────────────────────────────────────────
function Icon({ name }) {
  const icons = {
    grid:  <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    store: <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
    plus:  <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    bulb:  <><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></>,
    cloud: <><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"/></>,
    doc:   <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    bot:   <><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V3"/><path d="M8 3h8"/><circle cx="9" cy="16" r="1"/><circle cx="15" cy="16" r="1"/></>,
    calc:  <><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></>,
    heart: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></>,
    news:  <><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></>,
    user:  <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    logout:<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  };
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const menu =
    role === "farmer" ? FARMER_MENU :
    role === "buyer"  ? BUYER_MENU  :
    role === "admin"  ? ADMIN_MENU  : [];

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <aside className="sb">

      {/* User info */}
      <div className="sb-user">
        <div className="sb-avatar">
          {user?.avatar
            ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : initials
          }
        </div>
        <div className="sb-user-info">
          <div className="sb-user-name">{user?.name || "User"}</div>
          <div className="sb-user-role">{role} · {user?.state || "India"}</div>
        </div>
      </div>

      <div className="sb-divider"/>

      {/* Menu */}
      <nav className="sb-nav">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sb-item${isActive ? " sb-item--active" : ""}`
            }
          >
            <Icon name={item.icon}/>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sb-divider"/>

      {/* Bottom */}
      <div className="sb-bottom">
        <NavLink
          to={
            role === "farmer" ? "/farmer/profile" :
            role === "buyer"  ? "/buyer/profile"  : "/admin/profile"
          }
          className={({ isActive }) =>
            `sb-item${isActive ? " sb-item--active" : ""}`
          }
        >
          <Icon name="user"/>
          <span>Profile</span>
        </NavLink>
        <button className="sb-item sb-logout" onClick={handleLogout}>
          <Icon name="logout"/>
          <span>Sign out</span>
        </button>
      </div>

      <style>{`
        .sb {
          width: 210px; min-width: 210px;
          background: #F8FBF6;
          border-right: 1px solid #E0EAD8;
          display: flex; flex-direction: column;
          padding: 16px 10px;
          min-height: 100vh;
        }

        .sb-user {
          display: flex; align-items: center; gap: 10px;
          padding: 4px 6px 12px;
        }
        .sb-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: #1B5E20; color: #fff;
          font-size: 13px; font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .sb-user-name {
          font-size: 13px; font-weight: 600; color: #0A2E0C;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 130px;
        }
        .sb-user-role {
          font-size: 11px; color: #7A8F76; text-transform: capitalize; margin-top: 1px;
        }

        .sb-divider { height: 1px; background: #E0EAD8; margin: 6px 0; }

        .sb-nav    { display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .sb-bottom { display: flex; flex-direction: column; gap: 2px; }

        .sb-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; border-radius: 7px;
          font-size: 13px; color: #5C6B5A;
          text-decoration: none; cursor: pointer;
          background: none; border: none; width: 100%;
          text-align: left; font-family: inherit;
          border-left: 3px solid transparent;
          transition: all 0.12s ease;
        }
        .sb-item:hover      { background: #EDF5EB; color: #1B5E20; border-left-color: #A5D6A7; }
        .sb-item--active    { background: #E8F5E9; color: #1B5E20; font-weight: 500; border-left-color: #1B5E20; }
        .sb-logout          { color: #B91C1C !important; }
        .sb-logout:hover    { background: #FEF2F2 !important; border-left-color: #FECACA !important; }
      `}</style>
    </aside>
  );
}
