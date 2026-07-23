import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";
import CalendarEvent from "./CalendarEvent";
import AddEventModal from "./AddEventModal";

function CropCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [personalEvents, setPersonalEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);

  // Refs for scrolling to events
  const eventRefs = useRef({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/v1/farmer-events");
      setPersonalEvents(res.data.data || []);
    } catch (err) {
      console.error("Calendar fetch error:", err);
      if (err.response?.status === 401) {
          setError("Please log in to manage your farming schedule.");
      } else {
          setError("Failed to load your activities.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEditEvent = (event) => {
    setEventToEdit(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (event) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        await axiosInstance.delete(`/v1/farmer-events/${event._id}`);
        fetchData();
      } catch (err) {
        console.error("Failed to delete event", err);
      }
    }
  };

  const handleMarkDoneEvent = async (event) => {
    try {
      await axiosInstance.patch(`/v1/farmer-events/${event._id}`, { status: 'completed' });
      fetchData();
    } catch (err) {
      console.error("Failed to mark event done", err);
    }
  };

  const getEventsForMonth = (date) => {
    return personalEvents.filter((e) => {
      const eventDate = new Date(e.scheduledDate);
      return eventDate.getFullYear() === date.getFullYear() &&
             eventDate.getMonth() === date.getMonth();
    }).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  };

  const monthEvents = getEventsForMonth(activeStartDate);
  const monthName = activeStartDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const handleActiveStartDateChange = ({ activeStartDate: next, action }) => { 
    if (next) setActiveStartDate(next); 
  };

  const handleDateChange = (date) => { 
    setSelectedDate(date); 
    setActiveStartDate(new Date(date.getFullYear(), date.getMonth(), 1));
    
    // Scroll to the first event of this date
    const dateString = date.toDateString();
    const firstEventOfDate = monthEvents.find(e => new Date(e.scheduledDate).toDateString() === dateString);
    if (firstEventOfDate && eventRefs.current[firstEventOfDate._id]) {
      eventRefs.current[firstEventOfDate._id].scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHoveredEventId(firstEventOfDate._id);
      setTimeout(() => setHoveredEventId(null), 2000); // Remove highlight after 2s
    }
  };

  const handleEventClick = (event) => {
    const eventDate = new Date(event.scheduledDate);
    setSelectedDate(eventDate);
    setActiveStartDate(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1));
  };

  // Custom tile content to show dots for days with events
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayEvents = personalEvents.filter(e => {
        const eDate = new Date(e.scheduledDate);
        return eDate.getFullYear() === date.getFullYear() && eDate.getMonth() === date.getMonth() && eDate.getDate() === date.getDate();
      });
      if (dayEvents.length > 0) {
        return (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '4px' }}>
            {dayEvents.slice(0, 3).map((e, i) => (
              <div key={i} style={{ width: "5px", height: "5px", background: "#f59e0b", borderRadius: "50%" }} />
            ))}
            {dayEvents.length > 3 && <div style={{ width: "5px", height: "5px", background: "#f59e0b", borderRadius: "50%" }} />}
          </div>
        );
      }
    }
    return null;
  };

  // Group events by date for rendering
  const groupedEvents = monthEvents.reduce((acc, event) => {
    const dateStr = new Date(event.scheduledDate).toDateString();
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(event);
    return acc;
  }, {});

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "28px", alignItems: "start" }}>

      {/* ── Left: Calendar Panel ── */}
      <div style={{
        background: "#ffffff",
        borderRadius: "24px",
        boxShadow: "0 10px 40px -10px rgba(22,163,74,0.15)",
        overflow: "hidden",
        border: "1px solid rgba(134,239,172,0.4)"
      }}>
        {/* Header */}
        <div style={{ 
          background: "linear-gradient(135deg, #14532d 0%, #166534 100%)", 
          padding: "24px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ 
              width: "44px", height: "44px", borderRadius: "14px", 
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px",
              backdropFilter: "blur(8px)"
            }}>
              📅
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px" }}>My Schedule</h3>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#a7f3d0", fontWeight: 500 }}>Select a date to plan activities</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)} 
            style={{ 
              padding: "10px 18px", borderRadius: "12px", border: "none", 
              background: "#ffffff", color: "#166534", fontWeight: 800, fontSize: "13px",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "transform 0.2s"
            }}
            onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <span style={{ fontSize: "16px" }}>+</span> Add Event
          </button>
        </div>

        {/* Calendar Grid */}
        <div style={{ padding: "30px" }}>
          <style>{`
            .agri-calendar { font-family: inherit; width: 100%; background: none; border: none; }
            .agri-calendar .react-calendar__navigation { display:flex; align-items:center; margin-bottom:24px; gap:8px; }
            .agri-calendar .react-calendar__navigation button { background:rgba(22,163,74,0.05); border:none; cursor:pointer; border-radius:12px; padding:10px 16px; font-weight:800; font-size:16px; color:#14532d; transition:all 0.2s; font-family:inherit; }
            .agri-calendar .react-calendar__navigation button:hover { background:rgba(22,163,74,0.15); }
            .agri-calendar .react-calendar__navigation button:disabled { background:transparent; opacity: 0.5; cursor: default; }
            .agri-calendar .react-calendar__navigation__label { flex:1; font-size:18px !important; pointer-events: none; background: transparent !important; }
            
            .agri-calendar .react-calendar__month-view__weekdays { margin-bottom:12px; }
            .agri-calendar .react-calendar__month-view__weekdays__weekday { text-align:center; padding:8px 0; font-size:12px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:1px; text-decoration:none; }
            .agri-calendar .react-calendar__month-view__weekdays__weekday abbr { text-decoration:none; }
            
            .agri-calendar .react-calendar__month-view__days { gap: 4px 0; }
            .agri-calendar .react-calendar__tile { background:none; border:none; cursor:pointer; border-radius:14px; height: 60px; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding-top: 14px; font-size:15px; font-weight:700; color:#374151; transition:all 0.2s; font-family:inherit; position: relative; }
            .agri-calendar .react-calendar__tile:hover { background:#f0fdf4; color:#166534; }
            
            .agri-calendar .react-calendar__tile--now { background:#fefce8; color:#d97706; }
            .agri-calendar .react-calendar__tile--active { background:linear-gradient(135deg, #16a34a, #15803d) !important; color:#fff !important; font-weight:800; box-shadow:0 6px 16px rgba(22,163,74,0.4); transform: scale(1.05); z-index: 10;}
            
            .agri-calendar .react-calendar__month-view__days__day--neighboringMonth { color:#d1d5db; }
            .agri-calendar .react-calendar__month-view__days__day--weekend { color:#1f2937; }
          `}</style>
          <Calendar
            className="agri-calendar"
            value={selectedDate}
            onChange={handleDateChange}
            activeStartDate={activeStartDate}
            onActiveStartDateChange={handleActiveStartDateChange}
            tileContent={tileContent}
            next2Label={null}
            prev2Label={null}
          />
        </div>

        {/* Legend */}
        <div style={{ padding: "16px 30px 24px", borderTop: "1px solid rgba(22,163,74,0.1)", background: "#f8fafc" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "linear-gradient(135deg, #16a34a, #15803d)" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>Selected</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>Scheduled Event</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#fefce8", border: "1px solid #fde047" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Events List Panel ── */}
      <div style={{
        background: "#ffffff",
        borderRadius: "24px",
        boxShadow: "0 10px 40px -10px rgba(22,163,74,0.15)",
        overflow: "hidden",
        border: "1px solid rgba(134,239,172,0.4)",
        display: "flex",
        flexDirection: "column",
        height: "750px" // Fixed height to allow scrolling internally
      }}>
        {/* Header */}
        <div style={{ 
          background: "#f0fdf4", 
          borderBottom: "1px solid rgba(134,239,172,0.4)", 
          padding: "24px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between" 
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#14532d", letterSpacing: "-0.5px" }}>
              {monthName}
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#166534", fontWeight: 600 }}>
              {monthEvents.length} activities scheduled
            </p>
          </div>
        </div>

        {/* List Content */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1, scrollBehavior: "smooth" }}>
          {error && (
            <div style={{ padding: "16px", borderRadius: "14px", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "14px", fontWeight: 500, display: "flex", alignItems: "center", gap: "10px" }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[1, 2, 3].map(n => (
                <div key={n} style={{ padding: "20px", borderRadius: "16px", background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                  <div style={{ height: "14px", background: "#e2e8f0", borderRadius: "6px", width: "40%", marginBottom: "12px" }} />
                  <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "6px", width: "80%" }} />
                </div>
              ))}
            </div>
          ) : monthEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px", opacity: 0.8 }}>🌱</div>
              <h4 style={{ margin: 0, fontWeight: 800, color: "#334155", fontSize: "18px" }}>No activities planned</h4>
              <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#64748b", lineHeight: 1.5 }}>
                Your schedule for {monthName.split(' ')[0]} is completely clear. Enjoy the rest!
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                style={{ marginTop: "24px", padding: "10px 20px", borderRadius: "12px", border: "1px dashed #16a34a", background: "#f0fdf4", color: "#16a34a", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
              >
                Schedule an Activity
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {Object.keys(groupedEvents).map(dateStr => (
                <div key={dateStr}>
                  <div style={{ 
                    display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px",
                    position: "sticky", top: "-20px", background: "rgba(255,255,255,0.9)", 
                    padding: "10px 0", backdropFilter: "blur(4px)", zIndex: 1
                  }}>
                    <div style={{ 
                      background: selectedDate.toDateString() === dateStr ? "#16a34a" : "#f1f5f9", 
                      color: selectedDate.toDateString() === dateStr ? "#fff" : "#475569", 
                      padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 800 
                    }}>
                      {new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(22,163,74,0.2) 0%, transparent 100%)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {groupedEvents[dateStr].map(event => (
                      <div 
                        key={event._id} 
                        ref={el => eventRefs.current[event._id] = el}
                        onClick={() => handleEventClick(event)}
                        style={{ cursor: "pointer" }}
                      >
                        <CalendarEvent 
                          event={event} 
                          isHighlighted={hoveredEventId === event._id}
                          onEdit={handleEditEvent}
                          onDelete={handleDeleteEvent}
                          onMarkDone={handleMarkDoneEvent}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <AddEventModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEventToEdit(null); }} 
        selectedDate={selectedDate} 
        onEventAdded={() => fetchData()}
        eventToEdit={eventToEdit}
      />
    </div>
  );
}

export default CropCalendar;