// Matches the exact backend schema CropCalendar: (cropName, activity, month, notes)
export const mockCalendarEvents = [
  { _id: "1", cropName: "Wheat", activity: "sowing", month: 10, notes: "Sow wheat seeds at a depth of 5cm." },
  { _id: "2", cropName: "Wheat", activity: "irrigation", month: 11, notes: "First irrigation 20-25 days after sowing (CRI stage)." },
  { _id: "3", cropName: "Wheat", activity: "fertilizing", month: 11, notes: "Apply first dose of nitrogen fertilizer after irrigation." },
  { _id: "4", cropName: "Wheat", activity: "harvesting", month: 3, notes: "Harvest when spikes turn golden and dry." },
  { _id: "5", cropName: "Paddy", activity: "sowing", month: 5, notes: "Prepare nursery beds for sowing paddy seeds." },
  { _id: "6", cropName: "Paddy", activity: "irrigation", month: 6, notes: "Transplant seedlings from nursery to main field with standing water." },
  { _id: "7", cropName: "Paddy", activity: "harvesting", month: 10, notes: "Harvest when grains turn golden-yellow." },
];

export const eventColors = {
  sowing: "bg-green-100 text-green-700",
  irrigation: "bg-blue-100 text-blue-700",
  fertilizing: "bg-yellow-100 text-yellow-700",
  harvesting: "bg-amber-100 text-amber-700",
  spraying: "bg-purple-100 text-purple-700",
};

export const eventIcons = {
  sowing: "🌱",
  irrigation: "💧",
  fertilizing: "🧪",
  harvesting: "🌾",
  spraying: "💨",
};