// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

// ─── Async Thunks ─────────────────────────────────────────────

const normalizeAuthData = (payload) => payload?.data ?? payload ?? {};

const persistSession = ({ user, accessToken }) => {
  if (accessToken) localStorage.setItem("agriconnect_token", accessToken);
  if (user) localStorage.setItem("agriconnect_user", JSON.stringify(user));
};

// POST /api/v1/user/register
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/v1/user/register", formData);
      const { data } = await axiosInstance.post("/v1/user/login", {
        email: formData.email,
        password: formData.password,
      });
      const session = normalizeAuthData(data);
      persistSession(session);
      return session;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    }
  }
);

// POST /api/v1/user/login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/v1/user/login", formData);
      const session = normalizeAuthData(data);
      persistSession(session);
      return session;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid email or password."
      );
    }
  }
);

// Called in App.jsx on every page refresh to restore session
export const loadUserFromStorage = createAsyncThunk(
  "auth/loadUserFromStorage",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("agriconnect_token");
      const user  = localStorage.getItem("agriconnect_user");
      if (!token || !user) return rejectWithValue("No session found");
      return { token, user: JSON.parse(user) };
    } catch {
      return rejectWithValue("Failed to restore session");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:    null,    // { _id, name, email, role, phone, state, district }
    token:   null,    // JWT string
    loading: false,
    error:   null,
  },
  reducers: {
    // Call this when logout button is clicked
    logoutUser(state) {
      state.user    = null;
      state.token   = null;
      state.error   = null;
      state.loading = false;
      localStorage.removeItem("agriconnect_token");
      localStorage.removeItem("agriconnect_user");
    },

    // Clear error when user starts retyping in form
    clearAuthError(state) {
      state.error = null;
    },

    // Manually update user info after profile edit
    updateUserInfo(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("agriconnect_user", JSON.stringify(state.user));
      }
    },
  },

  extraReducers: (builder) => {

    // ── Register ──────────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.error   = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── Login ─────────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.error   = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── Load from localStorage ────────────────────────────────
    builder
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.user  = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loadUserFromStorage.rejected, (state) => {
        state.user  = null;
        state.token = null;
      });
  },
});

export const { logoutUser, clearAuthError, updateUserInfo } = authSlice.actions;
export default authSlice.reducer;
