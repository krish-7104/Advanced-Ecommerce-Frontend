import { ProductVariantResponse } from "./catalog.types";

export interface WishlistItem {
  id?: string;
  variantId: string;
  quantity?: number;
  createdAt?: string | Date;
  variant?: ProductVariantResponse | null;
}

export interface CartItem {
  id?: string;
  variantId: string;
  quantity: number;
  createdAt?: string | Date;
  variant?: ProductVariantResponse | null;
}
