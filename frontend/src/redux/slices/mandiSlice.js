// src/redux/slices/mandiSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

// ─── Async Thunks ─────────────────────────────────────────────

// GET /api/v1/mandi  (with optional filters: crop, state, market)
export const fetchMandiRates = createAsyncThunk(
  'mandi/fetchRates',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.crop)   params.append('crop', filters.crop);
      if (filters.state)  params.append('state', filters.state);
      if (filters.market) params.append('market', filters.market);

      const { data } = await axiosInstance.get(`/v1/mandi?${params.toString()}`);
      return data.data; // ApiResponse wrapper → .data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch mandi rates');
    }
  }
);

// GET /api/v1/mandi/history/:crop  (price history for chart)
export const fetchPriceHistory = createAsyncThunk(
  'mandi/fetchPriceHistory',
  async (crop, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/v1/mandi/history/${crop}`);
      return { crop, history: data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch price history');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────
const mandiSlice = createSlice({
  name: 'mandi',
  initialState: {
    rates: [],             // array of mandi rate objects
    priceHistory: {},      // { cropName: [ { date, price }, ... ] }
    liveRates: {},         // { cropName: price } — updated via socket
    loading: false,
    historyLoading: false,
    error: null,
  },
  reducers: {
    // Called by socket.io when a live price update arrives
    updateLiveRate(state, action) {
      const { crop, price, market } = action.payload;
      state.liveRates[`${crop}_${market}`] = price;

      // Also update matching entry in rates array
      const idx = state.rates.findIndex(
        (r) => r.crop === crop && r.market === market
      );
      if (idx !== -1) {
        state.rates[idx] = { ...state.rates[idx], price, isLive: true };
      }
    },
    clearMandiError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {

    // ── fetchMandiRates ─────────────────────────────────────
    builder
      .addCase(fetchMandiRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMandiRates.fulfilled, (state, action) => {
        state.loading = false;
        state.rates = action.payload;
      })
      .addCase(fetchMandiRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── fetchPriceHistory ───────────────────────────────────
    builder
      .addCase(fetchPriceHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchPriceHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.priceHistory[action.payload.crop] = action.payload.history;
      })
      .addCase(fetchPriceHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload;
      });
  },
});

export const { updateLiveRate, clearMandiError } = mandiSlice.actions;
export default mandiSlice.reducer;
