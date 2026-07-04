import { eventColors, eventIcons } from "../../mockdata/calendarEventsMock";

function CalendarEvent({ event }) {
  const activityLabel = event.activity 
    ? event.activity.charAt(0).toUpperCase() + event.activity.slice(1)
    : "";

  return (
    <div className={`p-4 rounded-xl border ${eventColors[event.activity] || "bg-gray-50 border-gray-200 text-gray-700"}`} style={{ marginBottom: "10px" }}>
      <div className="flex justify-between items-center">
        <p className="text-sm font-extrabold">{event.cropName}</p>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70">
          {eventIcons[event.activity]} {activityLabel}
        </span>
      </div>
      {event.notes && (
        <p className="text-xs opacity-90 mt-2 font-medium">
          📝 {event.notes}
        </p>
      )}
    </div>
  );
}

export default CalendarEvent;