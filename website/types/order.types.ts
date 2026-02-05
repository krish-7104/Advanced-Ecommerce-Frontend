import { Address } from "./address.types";
import { CartItem } from "./cart-related.types";
import { ProductResponse, ProductVariantResponse } from "./catalog.types";
import { UserData } from "./user.types";

export interface Order {
  id: string;
  userId: string;
  addressId: string;
  status:
    | "PENDING"
    | "PAID"
    | "PACKED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  user: UserData;
  address: Address;
  items: OrderItems[];
  payments: any;
}

export interface OrderItems {
  id: string;
  orderId: string;
  variantId: ProductResponse;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  mrp: number;
  quantity: number;
  order: Order;
  variant: ProductVariantResponse;
}
