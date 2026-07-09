import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchStats = createAsyncThunk(
    "mandi/fetchStats",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get("/v1/mandi/stats");
            return data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch dashboard statistics."
            );
        }
    }
);

export const fetchHighlights = createAsyncThunk(
    "mandi/fetchHighlights",
    async (params = {}, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get("/v1/mandi/highlights", { params });
            return data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch highlights."
            );
        }
    }
);

export const fetchStates = createAsyncThunk(
    "mandi/fetchStates",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get("/v1/mandi/states");
            return data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch states."
            );
        }
    }
);

export const fetchDistricts = createAsyncThunk(
    "mandi/fetchDistricts",
    async (state, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get(`/v1/mandi/districts/${state}`);
            return data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch districts."
            );
        }
    }
);

export const fetchMandis = createAsyncThunk(
    "mandi/fetchMandis",
    async ({ state, district }, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get("/v1/mandi/mandis", {
                params: { state, district },
            });
            return data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch mandis."
            );
        }
    }
);

export const fetchRates = createAsyncThunk(
    "mandi/fetchRates",
    async (params = {}, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get("/v1/mandi/rates", { params });
            return data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch mandi rates."
            );
        }
    }
);

export const searchCommodity = createAsyncThunk(
    "mandi/searchCommodity",
    async ({ query, page = 1, limit = 20 }, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get("/v1/mandi/search", {
                params: { q: query, page, limit },
            });
            return data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Search failed."
            );
        }
    }
);

export const fetchHistory = createAsyncThunk(
    "mandi/fetchHistory",
    async ({ mandi, commodity, days = 30 }, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get("/v1/mandi/history", {
                params: { mandi, commodity, days },
            });
            return data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch history."
            );
        }
    }
);

export const compareMandis = createAsyncThunk(
    "mandi/compareMandis",
    async ({ commodity, mandis }, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post("/v1/mandi/compare", {
                commodity,
                mandis,
            });
            return data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Comparison failed."
            );
        }
    }
);

export const syncRates = createAsyncThunk(
    "mandi/syncRates",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post("/v1/mandi/sync");
            return data.message;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Synchronization failed."
            );
        }
    }
);

const initialState = {
    states: [],
    districts: [],
    mandis: [],
    rates: [],
    stats: null,
    highlights: null,
    history: [],
    comparison: [],
    pagination: null,
    loading: false,
    error: null,
    successMessage: null,
    selectedState: null,
    selectedDistrict: null,
    selectedMandi: null,
};

const mandiSlice = createSlice({
    name: "mandi",
    initialState,
    reducers: {
        clearMandiMessages(state) {
            state.error = null;
            state.successMessage = null;
        },
        clearComparison(state) {
            state.comparison = [];
        },
        clearHistory(state) {
            state.history = [];
        },
        clearRates(state) {
            state.rates = [];
        },
        clearLocation(state) {
            state.selectedState = null;
            state.selectedDistrict = null;
            state.selectedMandi = null;
        },
        setSelectedState(state, action) {
            state.selectedState = action.payload;
            state.selectedDistrict = null;
            state.selectedMandi = null;
        },
        setSelectedDistrict(state, action) {
            state.selectedDistrict = action.payload;
            state.selectedMandi = null;
        },
        setSelectedMandi(state, action) {
            state.selectedMandi = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchHighlights.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchHighlights.fulfilled, (state, action) => {
                state.loading = false;
                state.highlights = action.payload;
            })
            .addCase(fetchHighlights.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchStates.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStates.fulfilled, (state, action) => {
                state.loading = false;
                state.states = action.payload;
            })
            .addCase(fetchStates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchDistricts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDistricts.fulfilled, (state, action) => {
                state.loading = false;
                state.districts = action.payload;
            })
            .addCase(fetchDistricts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMandis.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMandis.fulfilled, (state, action) => {
                state.loading = false;
                state.mandis = action.payload;
            })
            .addCase(fetchMandis.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchRates.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRates.fulfilled, (state, action) => {
                state.loading = false;
                state.rates = action.payload.rates;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchRates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(searchCommodity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchCommodity.fulfilled, (state, action) => {
                state.loading = false;
                state.rates = action.payload.commodities;
            })
            .addCase(searchCommodity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.history = action.payload;
            })
            .addCase(fetchHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(compareMandis.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(compareMandis.fulfilled, (state, action) => {
                state.loading = false;
                state.comparison = action.payload;
            })
            .addCase(compareMandis.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(syncRates.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(syncRates.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload;
            })
            .addCase(syncRates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearMandiMessages,
    clearComparison,
    clearHistory,
    clearRates,
    clearLocation,
    setSelectedState,
    setSelectedDistrict,
    setSelectedMandi,
} = mandiSlice.actions;

export default mandiSlice.reducer;