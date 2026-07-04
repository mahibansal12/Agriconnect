import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { mockCurrentWeatherResponse, mockForecastWeatherResponse } from "../mockdata/weatherMock";

export function useWeather(location = "Jaipur") {
  const [current, setCurrent]   = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const city = location.split(",")[0].trim();

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call current and forecast APIs in parallel
      const [currentRes, forecastRes] = await Promise.all([
        axiosInstance.get("/v1/weather/current", { params: { city } }),
        axiosInstance.get("/v1/weather/forecast", { params: { city } })
      ]);

      if (currentRes.data?.success) {
        setCurrent(currentRes.data.data);
      }
      if (forecastRes.data?.success) {
        setForecast(forecastRes.data.data || []);
      }
    } catch (err) {
      console.warn("Weather API call failed, falling back to mock weather data:", err);
      // Graceful fallback to aligned mock payloads so the page never breaks
      setCurrent(mockCurrentWeatherResponse);
      setForecast(mockForecastWeatherResponse);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (city) {
      fetchWeatherData();
    }
  }, [city]);

  return { current, forecast, loading, error, retry: fetchWeatherData };
}