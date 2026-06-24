export const mockWeatherData = {
  current: { temp: 32, condition: "Sunny", icon: "☀️", humidity: 42, windSpeed: 18, rainChance: 0 },
  forecast: [
    { day: "Tue", high: 33, low: 24, icon: "⛅", condition: "Partly Cloudy" },
    { day: "Wed", high: 34, low: 25, icon: "☀️", condition: "Sunny" },
    { day: "Thu", high: 32, low: 23, icon: "☀️", condition: "Sunny" },
    { day: "Fri", high: 31, low: 22, icon: "🌧️", condition: "Light Rain" },
    { day: "Sat", high: 30, low: 22, icon: "🌧️", condition: "Rain" },
    { day: "Sun", high: 31, low: 23, icon: "⛅", condition: "Partly Cloudy" },
    { day: "Mon", high: 33, low: 24, icon: "☀️", condition: "Sunny" },
  ],
  stats: { uvIndex: 7, visibility: "10 km", pressure: "1012 hPa" },
};