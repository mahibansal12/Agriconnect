import CropCalendar from "../components/crop-calendar/CropCalendar";
import Navbar from "../components/common/Navbar";

function CropCalendarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-10">
      <Navbar />

      <h1 className="text-3xl font-bold text-green-800 mb-1">Crop Calendar</h1>
      <p className="text-gray-600 mb-6">Plan your farming activities month by month.</p>
      <CropCalendar />
    </div>
  );
}

export default CropCalendarPage;