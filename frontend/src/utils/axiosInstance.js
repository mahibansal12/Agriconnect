import axios from "axios";

// Base URL — vite proxy forwards /api → http://localhost:5000 in dev
const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor ──────────────────────────────────────
// Automatically attaches JWT token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("krishi_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────
// Handles 401 (token expired) globally — logs user out
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem("krishi_token");
      localStorage.removeItem("krishi_user");
      window.location.href = "/login";
    }
    // Pass the error along so individual components can show their own messages
    return Promise.reject(error);
  }
);

export default axiosInstance;
