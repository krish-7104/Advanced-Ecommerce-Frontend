export interface Order {
  id: string;
  userId: string;
  addressId: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    orderId: string;
    variantId: string;
    sku: string;
    name: string;
    attributes: Record<string, string>;
    price: string;
    mrp: string;
    quantity: number;
  }[];
  address: {
    id: string;
    userId: string;
    name: string;
    phoneNumber: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  };
  payments: any[];
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  };
}
