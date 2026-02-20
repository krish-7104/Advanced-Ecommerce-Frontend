export interface Permission {
  id: string;
  action: string;
  resource: string;
  code: string;
  description?: string;
}

export interface AdminUser {
  id: string;
  firstName: string; // Mapped from name
  lastName: string; // Mapped from name
  email: string;
  phoneNumber?: string;
  isActive: boolean;

  permissions: Permission[];

  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export interface CreateAdminUserPayload {
  name?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  permissions?: string[]; // Array of permission IDs
  isActive: boolean;
  password?: string;
  confirmPassword?: string;
}
