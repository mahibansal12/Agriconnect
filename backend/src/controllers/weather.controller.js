// src/controllers/weather.controller.js

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import {
    getCurrentWeather,
    getWeatherForecast,
    getWeatherByCoords,
} from "../services/weather.service.js";
// GET /api/v1/weather/current?city=Delhi
// public — any farmer can check weather
const fetchCurrentWeather = asyncHandler(async (req, res) => {
    const { city } = req.query;

    if (!city) {
        throw new ApiError(400, "City name is required");
    }

    const data = await getCurrentWeather(city);

    // extract only what frontend needs
    // don't send the entire raw OpenWeatherMap response
    const weather = {
        city: data.name,
        country: data.sys.country,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        windSpeed: data.wind.speed,
        visibility: data.visibility,
    };

    return res
        .status(200)
        .json(new ApiResponse(200, weather, "Weather fetched successfully"));
});

// GET /api/v1/weather/forecast?city=Delhi
// public
const fetchWeatherForecast = asyncHandler(async (req, res) => {
    const { city } = req.query;

    if (!city) {
        throw new ApiError(400, "City name is required");
    }

    const data = await getWeatherForecast(city);

    // OpenWeatherMap returns forecast every 3 hours
    // we filter only one reading per day (12:00:00 noon)
    const dailyForecast = data.list
        .filter((item) => item.dt_txt.includes("12:00:00"))
        .map((item) => ({
            date: item.dt_txt.split(" ")[0],
            temperature: item.main.temp,
            humidity: item.main.humidity,
            description: item.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
            windSpeed: item.wind.speed,
        }));

    return res
        .status(200)
        .json(
            new ApiResponse(200, dailyForecast, "Forecast fetched successfully")
        );
});

// add this new controller
// GET /api/v1/weather/coords?lat=28.6&lon=77.4
const fetchWeatherByCoords = asyncHandler(async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        throw new ApiError(400, "Latitude and longitude are required");
    }

    const data = await getWeatherByCoords(lat, lon);

    const weather = {
        city: data.name,
        country: data.sys.country,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        windSpeed: data.wind.speed,
        visibility: data.visibility,
    };

    return res
        .status(200)
        .json(new ApiResponse(200, weather, "Weather fetched successfully"));
});

// add to exports:
export {
    fetchCurrentWeather,
    fetchWeatherForecast,
    fetchWeatherByCoords,
};
