// src/services/weather.service.js

import axios from "axios";

const BASE_URL = "https://api.openweathermap.org/data/2.5";
const API_KEY = process.env.OPENWEATHERMAP_API_KEY;

// get current weather by city name
const getCurrentWeather = async (city) => {
    const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
            q: city,
            appid: API_KEY,
            units: "metric",  // celsius, not fahrenheit
            lang: "en",
        },
    });
    return response.data;
};

// get 5 day forecast by city name
const getWeatherForecast = async (city) => {
    const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
            q: city,
            appid: API_KEY,
            units: "metric",
            lang: "en",
        },
    });
    return response.data;
};

// add this new function at the bottom
const getWeatherByCoords = async (lat, lon) => {
    const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
            lat,
            lon,
            appid: API_KEY,
            units: "metric",
            lang: "en",
        },
    });
    return response.data;
};

export { getCurrentWeather, getWeatherForecast, getWeatherByCoords };

