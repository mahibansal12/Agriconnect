import { eventColors, eventIcons } from "../../mockdata/calendarEventsMock";

const activityStyle = {
  sowing: { bg: "#dcfce7", text: "#166534", border: "#86efac", topBar: "#16a34a" },
  harvesting: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d", topBar: "#f59e0b" },
  irrigation: { bg: "#dbeafe", text: "#1d4ed8", border: "#93c5fd", topBar: "#3b82f6" },
  fertilizer: { bg: "#ede9fe", text: "#5b21b6", border: "#c4b5fd", topBar: "#8b5cf6" },
  pesticide: { bg: "#ffedd5", text: "#c2410c", border: "#fdba74", topBar: "#f97316" },
  pruning: { bg: "#f0fdfa", text: "#0f766e", border: "#5eead4", topBar: "#14b8a6" },
};

function CalendarEvent({ event }) {
  const sty = activityStyle[event.activity] || { bg: "#f3f4f6", text: "#374151", border: "#d1d5db", topBar: "#9ca3af" };
  const label = event.activity ? event.activity.charAt(0).toUpperCase() + event.activity.slice(1) : "";
  const icon = eventIcons?.[event.activity] || "📋";

  return (
    <div style={{
      background: "#fff",
      borderRadius: "14px",
      border: `2px solid ${sty.border}`,
      overflow: "hidden",
      boxShadow: `0 3px 12px ${sty.border}44`,
      transition: "transform 0.15s, box-shadow 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 20px ${sty.border}66`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 3px 12px ${sty.border}44`; }}
    >
      {/* Top accent bar */}
      <div style={{ height: "4px", background: `linear-gradient(90deg,${sty.topBar},${sty.border})` }} />

      <div style={{ padding: "12px 14px" }}>
        {/* Crop name + activity badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: event.notes ? "8px" : "0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: sty.bg, border: `1.5px solid ${sty.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>
              {icon}
            </div>
            <p style={{ margin: 0, fontWeight: 800, color: "#111827", fontSize: "13.5px" }}>{event.cropName}</p>
          </div>
          <span style={{ background: sty.bg, color: sty.text, border: `1.5px solid ${sty.border}`, borderRadius: "999px", padding: "3px 10px", fontSize: "10px", fontWeight: 700, flexShrink: 0, textTransform: "capitalize" }}>
            {label}
          </span>
        </div>

        {/* Notes */}
        {event.notes && (
          <div style={{ background: sty.bg, borderRadius: "8px", padding: "7px 10px", marginTop: "6px" }}>
            <p style={{ margin: 0, fontSize: "11.5px", color: sty.text, fontWeight: 500, lineHeight: 1.5 }}>
              📝 {event.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarEvent;