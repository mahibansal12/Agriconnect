// src/routes/weather.routes.js

import { Router } from "express";
import {
    fetchCurrentWeather,
    fetchWeatherForecast,
} from "../controllers/weather.controller.js";

const router = Router();

// both public — no login needed to check weather
router.get("/current", fetchCurrentWeather);
router.get("/forecast", fetchWeatherForecast);

export default router;