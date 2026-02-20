export interface Permission {
  id: string;
  code: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: { permission: Permission }[];
  _count?: {
    admins: number;
    permissions: number;
  };
  createdAt: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions?: string[];
}
