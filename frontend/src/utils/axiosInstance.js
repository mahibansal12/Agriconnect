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
    const token = localStorage.getItem("agriconnect_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────
// Handles 401 (access token expired) by trying one silent refresh before
// giving up and logging the user out. Without this, short-lived access
// tokens would force a fresh login far more often than necessary —
// especially for a role the user "switched away" from, whose cached token
// keeps quietly expiring in the background.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original?._retried) {
      original._retried = true;
      const refreshToken = localStorage.getItem("agriconnect_refresh");

      if (refreshToken) {
        try {
          const { data } = await axios.post("/api/v1/user/refresh-token", { refreshToken });
          const newAccessToken = data?.data?.accessToken;
          const newRefreshToken = data?.data?.refreshToken;
          if (newAccessToken) {
            localStorage.setItem("agriconnect_token", newAccessToken);
            if (newRefreshToken) localStorage.setItem("agriconnect_refresh", newRefreshToken);
            original.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(original);
          }
        } catch {
          // Refresh token expired/invalid too — fall through to logout below.
        }
      }

      // No refresh token, or refresh failed — clear storage and redirect to login
      localStorage.removeItem("agriconnect_token");
      localStorage.removeItem("agriconnect_refresh");
      localStorage.removeItem("agriconnect_user");
      window.location.href = "/login";
    }
    // Pass the error along so individual components can show their own messages
    return Promise.reject(error);
  }
);

export default axiosInstance;
