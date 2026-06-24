// src/redux/slices/cropSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

// ─── Async Thunks ─────────────────────────────────────────────

// GET /api/v1/crops  (with optional filters)
export const fetchCrops = createAsyncThunk(
  'crops/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.type && filters.type !== 'All') params.append('type', filters.type);
      if (filters.state && filters.state !== 'All') params.append('state', filters.state);
      if (filters.district) params.append('district', filters.district);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const { data } = await axiosInstance.get(`/v1/crops?${params.toString()}`);
      return data.data; // ApiResponse wrapper → .data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch crops');
    }
  }
);

// GET /api/v1/crops/:id
export const fetchCropById = createAsyncThunk(
  'crops/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/v1/crops/${id}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch crop details');
    }
  }
);

// POST /api/v1/crops  (multipart/form-data with images)
export const addCrop = createAsyncThunk(
  'crops/add',
  async (cropFormData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/v1/crops', cropFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add crop listing');
    }
  }
);

// DELETE /api/v1/crops/:id
export const deleteCrop = createAsyncThunk(
  'crops/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/v1/crops/${id}`);
      return id; // return id so we can filter it out of state
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete crop');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────
const cropSlice = createSlice({
  name: 'crops',
  initialState: {
    list: [],           // array of crop objects from fetchCrops
    selectedCrop: null, // single crop from fetchCropById
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearCropMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    clearSelectedCrop(state) {
      state.selectedCrop = null;
    },
  },
  extraReducers: (builder) => {

    // ── fetchCrops ──────────────────────────────────────────
    builder
      .addCase(fetchCrops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCrops.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCrops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── fetchCropById ───────────────────────────────────────
    builder
      .addCase(fetchCropById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCropById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCrop = action.payload;
      })
      .addCase(fetchCropById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── addCrop ─────────────────────────────────────────────
    builder
      .addCase(addCrop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCrop.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload); // add new crop to top of list
        state.successMessage = 'Crop listed successfully!';
      })
      .addCase(addCrop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── deleteCrop ──────────────────────────────────────────
    builder
      .addCase(deleteCrop.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCrop.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((c) => c._id !== action.payload);
        state.successMessage = 'Crop listing deleted.';
      })
      .addCase(deleteCrop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCropMessages, clearSelectedCrop } = cropSlice.actions;
export default cropSlice.reducer;
