// src/redux/slices/mandiSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

const normalizeRate = (rate) => ({
  ...rate,
  crop: rate.crop ?? rate.cropName,
  market: rate.market ?? rate.mandiName,
  price: Number(rate.price ?? rate.modalPrice ?? 0),
  minPrice: rate.minPrice != null ? Number(rate.minPrice) : rate.minPrice,
  maxPrice: rate.maxPrice != null ? Number(rate.maxPrice) : rate.maxPrice,
});

export const fetchMandiRates = createAsyncThunk(
  'mandi/fetchRates',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.crop && filters.crop !== 'All') params.append('commodity', filters.crop);
      if (filters.state && filters.state !== 'All') params.append('state', filters.state);

      const { data } = await axiosInstance.get(`/v1/mandi/live?${params.toString()}`);
      return (data.data ?? []).map(normalizeRate);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch mandi rates');
    }
  }
);

export const fetchPriceHistory = createAsyncThunk(
  'mandi/fetchPriceHistory',
  async (crop, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (crop) params.append('cropName', crop);

      const { data } = await axiosInstance.get(`/v1/mandi/saved?${params.toString()}`);
      const history = (data.data ?? []).map(normalizeRate).map((rate) => ({
        date: rate.date,
        price: rate.price,
      }));
      return { crop, history };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch price history');
    }
  }
);

const mandiSlice = createSlice({
  name: 'mandi',
  initialState: {
    rates: [],
    priceHistory: {},
    liveRates: {},
    loading: false,
    historyLoading: false,
    error: null,
  },
  reducers: {
    updateLiveRate(state, action) {
      const { crop, price, market } = action.payload;
      state.liveRates[`${crop}_${market}`] = price;

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
