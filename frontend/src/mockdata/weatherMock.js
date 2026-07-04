// Matches the exact output of backend controllers /api/v1/weather/current and /api/v1/weather/forecast
export const mockCurrentWeatherResponse = {
  city: "Jaipur",
  country: "IN",
  temperature: 32,
  feelsLike: 34,
  humidity: 42,
  description: "clear sky",
  icon: "https://openweathermap.org/img/wn/01d@2x.png",
  windSpeed: 18,
  visibility: 10000, // in meters
};

export const mockForecastWeatherResponse = [
  {
    date: "2026-07-04",
    temperature: 33,
    humidity: 44,
    description: "partly cloudy",
    icon: "https://openweathermap.org/img/wn/02d@2x.png",
    windSpeed: 16
  },
  {
    date: "2026-07-05",
    temperature: 34,
    humidity: 40,
    description: "clear sky",
    icon: "https://openweathermap.org/img/wn/01d@2x.png",
    windSpeed: 12
  },
  {
    date: "2026-07-06",
    temperature: 32,
    humidity: 41,
    description: "clear sky",
    icon: "https://openweathermap.org/img/wn/01d@2x.png",
    windSpeed: 10
  },
  {
    date: "2026-07-07",
    temperature: 31,
    humidity: 55,
    description: "light rain",
    icon: "https://openweathermap.org/img/wn/10d@2x.png",
    windSpeed: 22
  },
  {
    date: "2026-07-08",
    temperature: 30,
    humidity: 62,
    description: "heavy intensity rain",
    icon: "https://openweathermap.org/img/wn/09d@2x.png",
    windSpeed: 25
  },
  {
    date: "2026-07-09",
    temperature: 31,
    humidity: 48,
    description: "partly cloudy",
    icon: "https://openweathermap.org/img/wn/02d@2x.png",
    windSpeed: 15
  },
  {
    date: "2026-07-10",
    temperature: 33,
    humidity: 45,
    description: "clear sky",
    icon: "https://openweathermap.org/img/wn/01d@2x.png",
    windSpeed: 14
  }
];