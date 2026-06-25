// src/redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

// ─── Async Thunks ─────────────────────────────────────────────

// GET /api/v1/orders/farmer  → all orders received by this farmer
export const fetchFarmerOrders = createAsyncThunk(
  'cart/fetchFarmerOrders',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/v1/orders/farmer');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// PATCH /api/v1/orders/:id/status  → farmer updates order status
export const updateOrderStatus = createAsyncThunk(
  'cart/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/v1/orders/${orderId}/status`, { status });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update order');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    orders: [],        // farmer's received orders
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearCartMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {

    // ── fetchFarmerOrders ───────────────────────────────────
    builder
      .addCase(fetchFarmerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarmerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchFarmerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── updateOrderStatus ───────────────────────────────────
    builder
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) state.orders[idx] = action.payload;
        state.successMessage = 'Order status updated.';
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearCartMessages } = cartSlice.actions;
export default cartSlice.reducer;
