import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "@/types/cart-related.types";

interface CartState {
  cart: CartItem[] | null;
}

const initialState: CartState = {
  cart: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart(state, action: PayloadAction<CartItem[] | null>) {
      state.cart = action.payload;
    },
    addItemToCart(state, action: PayloadAction<CartItem>) {
      if (!state.cart) {
        state.cart = [];
      }
      const existingItem = state.cart.find(
        (item) => item.variantId === action.payload.variantId
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.cart.push(action.payload);
      }
    },
    removeItemFromCart(state, action: PayloadAction<string>) {
      if (state.cart) {
        state.cart = state.cart.filter(
          (item) => item.variantId !== action.payload
        );
      }
    },
    updateCartItemQuantity(
      state,
      action: PayloadAction<{ variantId: string; quantity: number }>
    ) {
      if (state.cart) {
        const item = state.cart.find(
          (item) => item.variantId === action.payload.variantId
        );
        if (item) {
          item.quantity = action.payload.quantity;
        }
      }
    },
  },
});

export const {
  setCart,
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
} = cartSlice.actions;
export default cartSlice.reducer;

// Async Actions / Helpers
import apiHelper from "@/helper/axios-helper";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";

export const fetchCart = async (dispatch: AppDispatch) => {
  try {
    const response = await apiHelper.get("/cart");
    if (response?.data?.statusCode === 200 && response.data.data?.items) {
      const items = response.data.data.items;
      const cart: CartItem[] = Array.isArray(items)
        ? items.map((item: any) => ({
            id: item.id,
            variantId: item.variantId,
            quantity: item.quantity ?? 1,
            createdAt: item.createdAt,
            variant: item.variant,
          }))
        : [];
      dispatch(setCart(cart));
    }
  } catch (error) {
    console.error("Failed to load cart from database:", error);
  }
};

export const addToCart = async (
  dispatch: AppDispatch,
  variantId: string,
  quantity: number,
  isAuthenticated: boolean = false
) => {
  if (!isAuthenticated) {
    toast.error("Please login to add items to cart");
    return;
  }

  try {
    const response = await apiHelper.post("/cart", {
      variantId,
      quantity,
    });
    
    if (response?.data?.statusCode === 200 || response?.data?.statusCode === 201) {
      await fetchCart(dispatch);
      toast.success("Item added to cart");
    }
  } catch (error: any) {
    console.error("Failed to add item to cart:", error);
    toast.error(error?.response?.data?.message || "Failed to add item to cart");
    throw error;
  }
};

export const removeFromCart = async (
  dispatch: AppDispatch,
  variantId: string,
  currentCart: CartItem[] | null,
  isAuthenticated: boolean = false
) => {
  if (!isAuthenticated) {
    toast.error("Please login to manage your cart");
    return;
  }

  const cartItem = currentCart?.find((item) => item.variantId === variantId);
  const cartItemId = cartItem?.id;

  if (!cartItemId) {
    console.error("Cart item ID not found for variant:", variantId);
    toast.error("Failed to find item in cart");
    return;
  }

  try {
    await apiHelper.delete(`/cart/${cartItemId}`);
    await fetchCart(dispatch);
    toast.success("Item removed from cart");
  } catch (error: any) {
    console.error("Failed to remove item from cart:", error);
    toast.error(error?.response?.data?.message || "Failed to remove item");
    throw error;
  }
};

export const updateQuantity = async (
  dispatch: AppDispatch,
  variantId: string,
  quantity: number,
  currentCart: CartItem[] | null,
  isAuthenticated: boolean = false
) => {
  if (!isAuthenticated) {
    toast.error("Please login to manage your cart");
    return;
  }

  if (quantity <= 0) {
    await removeFromCart(dispatch, variantId, currentCart, isAuthenticated);
    return;
  }

  const cartItem = currentCart?.find((item) => item.variantId === variantId);
  const cartItemId = cartItem?.id;

  if (!cartItemId) {
    console.error("Cart item ID not found for variant:", variantId);
    toast.error("Failed to find item in cart");
    return;
  }

  try {
    const response = await apiHelper.patch(`/cart/${cartItemId}`, { quantity });
    if (response?.data?.statusCode === 200) {
      await fetchCart(dispatch);
    }
  } catch (error: any) {
    console.error("Failed to update cart item quantity:", error);
    toast.error(error?.response?.data?.message || "Failed to update quantity");
    throw error;
  }
};

export const clearCartDB = async (
  dispatch: AppDispatch,
  isAuthenticated: boolean = false
) => {
  if (!isAuthenticated) {
    toast.error("Please login to manage your cart");
    return;
  }

  try {
    await apiHelper.delete("/cart");
    dispatch(setCart(null));
    toast.success("Cart cleared successfully");
  } catch (error: any) {
    console.error("Failed to clear cart:", error);
    toast.error(error?.response?.data?.message || "Failed to clear cart");
    throw error;
  }
};
