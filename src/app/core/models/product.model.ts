export interface Category {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  categoryId?: string;
  brand?: string;
  images: string[];
  mainImage?: string;
  isActive: boolean;
  isFeatured: boolean;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  price: number;
  slug?: string;
  description?: string;
  costPrice?: number;
  stock?: number;
  lowStockThreshold?: number;
  categoryId?: string;
  brand?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}