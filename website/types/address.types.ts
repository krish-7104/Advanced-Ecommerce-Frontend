import { Order } from "./order.types";
import { UserData } from "./user.types";

export interface Address {
  id: string;
  userId: string;
  user: UserData;
  name: string;
  phoneNumber?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  orders: Order;
}
