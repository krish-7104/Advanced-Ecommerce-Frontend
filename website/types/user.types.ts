export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
  _count?: {
    cartItems?: number;
  };
}
