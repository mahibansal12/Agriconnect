import { eventIcons } from "../../mockdata/calendarEventsMock";

const activityStyle = {
  sowing: { bg: "#f0fdf4", text: "#166534", border: "#86efac", topBar: "#16a34a" },
  harvesting: { bg: "#fffbeb", text: "#92400e", border: "#fde047", topBar: "#f59e0b" },
  irrigation: { bg: "#eff6ff", text: "#1e3a8a", border: "#93c5fd", topBar: "#3b82f6" },
  fertilizing: { bg: "#faf5ff", text: "#5b21b6", border: "#d8b4fe", topBar: "#a855f7" },
  spraying: { bg: "#fff7ed", text: "#9a3412", border: "#fdba74", topBar: "#f97316" },
  other: { bg: "#f8fafc", text: "#334155", border: "#cbd5e1", topBar: "#64748b" }
};

function CalendarEvent({ event, isHighlighted, onEdit, onDelete, onMarkDone }) {
  const sty = activityStyle[event.activityType] || activityStyle.other;
  const label = event.activityType ? event.activityType.charAt(0).toUpperCase() + event.activityType.slice(1) : "Activity";
  const icon = eventIcons?.[event.activityType] || "📋";
  
  const isCompleted = event.status === "completed";
  
  return (
    <div style={{
      background: isHighlighted ? sty.bg : "#ffffff",
      borderRadius: "16px",
      border: `2px solid ${isHighlighted ? sty.topBar : "rgba(241,245,249,1)"}`,
      overflow: "hidden",
      boxShadow: isHighlighted ? `0 8px 24px ${sty.border}88` : "0 4px 14px rgba(0,0,0,0.03)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: isHighlighted ? "scale(1.02) translateY(-2px)" : "scale(1)",
      opacity: isCompleted ? 0.75 : 1,
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
      <div style={{ height: "5px", background: isCompleted ? "#9ca3af" : `linear-gradient(90deg,${sty.topBar},${sty.border})` }} />

      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: event.notes ? "12px" : "0" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              width: "40px", height: "40px", borderRadius: "12px", 
              background: isCompleted ? "#f3f4f6" : sty.bg, border: `1px solid ${isCompleted ? "#d1d5db" : sty.border}`, 
              display: "flex", alignItems: "center", justifyContent: "center", 
              fontSize: "18px", flexShrink: 0 
            }}>
              {isCompleted ? "✅" : icon}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p style={{ margin: 0, fontWeight: 800, color: isCompleted ? "#6b7280" : "#1e293b", fontSize: "15px", letterSpacing: "-0.3px", textDecoration: isCompleted ? "line-through" : "none" }}>
                {event.title}
              </p>
              {event.cropName && (
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                  🌾 Crop: {event.cropName}
                </p>
              )}
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
            <span style={{ 
              background: isCompleted ? "#f3f4f6" : sty.bg, color: isCompleted ? "#6b7280" : sty.text, border: `1px solid ${isCompleted ? "#e5e7eb" : sty.border}`, 
              borderRadius: "8px", padding: "4px 12px", fontSize: "10px", 
              fontWeight: 800, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.5px"
            }}>
              {label}
            </span>
            {isCompleted && (
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 6px", borderRadius: "4px" }}>
                COMPLETED
              </span>
            )}
          </div>
        </div>

        {/* Notes */}
        {event.notes && (
          <div style={{ 
            background: "#f8fafc", border: "1px solid #f1f5f9", 
            borderRadius: "10px", padding: "10px 14px", marginTop: "12px",
            color: isCompleted ? "#94a3b8" : "#475569"
          }}>
            <p style={{ margin: 0, fontSize: "12.5px", fontWeight: 500, lineHeight: 1.5, textDecoration: isCompleted ? "line-through" : "none" }}>
              <span style={{ opacity: 0.6, marginRight: "4px" }}>📝</span> {event.notes}
            </p>
          </div>
        )}
        
        {/* Action Buttons */}
        {!isCompleted && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginTop: "16px", borderTop: "1px dashed #e2e8f0", paddingTop: "12px" }}>
            <button 
              onClick={(e) => { e.stopPropagation(); onMarkDone(event); }}
              style={{ background: "#dcfce7", color: "#166534", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", transition: "0.2s" }}
              onMouseOver={e => e.currentTarget.style.background = "#bbf7d0"}
              onMouseOut={e => e.currentTarget.style.background = "#dcfce7"}
            >
              ✓ Mark Done
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(event); }}
              style={{ background: "#f1f5f9", color: "#475569", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", transition: "0.2s" }}
              onMouseOver={e => e.currentTarget.style.background = "#e2e8f0"}
              onMouseOut={e => e.currentTarget.style.background = "#f1f5f9"}
            >
              ✏️ Edit
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(event); }}
              style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", transition: "0.2s" }}
              onMouseOver={e => e.currentTarget.style.background = "#fecaca"}
              onMouseOut={e => e.currentTarget.style.background = "#fee2e2"}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarEvent;