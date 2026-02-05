import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/user.slice";
import wishlistReducer from "./slices/wishlist.slice";
import cartReducer from "./slices/cart.slice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
