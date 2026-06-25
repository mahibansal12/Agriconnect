function ForecastCard({ day }) {
  return (
    <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-green-100 min-w-[100px]">
      <p className="text-gray-500 text-sm font-medium mb-2">{day.day}</p>
      <p className="text-3xl mb-2">{day.icon}</p>
      <p className="text-sm text-gray-700">
        <span className="font-semibold">{day.high}°</span>
        <span className="text-gray-400">/{day.low}°</span>
      </p>
    </div>
  );
}

export default ForecastCard;