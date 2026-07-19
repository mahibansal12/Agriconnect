// src/redux/slices/cropSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

const CATEGORY_TO_API = {
  Grain: 'grains',
  Vegetable: 'vegetables',
  Fruit: 'fruits',
  Spice: 'spices',
  Oilseed: 'oilseeds',
};

const CATEGORY_FROM_API = {
  grains: 'Grain',
  vegetables: 'Vegetable',
  fruits: 'Fruit',
  spices: 'Spice',
  oilseeds: 'Oilseed',
  pulses: 'Pulses',
  cotton: 'Cotton',
  sugarcane: 'Sugarcane',
  other: 'Other',
};

const imageUrl = (image) => (typeof image === 'string' ? image : image?.url);

const normalizeListing = (listing) => {
  if (!listing) return listing;
  return {
    ...listing,
    name: listing.name ?? listing.cropName,
    title: listing.title ?? listing.cropName,
    type: listing.type ?? CATEGORY_FROM_API[listing.category] ?? listing.category,
    price: listing.price ?? listing.pricePerUnit,
    pricePerQtl: listing.pricePerQtl ?? listing.pricePerUnit,
    state: listing.state ?? listing.location?.state,
    district: listing.district ?? listing.location?.district,
    seller: listing.seller ?? listing.farmer,
    images: Array.isArray(listing.images) ? listing.images.map(imageUrl).filter(Boolean) : [],
  };
};

const toListingFormData = (cropFormData) => {
  const data = new FormData();
  const get = (key) => cropFormData.get(key);

  data.append('cropName', get('cropName') || get('name') || '');
  data.append('category', get('category') || CATEGORY_TO_API[get('type')] || get('type') || 'other');
  data.append('quantity', get('quantity') || '');
  data.append('unit', get('unit') || 'quintal');
  data.append('pricePerUnit', get('pricePerUnit') || get('price') || '');
  data.append('harvestDate', get('harvestDate') || new Date().toISOString());
  data.append('state', get('state') || '');
  data.append('district', get('district') || '');

  ['qualityGrade', 'isOrganic', 'availableUntil', 'description', 'village', 'pincode'].forEach((key) => {
    const value = get(key);
    if (value) data.append(key, value);
  });

  cropFormData.getAll('images').forEach((image) => data.append('images', image));
  return data;
};

export const fetchCrops = createAsyncThunk(
  'crops/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.type && filters.type !== 'All') params.append('category', CATEGORY_TO_API[filters.type] || filters.type);
      if (filters.state && filters.state !== 'All') params.append('state', filters.state);
      if (filters.district) params.append('district', filters.district);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const { data } = await axiosInstance.get(`/v1/listing?${params.toString()}`);
      return (data.data?.listings ?? data.data ?? []).map(normalizeListing);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch crops');
    }
  }
);

export const fetchCropById = createAsyncThunk(
  'crops/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/v1/listing/${id}`);
      return normalizeListing(data.data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch crop details');
    }
  }
);

export const addCrop = createAsyncThunk(
  'crops/add',
  async (cropFormData, { rejectWithValue }) => {
    try {
    const { data } = await axiosInstance.post('/v1/listing', toListingFormData(cropFormData), {
  headers: { 'Content-Type': 'multipart/form-data' },
});
      // {
      //   headers: { 'Content-Type': 'multipart/form-data' },
      // });
      return normalizeListing(data.data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add crop listing');
    }
  }
);

export const updateCrop = createAsyncThunk(
  'crops/update',
  async ({ id, formData: cropFormData }, { rejectWithValue }) => {
    try {
     const { data } = await axiosInstance.put(`/v1/listing/${id}`, toListingFormData(cropFormData), {
  headers: { 'Content-Type': 'multipart/form-data' },
});
      return normalizeListing(data.data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update crop listing');
    }
  }
);

export const deleteCrop = createAsyncThunk(
  'crops/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/v1/listing/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete crop');
    }
  }
);

const cropSlice = createSlice({
  name: 'crops',
  initialState: {
    list: [],
    selectedCrop: null,
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

    builder
      .addCase(addCrop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCrop.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
        state.successMessage = 'Crop listed successfully!';
      })
      .addCase(addCrop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateCrop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCrop.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.map((c) => (c._id === action.payload._id ? action.payload : c));
        state.selectedCrop = action.payload;
        state.successMessage = 'Crop listing updated successfully!';
      })
      .addCase(updateCrop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

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
