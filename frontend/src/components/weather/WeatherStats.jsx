function WeatherStats({ stats }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
      <h3 className="text-lg font-semibold text-green-800 mb-3">Additional Stats</h3>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div><p className="text-gray-400">UV Index</p><p className="text-gray-700 font-medium">{stats.uvIndex}</p></div>
        <div><p className="text-gray-400">Visibility</p><p className="text-gray-700 font-medium">{stats.visibility}</p></div>
        <div><p className="text-gray-400">Pressure</p><p className="text-gray-700 font-medium">{stats.pressure}</p></div>
      </div>
    </div>
  );
}

export default WeatherStats;