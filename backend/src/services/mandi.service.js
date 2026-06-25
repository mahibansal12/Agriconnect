// src/services/mandi.service.js

import axios from "axios";

const BASE_URL = "https://api.data.gov.in/resource";
const RESOURCE_ID = process.env.DATA_GOV_RESOURCE_ID;
const API_KEY = process.env.DATA_GOV_API_KEY;

const fetchMandiRates = async ({ state, commodity, limit = 20 }) => {
    const params = {
        "api-key": API_KEY,
        format: "json",
        limit,
        offset: 0,
    };

   
    if (state) params["filters[state]"] = state;
    if (commodity) params["filters[commodity]"] = commodity;

    const response = await axios.get(`${BASE_URL}/${RESOURCE_ID}`, {
        params,
    });

    
    return response.data.records;
};

export { fetchMandiRates };