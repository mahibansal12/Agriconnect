// Matches the exact backend payload from OpenWeather API (temperature in C, windSpeed in m/s)
export const mockCurrentWeatherResponse = {
  city: "Jaipur",
  country: "IN",
  temperature: 32,
  feelsLike: 34,
  humidity: 42,
  description: "clear sky",
  icon: "https://openweathermap.org/img/wn/01d@2x.png",
  windSpeed: 5, // 5 m/s = 18 km/h
  visibility: 10000,
};

export const mockForecastWeatherResponse = [
  {
    date: "2026-07-04",
    temperature: 33,
    humidity: 44,
    description: "partly cloudy",
    icon: "https://openweathermap.org/img/wn/02d@2x.png",
    windSpeed: 4.4 // m/s = ~16 km/h
  },
  {
    date: "2026-07-05",
    temperature: 34,
    humidity: 40,
    description: "clear sky",
    icon: "https://openweathermap.org/img/wn/01d@2x.png",
    windSpeed: 3.3 // m/s = ~12 km/h
  },
  {
    date: "2026-07-06",
    temperature: 32,
    humidity: 41,
    description: "clear sky",
    icon: "https://openweathermap.org/img/wn/01d@2x.png",
    windSpeed: 2.8 // m/s = ~10 km/h
  },
  {
    date: "2026-07-07",
    temperature: 31,
    humidity: 55,
    description: "light rain",
    icon: "https://openweathermap.org/img/wn/10d@2x.png",
    windSpeed: 6.1 // m/s = ~22 km/h
  },
  {
    date: "2026-07-08",
    temperature: 30,
    humidity: 62,
    description: "heavy intensity rain",
    icon: "https://openweathermap.org/img/wn/09d@2x.png",
    windSpeed: 6.9 // m/s = ~25 km/h
  },
  {
    date: "2026-07-09",
    temperature: 31,
    humidity: 48,
    description: "partly cloudy",
    icon: "https://openweathermap.org/img/wn/02d@2x.png",
    windSpeed: 4.2 // m/s = ~15 km/h
  },
  {
    date: "2026-07-10",
    temperature: 33,
    humidity: 45,
    description: "clear sky",
    icon: "https://openweathermap.org/img/wn/01d@2x.png",
    windSpeed: 3.9 // m/s = ~14 km/h
  }
];