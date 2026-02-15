export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  cartCount: number;
  wishlistCount: number;
  _count?: {
    addresses: number;
    orders: number;
  };
}
