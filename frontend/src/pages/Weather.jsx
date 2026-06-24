import { useWeather } from "../hooks/useWeather";
import WeatherCard from "../components/weather/WeatherCard";
import ForecastCard from "../components/weather/ForecastCard";
import WeatherStats from "../components/weather/WeatherStats";

function Weather() {
  const { weather, loading, error } = useWeather("Jaipur, Rajasthan");

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-green-50"><p className="text-gray-500">Loading weather...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-green-50"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="min-h-screen bg-green-50 px-6 py-10">
      <h1 className="text-3xl font-bold text-green-800 mb-1">Weather Dashboard</h1>
      <p className="text-gray-600 mb-6">Stay updated with current and upcoming weather for your farm.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2"><WeatherCard current={weather.current} location={weather.location} /></div>
        <WeatherStats stats={weather.stats} />
      </div>

      <h2 className="text-xl font-semibold text-green-800 mb-3">7-Day Forecast</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {weather.forecast.map((day, i) => <ForecastCard key={i} day={day} />)}
      </div>
    </div>
  );
}

export default Weather;