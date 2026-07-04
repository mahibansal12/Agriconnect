import { useState, useEffect } from "react";
import { mockCurrentWeatherResponse, mockForecastWeatherResponse } from "../mockdata/weatherMock";

export function useWeather(location = "Jaipur, Rajasthan") {
  const [current, setCurrent]   = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      // Return weather objects aligned to the backend response structure
      setCurrent(mockCurrentWeatherResponse);
      setForecast(mockForecastWeatherResponse);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [location]);

  return { current, forecast, loading, error };
}