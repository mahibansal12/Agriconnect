const categoryConfig = {
  seeds:      { icon: "🌱", bg: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "#4ade80", accent: "#16a34a", badgeBg: "#dcfce7", badgeText: "#166534", iconBg: "#16a34a",  ring: "#86efac", topBar: "#22c55e" },
  fertilizer: { icon: "🧪", bg: "linear-gradient(135deg,#f0fdfa,#ccfbf1)", border: "#2dd4bf", accent: "#0d9488", badgeBg: "#ccfbf1", badgeText: "#134e4a", iconBg: "#0f766e",  ring: "#5eead4", topBar: "#14b8a6" },
  pesticide:  { icon: "🐛", bg: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "#fb923c", accent: "#ea580c", badgeBg: "#ffedd5", badgeText: "#7c2d12", iconBg: "#c2410c",  ring: "#fdba74", topBar: "#f97316" },
  equipment:  { icon: "🚜", bg: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "#60a5fa", accent: "#2563eb", badgeBg: "#dbeafe", badgeText: "#1e3a8a", iconBg: "#1d4ed8",  ring: "#93c5fd", topBar: "#3b82f6" },
  general:    { icon: "🏪", bg: "linear-gradient(135deg,#faf5ff,#ede9fe)", border: "#a78bfa", accent: "#7c3aed", badgeBg: "#ede9fe", badgeText: "#4c1d95", iconBg: "#7c3aed",  ring: "#c4b5fd", topBar: "#8b5cf6" },
};

const categoryLabel = {
  seeds: "Seeds", fertilizer: "Fertilizer",
  pesticide: "Pesticide", equipment: "Equipment", general: "General",
};

function ShopCard({ shop, distance, onSelect, isActive, index }) {
  const cfg = categoryConfig[shop.category] || categoryConfig.general;

  return (
    <button
      onClick={() => onSelect(isActive ? null : shop)}
      style={{
        width: "100%",
        textAlign: "left",
        borderRadius: "16px",
        padding: "0",
        border: `2px solid ${isActive ? cfg.accent : cfg.border}`,
        background: isActive ? cfg.bg : "#fff",
        boxShadow: isActive
          ? `0 6px 24px ${cfg.ring}77, 0 0 0 3px ${cfg.ring}55`
          : `0 2px 10px rgba(0,0,0,0.06)`,
        cursor: "pointer",
        transition: "all 0.2s ease",
        overflow: "hidden",
        transform: isActive ? "scale(1.015)" : "scale(1)",
        outline: "none",
        position: "relative",
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.boxShadow = `0 8px 24px ${cfg.ring}55`;
          e.currentTarget.style.transform = "scale(1.01) translateY(-1px)";
          e.currentTarget.style.borderColor = cfg.accent;
          e.currentTarget.style.background = cfg.bg;
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)";
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.borderColor = cfg.border;
          e.currentTarget.style.background = "#fff";
        }
      }}
    >
      {/* Top accent bar */}
      <div style={{
        height: "5px",
        background: `linear-gradient(90deg, ${cfg.topBar}, ${cfg.ring})`,
        width: "100%",
      }} />

      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>

          {/* Icon */}
          <div style={{
            width: "48px", height: "48px", flexShrink: 0,
            borderRadius: "14px",
            background: `linear-gradient(135deg, ${cfg.iconBg}, ${cfg.accent})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px",
            boxShadow: `0 4px 14px ${cfg.ring}88`,
            border: `1.5px solid ${cfg.ring}`,
          }}>
            {cfg.icon}
          </div>

          {/* Name + badge + distance */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
              <h3 style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.3,
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {shop.name}
              </h3>

              {/* Distance pill */}
              {distance && (
                <div style={{
                  flexShrink: 0,
                  background: "#fff",
                  border: `1.5px solid ${cfg.border}`,
                  borderRadius: "10px",
                  padding: "4px 9px",
                  textAlign: "center",
                  boxShadow: `0 2px 6px ${cfg.ring}44`,
                }}>
                  <div style={{ fontSize: "11px", color: cfg.accent, fontWeight: 800, lineHeight: 1.2 }}>
                    📍 {distance}
                  </div>
                  <div style={{ fontSize: "9px", color: "#9ca3af", fontWeight: 500 }}>km away</div>
                </div>
              )}
            </div>

            {/* Category badge */}
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              marginTop: "5px",
              padding: "3px 9px",
              borderRadius: "999px",
              background: cfg.badgeBg,
              color: cfg.badgeText,
              fontSize: "10px",
              fontWeight: 700,
              border: `1px solid ${cfg.border}`,
              textTransform: "capitalize",
              letterSpacing: "0.4px",
            }}>
              {categoryLabel[shop.category] || shop.category}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          margin: "13px 0 11px",
          height: "1px",
          background: `linear-gradient(90deg, ${cfg.border}66, transparent)`,
        }} />

        {/* Address & Phone */}
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{
              width: "22px", height: "22px", flexShrink: 0,
              background: cfg.badgeBg, borderRadius: "6px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px",
              border: `1px solid ${cfg.border}`,
            }}>📌</span>
            <span style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.5, paddingTop: "3px" }}>
              {shop.address}, {shop.district}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              width: "22px", height: "22px", flexShrink: 0,
              background: cfg.badgeBg, borderRadius: "6px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px",
              border: `1px solid ${cfg.border}`,
            }}>📞</span>
            <span style={{ fontSize: "12px", color: cfg.accent, fontWeight: 700 }}>
              {shop.phone}
            </span>
          </div>
        </div>
      </div>

      {/* Active glow bottom strip */}
      {isActive && (
        <div style={{
          height: "4px",
          background: `linear-gradient(90deg, ${cfg.accent}, ${cfg.ring}, transparent)`,
        }} />
      )}
    </button>
  );
}

export default ShopCard;
