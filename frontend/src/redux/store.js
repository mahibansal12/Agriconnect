import { configureStore } from "@reduxjs/toolkit";
import authReducer  from "./slices/authSlice";
import cropReducer  from "./slices/cropSlice";
import cartReducer  from "./slices/cartSlice";
import mandiReducer from "./slices/mandiSlice";

export const store = configureStore({
  reducer: {
    auth:  authReducer,
    crops: cropReducer,
    cart:  cartReducer,
    mandi: mandiReducer,
  },
  devTools: import.meta.env.DEV,
});
