export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: CategoryResponse;
}

export interface ProductVariantResponse {
  id: string;
  sku: string;
  price: string;
  mrp: string | null;
  stockAvailable: number;
  createdAt?: string;
  product: ProductResponse;
  hasDiscount: boolean;
  discountPercentage: number | null;
  image?: {
    id: string;
    fileName: string;
    isPrimary: boolean;
    url: string;
  } | null;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  level: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: CategoryResponse | null;
  _count?: {
    children: number;
    products: number;
  };
  image?: {
    id: string;
    fileName: string;
    isPrimary: boolean;
    url: string;
  } | null;
}

export interface AttributeOption {
  name: string;
  values: string[];
}

export type AttributesSchema = Record<string, string[]>;

export interface ProductVariantDetail extends Omit<
  ProductVariantResponse,
  "product"
> {
  images?: {
    id: string;
    fileName: string;
    isPrimary: boolean;
    url: string;
  }[];
  isDefault: boolean;
  attributes: Record<string, string>;
}

export interface ProductDetailResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: CategoryResponse;
  variants: ProductVariantDetail[];
  attributesSchema: AttributesSchema | null;
}
