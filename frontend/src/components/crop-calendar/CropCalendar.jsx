import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState } from "react";
import CalendarEvent from "./CalendarEvent";
import { mockCalendarEvents } from "../../mockdata/calendarEventsMock";

function CropCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return mockCalendarEvents.filter((e) => e.date === dateStr);
  };

  const eventsOnSelected = getEventsForDate(selectedDate);

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
        <h3 className="text-lg font-semibold text-green-800 mb-3">
          {selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </h3>
        {eventsOnSelected.length === 0 ? (
          <p className="text-sm text-gray-400">No activities scheduled for this date.</p>
        ) : (
          <div className="space-y-2">
            {eventsOnSelected.map((e) => (
              <CalendarEvent key={e._id} event={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CropCalendar;