function WeatherCard({ current, location }) {
  return (
    <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl p-6 shadow-sm">
      <p className="text-green-100 text-sm mb-1">Weather Today</p>
      <p className="font-medium mb-4">{location}</p>
      <div className="flex items-center gap-4">
        <span className="text-6xl">{current.icon}</span>
        <div>
          <p className="text-4xl font-bold">{current.temp}°C</p>
          <p className="text-green-100">{current.condition}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-green-500">
        <div><p className="text-green-200 text-xs">Humidity</p><p className="font-semibold">{current.humidity}%</p></div>
        <div><p className="text-green-200 text-xs">Wind</p><p className="font-semibold">{current.windSpeed} km/h</p></div>
        <div><p className="text-green-200 text-xs">Rain Chance</p><p className="font-semibold">{current.rainChance}%</p></div>
      </div>
    </div>
  );
}

export default WeatherCard;