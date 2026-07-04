import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState } from "react";
import CalendarEvent from "./CalendarEvent";
import { mockCalendarEvents } from "../../mockdata/calendarEventsMock";

function CropCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter activities scheduled for the selected month (1-12)
  const getEventsForMonth = (date) => {
    const selectedMonth = date.getMonth() + 1; // getMonth() is 0-indexed
    return mockCalendarEvents.filter((e) => e.month === selectedMonth);
  };

  const eventsOnSelectedMonth = getEventsForMonth(selectedDate);
  const monthName = selectedDate.toLocaleDateString("en-IN", { month: "long" });

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
        <Calendar value={selectedDate} onChange={setSelectedDate} />
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100 h-fit">
        <h3 className="text-lg font-bold text-green-800 mb-1">
          📅 {monthName} Activities
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Activities scheduled for this month (Month {selectedDate.getMonth() + 1})
        </p>
        
        {eventsOnSelectedMonth.length === 0 ? (
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