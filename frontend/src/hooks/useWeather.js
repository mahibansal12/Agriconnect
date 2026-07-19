import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

export function useWeather(location = "", coords = null) {
  const [current, setCurrent]   = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const city = location.split(",")[0].trim();

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // use coordinates if available — more accurate, no city name spelling issues
      const currentRes = coords
        ? await axiosInstance.get("/v1/weather/coords", {
            params: { lat: coords.lat, lon: coords.lon },
          })
        : await axiosInstance.get("/v1/weather/current", { params: { city } });

      // forecast always uses city name
      const forecastRes = await axiosInstance.get("/v1/weather/forecast", {
        params: { city: currentRes.data?.data?.city || city },
      });

      if (currentRes.data?.success) setCurrent(currentRes.data.data);
      if (forecastRes.data?.success) setForecast(forecastRes.data.data || []);

    } catch (err) {
      console.error("Weather fetch failed:", err);
      setError("Unable to fetch weather. Please try again.");
      setCurrent(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coords || city) {
      fetchWeatherData();
    }
  }, [city, JSON.stringify(coords)]);

  return { current, forecast, loading, error, retry: fetchWeatherData };
}