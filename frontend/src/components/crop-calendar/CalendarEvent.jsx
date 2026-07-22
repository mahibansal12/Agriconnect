import { eventIcons } from "../../mockdata/calendarEventsMock";

const activityStyle = {
  sowing: { bg: "#f0fdf4", text: "#166534", border: "#86efac", topBar: "#16a34a" },
  harvesting: { bg: "#fffbeb", text: "#92400e", border: "#fde047", topBar: "#f59e0b" },
  irrigation: { bg: "#eff6ff", text: "#1e3a8a", border: "#93c5fd", topBar: "#3b82f6" },
  fertilizing: { bg: "#faf5ff", text: "#5b21b6", border: "#d8b4fe", topBar: "#a855f7" },
  spraying: { bg: "#fff7ed", text: "#9a3412", border: "#fdba74", topBar: "#f97316" },
  other: { bg: "#f8fafc", text: "#334155", border: "#cbd5e1", topBar: "#64748b" }
};

function CalendarEvent({ event, isHighlighted }) {
  const sty = activityStyle[event.activityType] || activityStyle.other;
  const label = event.activityType ? event.activityType.charAt(0).toUpperCase() + event.activityType.slice(1) : "Activity";
  const icon = eventIcons?.[event.activityType] || "📋";
  
  return (
    <div style={{
      background: isHighlighted ? sty.bg : "#ffffff",
      borderRadius: "16px",
      border: `2px solid ${isHighlighted ? sty.topBar : "rgba(241,245,249,1)"}`,
      overflow: "hidden",
      boxShadow: isHighlighted ? `0 8px 24px ${sty.border}88` : "0 4px 14px rgba(0,0,0,0.03)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: isHighlighted ? "scale(1.02) translateY(-2px)" : "scale(1)",
    }}
      onMouseEnter={e => { 
        if (!isHighlighted) {
          e.currentTarget.style.transform = "translateY(-2px)"; 
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
          e.currentTarget.style.border = `2px solid ${sty.border}`;
        }
      }}
      onMouseLeave={e => { 
        if (!isHighlighted) {
          e.currentTarget.style.transform = "translateY(0)"; 
          e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.03)"; 
          e.currentTarget.style.border = "2px solid rgba(241,245,249,1)";
        }
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: "5px", background: `linear-gradient(90deg,${sty.topBar},${sty.border})` }} />

      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: event.notes ? "12px" : "0" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              width: "40px", height: "40px", borderRadius: "12px", 
              background: sty.bg, border: `1px solid ${sty.border}`, 
              display: "flex", alignItems: "center", justifyContent: "center", 
              fontSize: "18px", flexShrink: 0 
            }}>
              {icon}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p style={{ margin: 0, fontWeight: 800, color: "#1e293b", fontSize: "15px", letterSpacing: "-0.3px" }}>
                {event.title}
              </p>
              {event.cropName && (
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                  🌾 Crop: {event.cropName}
                </p>
              )}
            </div>
          </div>
          
          <span style={{ 
            background: sty.bg, color: sty.text, border: `1px solid ${sty.border}`, 
            borderRadius: "8px", padding: "4px 12px", fontSize: "11px", 
            fontWeight: 800, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.5px"
          }}>
            {label}
          </span>
        </div>

        {/* Notes */}
        {event.notes && (
          <div style={{ 
            background: "#f8fafc", border: "1px solid #f1f5f9", 
            borderRadius: "10px", padding: "10px 14px", marginTop: "12px" 
          }}>
            <p style={{ margin: 0, fontSize: "12.5px", color: "#475569", fontWeight: 500, lineHeight: 1.5 }}>
              <span style={{ opacity: 0.6, marginRight: "4px" }}>📝</span> {event.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarEvent;