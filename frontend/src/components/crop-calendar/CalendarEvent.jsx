import { eventColors, eventIcons } from "../../mockdata/calendarEventsMock";

function CalendarEvent({ event }) {
  return (
    <div className={`p-3 rounded-lg ${eventColors[event.stage]}`}>
      <p className="text-sm font-semibold">{event.crop}</p>
      <p className="text-xs flex items-center gap-1 mt-1">
        {eventIcons[event.stage]} {event.activity}
      </p>
    </div>
  );
}

export default CalendarEvent;