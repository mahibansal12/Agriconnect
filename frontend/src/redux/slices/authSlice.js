// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

// ─── Per-role session storage helpers ─────────────────────────

/** Decode JWT payload without verifying signature */
function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null; // ms
  } catch {
    return null;
  }
}

/** Returns true if the token exists and has not expired yet */
function isTokenValid(token) {
  if (!token) return false;
  const exp = getTokenExpiry(token);
  return exp ? Date.now() < exp : true; // if no exp claim, assume valid
}

const ROLE_SESSION_KEY = (role) => `agriconnect_session_${role}`;

/** Save a full session object under its role key */
function saveRoleSession(role, { user, accessToken }) {
  if (!role || !accessToken) return;
  try {
    localStorage.setItem(
      ROLE_SESSION_KEY(role),
      JSON.stringify({ user, accessToken })
    );
  } catch { /* storage full / private mode */ }
}

/** Load and return a session for a role if the token is still valid */
function loadRoleSession(role) {
  try {
    const raw = localStorage.getItem(ROLE_SESSION_KEY(role));
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!isTokenValid(session.accessToken)) {
      localStorage.removeItem(ROLE_SESSION_KEY(role)); // clean up expired
      return null;
    }
    return session; // { user, accessToken }
  } catch {
    return null;
  }
}

// ─── Main session helpers (active slot) ───────────────────────

const normalizeAuthData = (payload) => payload?.data ?? payload ?? {};

const persistSession = ({ user, accessToken }) => {
  if (accessToken) localStorage.setItem("agriconnect_token", accessToken);
  if (user)        localStorage.setItem("agriconnect_user", JSON.stringify(user));
  // Also cache under the role-specific key so we can restore without login
  if (user?.role)  saveRoleSession(user.role, { user, accessToken });
};

// ─── Async Thunks ─────────────────────────────────────────────

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

/**
 * switchToRole(targetRole)
 *
 * 1. Saves the current session under the current role's cache slot.
 * 2. Looks up the target role's cached session.
 *    - If valid → restores it (no login needed), returns { session, needsLogin: false }
 *    - If missing/expired → returns { needsLogin: true, targetRole }
 */
export const switchToRole = createAsyncThunk(
  "auth/switchToRole",
  async (targetRole, { getState }) => {
    const { user, token } = getState().auth;

    // 1. Persist the current session so we can come back to it later
    if (user?.role && token) {
      saveRoleSession(user.role, { user, accessToken: token });
    }

    // 2. Try restoring the target role's cached session
    const cached = loadRoleSession(targetRole);
    if (cached) {
      // Update the active slot
      localStorage.setItem("agriconnect_token", cached.accessToken);
      localStorage.setItem("agriconnect_user", JSON.stringify(cached.user));
      return { session: cached, needsLogin: false };
    }

    return { needsLogin: true, targetRole };
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
      // Note: role-specific caches are intentionally kept so switching back works
    },

    // Clear all role caches (used on explicit "Sign out from all")
    logoutAllRoles(state) {
      state.user    = null;
      state.token   = null;
      state.error   = null;
      state.loading = false;
      localStorage.removeItem("agriconnect_token");
      localStorage.removeItem("agriconnect_user");
      ["farmer", "buyer", "admin"].forEach((r) =>
        localStorage.removeItem(ROLE_SESSION_KEY(r))
      );
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
        // Keep role cache in sync too
        if (state.user.role && state.token) {
          saveRoleSession(state.user.role, {
            user: state.user,
            accessToken: state.token,
          });
        }
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

    // ── Switch role ───────────────────────────────────────────
    builder
      .addCase(switchToRole.fulfilled, (state, action) => {
        if (!action.payload.needsLogin) {
          const { session } = action.payload;
          state.user  = session.user;
          state.token = session.accessToken;
          state.error = null;
        }
        // If needsLogin=true, state is unchanged; Navbar will navigate to /login
      });
  },
});

export const { logoutUser, logoutAllRoles, clearAuthError, updateUserInfo } = authSlice.actions;
export default authSlice.reducer;
