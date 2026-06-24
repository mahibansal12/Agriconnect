import { useState, useEffect } from "react";
import { mockWeatherData } from "../mockdata/weatherMock";

// TODO: once Mahi's weather.service.js + backend route is ready, replace
// the setTimeout below with: axiosInstance.get(`/weather?lat=${lat}&lon=${lon}`)

export function useWeather(location = "Jaipur, Rajasthan") {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setWeather({ ...mockWeatherData, location });
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [location]);

  return { weather, loading, error };
}