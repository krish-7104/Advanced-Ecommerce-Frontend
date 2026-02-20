export interface Department {
  id: string;
  name: string;
  description?: string;
  _count?: {
    admins: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
}
