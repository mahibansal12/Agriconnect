import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import CalendarEvent from "./CalendarEvent";

function CropCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/v1/crop-calendar");
      setEvents(res.data.data || []);
    } catch (err) {
      console.error("Crop calendar fetch error:", err);
      setError("Failed to load crop activities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCalendar(); }, []);

  const getEventsForMonth = (date) => {
    const selectedMonth = date.getMonth() + 1;
    return events.filter((e) => e.month === selectedMonth);
  };

  const eventsOnSelectedMonth = getEventsForMonth(activeStartDate);
  const monthName = activeStartDate.toLocaleDateString("en-IN", { month: "long" });
  const monthNum = activeStartDate.getMonth() + 1;

  const handleActiveStartDateChange = ({ activeStartDate: next }) => { if (next) setActiveStartDate(next); };
  const handleDateChange = (date) => { setSelectedDate(date); setActiveStartDate(date); };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start" }}>

      {/* ── Calendar Panel ── */}
      <div style={{
        background: "#fff",
        borderRadius: "22px",
        border: "2px solid #bbf7d0",
        boxShadow: "0 6px 28px rgba(22,163,74,0.10)",
        overflow: "hidden",
      }}>
        {/* Panel header */}
        <div style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", borderBottom: "1.5px solid #bbf7d0", padding: "18px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "0 3px 10px rgba(22,163,74,0.3)" }}>📅</div>
          <div>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#14532d" }}>Farming Calendar</h3>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#4b7a5c" }}>Click a month to see scheduled activities</p>
          </div>
        </div>

        {/* Calendar */}
        <div style={{ padding: "20px 24px 24px" }}>
          <style>{`
            .agri-calendar { font-family: inherit; width: 100%; background: none; border: none; }
            .agri-calendar .react-calendar__navigation { display:flex; align-items:center; margin-bottom:20px; gap:4px; }
            .agri-calendar .react-calendar__navigation button { background:none; border:none; cursor:pointer; border-radius:10px; padding:8px 14px; font-weight:700; font-size:14px; color:#374151; transition:all 0.15s; font-family:inherit; }
            .agri-calendar .react-calendar__navigation button:hover { background:#dcfce7; color:#14532d; }
            .agri-calendar .react-calendar__navigation__label { flex:1; font-size:16px; font-weight:800; color:#14532d; }
            .agri-calendar .react-calendar__month-view__weekdays { margin-bottom:8px; }
            .agri-calendar .react-calendar__month-view__weekdays__weekday { text-align:center; padding:8px 0; font-size:11px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; text-decoration:none; }
            .agri-calendar .react-calendar__month-view__weekdays__weekday abbr { text-decoration:none; }
            .agri-calendar .react-calendar__tile { background:none; border:none; cursor:pointer; border-radius:12px; padding:12px 6px; font-size:14px; font-weight:600; color:#374151; transition:all 0.15s; font-family:inherit; }
            .agri-calendar .react-calendar__tile:hover { background:#dcfce7; color:#14532d; }
            .agri-calendar .react-calendar__tile--now { background:#f0fdf4; color:#16a34a; font-weight:900; border:2px solid #86efac; }
            .agri-calendar .react-calendar__tile--active { background:linear-gradient(135deg,#14532d,#16a34a) !important; color:#fff !important; font-weight:800; box-shadow:0 4px 14px rgba(22,163,74,0.35); }
            .agri-calendar .react-calendar__month-view__days__day--neighboringMonth { color:#d1d5db; }
            .agri-calendar .react-calendar__month-view__days__day--weekend { color:#374151; }
          `}</style>
          <Calendar
            className="agri-calendar"
            value={selectedDate}
            onChange={handleDateChange}
            onActiveStartDateChange={handleActiveStartDateChange}
          />
        </div>

        {/* Season legend */}
        <div style={{ padding: "14px 24px 20px", borderTop: "1px solid #f0fdf4" }}>
          <p style={{ margin: "0 0 10px", fontSize: "11px", color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Farming Seasons</p>
          <div style={{ display: "flex", gap: "12px" }}>
            {[
              { label: "Kharif", months: "Jun–Sep", color: "#16a34a", bg: "#dcfce7", border: "#86efac" },
              { label: "Rabi", months: "Oct–Mar", color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
              { label: "Zaid", months: "Apr–May", color: "#f59e0b", bg: "#fef3c7", border: "#fcd34d" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "7px", background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: "999px", padding: "5px 12px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: s.color }}>{s.label}</span>
                <span style={{ fontSize: "10px", color: s.color, opacity: 0.7 }}>{s.months}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Events Panel ── */}
      <div style={{
        background: "#fff",
        borderRadius: "22px",
        border: "2px solid #bbf7d0",
        boxShadow: "0 6px 28px rgba(22,163,74,0.10)",
        overflow: "hidden",
      }}>
        {/* Panel header */}
        <div style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", borderBottom: "1.5px solid #bbf7d0", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "0 3px 10px rgba(22,163,74,0.3)" }}>🗓️</div>
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#14532d" }}>{monthName} Activities</h3>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#4b7a5c" }}>Month {monthNum} of 12</p>
            </div>
          </div>
          {!loading && (
            <div style={{ background: "#16a34a", color: "#fff", fontSize: "12px", fontWeight: 800, padding: "4px 12px", borderRadius: "999px", boxShadow: "0 2px 8px rgba(22,163,74,0.35)" }}>
              {eventsOnSelectedMonth.length}
            </div>
          )}
        </div>

        {/* Events content */}
        <div style={{ padding: "16px" }}>
          {error && (
            <div style={{ marginBottom: "14px", padding: "12px 16px", borderRadius: "12px", background: "#fee2e2", border: "1.5px solid #fca5a5", color: "#991b1b", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[1, 2, 3].map(n => (
                <div key={n} style={{ padding: "16px", borderRadius: "14px", border: "1.5px solid #f0fdf4", background: "#f9fafb" }}>
                  <div style={{ height: "12px", background: "#e5e7eb", borderRadius: "6px", width: "40%", marginBottom: "8px" }} />
                  <div style={{ height: "10px", background: "#e5e7eb", borderRadius: "6px", width: "70%" }} />
                </div>
              ))}
            </div>
          ) : eventsOnSelectedMonth.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "44px", marginBottom: "12px" }}>🌾</div>
              <p style={{ margin: 0, fontWeight: 700, color: "#6b7280", fontSize: "14px" }}>No activities this month</p>
              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#9ca3af" }}>Navigate to another month to see scheduled farming activities.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {eventsOnSelectedMonth.map((e) => (
                <CalendarEvent key={e._id} event={e} />
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #f0fdf4", background: "#f9fafb", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "#9ca3af" }}>💡 Activities are fetched from your crop calendar records</span>
        </div>
      </div>
    </div>
  );
}

export default CropCalendar;