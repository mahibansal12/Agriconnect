// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

// ─── Async Thunks ─────────────────────────────────────────────

// POST /api/auth/register
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/register", formData);
      // Save to localStorage so session persists on page refresh
     localStorage.setItem("krishi_token", data.accessToken);
      localStorage.setItem("krishi_user", JSON.stringify(data.user));
      return data; // { user: { _id, name, email, role, phone, state }, token }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    }
  }
);

// POST /api/auth/login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/login", formData);
     localStorage.setItem("krishi_token", data.data.accessToken);
    localStorage.setItem("krishi_user", JSON.stringify(data.data.user));
      return data; // { user: { _id, name, email, role, phone, state }, token }
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
      const token = localStorage.getItem("krishi_token");
      const user  = localStorage.getItem("krishi_user");
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
      localStorage.removeItem("krishi_token");
      localStorage.removeItem("krishi_user");
    },

    // Clear error when user starts retyping in form
    clearAuthError(state) {
      state.error = null;
    },

    // Manually update user info after profile edit
    updateUserInfo(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("krishi_user", JSON.stringify(state.user));
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
      state.user = action.payload.data?.user;
        state.token = action.payload.data?.accessToken;
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
        state.user = action.payload.data?.user;
        state.token = action.payload.data?.accessToken;
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
