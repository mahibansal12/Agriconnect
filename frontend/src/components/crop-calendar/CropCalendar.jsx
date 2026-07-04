import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import CalendarEvent from "./CalendarEvent";

function CropCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [events, setEvents]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // ── Fetch calendar entries from backend ──────────────────────────────────
  const fetchCalendar = async () => {
    try {
      setLoading(true);
      setError(null);
      // GET /api/v1/crop-calendar
      const res = await axiosInstance.get("/v1/crop-calendar");
      setEvents(res.data.data || []);
    } catch (err) {
      console.error("Crop calendar fetch error:", err);
      setError("Failed to load crop activities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  // Filter activities scheduled for the active viewed month (1-12)
  const getEventsForMonth = (date) => {
    const selectedMonth = date.getMonth() + 1; // getMonth() is 0-indexed
    return events.filter((e) => e.month === selectedMonth);
  };

  const eventsOnSelectedMonth = getEventsForMonth(activeStartDate);
  const monthName = activeStartDate.toLocaleDateString("en-IN", { month: "long" });

  const handleActiveStartDateChange = ({ activeStartDate: nextStartDate }) => {
    if (nextStartDate) {
      setActiveStartDate(nextStartDate);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setActiveStartDate(date);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-green-100">
        <h3 className="text-lg font-semibold text-green-800 mb-3">Farming Calendar</h3>
        <style>{`
          .react-calendar {
            font-family: inherit;
            width: 100%;
            background: none;
            border: none;
            padding: 0;
          }
          .react-calendar__tile--active {
            background: #16a34a !important;
            color: white;
          }
          .react-calendar__tile--hover {
            background: #dcfce7;
          }
          .react-calendar__navigation {
            margin-bottom: 1rem;
          }
          .react-calendar__month-view__days__day--weekend {
            color: inherit;
          }
        `}</style>
        <Calendar 
          value={selectedDate} 
          onChange={handleDateChange} 
          onActiveStartDateChange={handleActiveStartDateChange}
        />
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100 h-fit">
        <h3 className="text-lg font-bold text-green-800 mb-1">
          📅 {monthName} Activities
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Activities scheduled for this month (Month {activeStartDate.getMonth() + 1})
        </p>

        {/* Error banner */}
        {error && (
          <div style={{ marginBottom:"14px", padding:"10px 14px", borderRadius:"10px", background:"#fee2e2", border:"1px solid #fca5a5", color:"#dc2626", fontSize:"12px" }}>
            <span>⚠️ {error}</span>
          </div>
        )}
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(n => (
              <div key={n} className="p-4 rounded-xl border border-gray-100 bg-gray-50 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : eventsOnSelectedMonth.length === 0 ? (
          <div className="text-center py-6">
            <span className="text-3xl block mb-2">🌾</span>
            <p className="text-sm text-gray-400">No activities scheduled for this month.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {eventsOnSelectedMonth.map((e) => (
              <CalendarEvent key={e._id} event={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CropCalendar;