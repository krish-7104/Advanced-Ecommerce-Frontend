export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level?: number;
  isActive?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count: { children: number; products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId?: string;
  category?: Category;
  attributesSchema?: Record<string, string[]>;
  isActive?: boolean;
  isFeatured?: boolean;
  variants?: ProductVariant[];
  createdAt: string | Date;
  updatedAt: string | Date;
  _count: { variants: number };
}

export interface ProductVariant {
  id: string;
  productId: string;
  product: Product;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  mrp: number | null;
  stockAvailable: number;
  stockSold: number;
  isDefault: boolean;
  images: string[];
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}
