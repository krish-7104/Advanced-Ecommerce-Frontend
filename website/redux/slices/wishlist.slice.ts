import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WishlistItem } from "@/types/cart-related.types";

interface WishlistState {
  wishlist: WishlistItem[] | null;
}

const initialState: WishlistState = {
  wishlist: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlist(state, action: PayloadAction<WishlistItem[] | null>) {
      if (action.payload) {
        state.wishlist = action.payload.map((item) => ({
          ...item,
          quantity: 1,
        }));
      } else {
        state.wishlist = null;
      }
    },
    addItemToWishlist(state, action: PayloadAction<WishlistItem>) {
      if (!state.wishlist) {
        state.wishlist = [];
      }
      if (
        !state.wishlist.some(
          (item) => item.variantId === action.payload.variantId
        )
      ) {
        state.wishlist.push({ ...action.payload, quantity: 1 });
      }
    },
    removeItemFromWishlist(state, action: PayloadAction<string>) {
      if (state.wishlist) {
        state.wishlist = state.wishlist.filter(
          (item) => item.variantId !== action.payload
        );
      }
    },
  },
});

export const { setWishlist, addItemToWishlist, removeItemFromWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;

// Async Actions / Helpers
import apiHelper from "@/helper/axios-helper";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";

export const fetchWishlist = async (dispatch: AppDispatch) => {
  try {
    const response = await apiHelper.get("/wishlist");
    if (response?.data?.statusCode === 200 && response.data.data?.items) {
      const items = response.data.data.items;
      const wishlist: WishlistItem[] = Array.isArray(items)
        ? items.map((item: any) => ({
            id: item.id,
            variantId: item.variantId,
            quantity: 1,
            createdAt: item.createdAt,
            variant: item.variant,
          }))
        : [];
      dispatch(setWishlist(wishlist));
    }
  } catch (error) {
    console.error("Failed to load wishlist from database:", error);
  }
};

export const addToWishlist = async (
  dispatch: AppDispatch,
  variantId: string,
  currentWishlist: WishlistItem[] | null,
  isAuthenticated: boolean = false
) => {
  if (!isAuthenticated) {
    toast.error("Please login to add items to wishlist");
    return;
  }

  const wishlist = currentWishlist ?? [];

  if (wishlist.some((item) => item.variantId === variantId)) {
    return;
  }

  try {
    const response = await apiHelper.post("/wishlist", { variantId });
    
    if (response?.data?.statusCode === 200 || response?.data?.statusCode === 201) {
      await fetchWishlist(dispatch);
      toast.success("Item added to wishlist");
    }
  } catch (error: any) {
    console.error("Failed to add item to wishlist:", error);
    toast.error(error?.response?.data?.message || "Failed to add item to wishlist");
    throw error;
  }
};

export const removeFromWishlist = async (
  dispatch: AppDispatch,
  variantId: string,
  currentWishlist: WishlistItem[] | null,
  isAuthenticated: boolean = false
) => {
  if (!isAuthenticated) {
    toast.error("Please login to manage your wishlist");
    return;
  }

  try {
    await apiHelper.delete(`/wishlist/${variantId}`);
    await fetchWishlist(dispatch);
    toast.success("Item removed from wishlist");
  } catch (error: any) {
    console.error("Failed to remove item from wishlist:", error);
    toast.error(error?.response?.data?.message || "Failed to remove item");
    throw error;
  }
};
