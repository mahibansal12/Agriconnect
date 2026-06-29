// mock calendar events for crop activities — matches typical farming calendar

export const mockCalendarEvents = [
  { _id: "1", crop: "Wheat", activity: "Sowing", date: "2026-10-15", stage: "sow" },
  { _id: "2", crop: "Wheat", activity: "First Irrigation", date: "2026-11-05", stage: "irrigate" },
  { _id: "3", crop: "Wheat", activity: "Fertilizer Application", date: "2026-11-20", stage: "fertilize" },
  { _id: "4", crop: "Wheat", activity: "Harvest", date: "2026-03-15", stage: "harvest" },
  { _id: "5", crop: "Paddy", activity: "Nursery Preparation", date: "2026-05-01", stage: "sow" },
  { _id: "6", crop: "Paddy", activity: "Transplanting", date: "2026-06-15", stage: "irrigate" },
  { _id: "7", crop: "Paddy", activity: "Harvest", date: "2026-10-01", stage: "harvest" },
];

export const eventColors = {
  sow: "bg-green-100 text-green-700",
  irrigate: "bg-blue-100 text-blue-700",
  fertilize: "bg-yellow-100 text-yellow-700",
  harvest: "bg-amber-100 text-amber-700",
};

export const eventIcons = {
  sow: "🌱",
  irrigate: "💧",
  fertilize: "🧪",
  harvest: "🌾",
};