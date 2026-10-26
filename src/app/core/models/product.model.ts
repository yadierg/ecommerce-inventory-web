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
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  categoryId?: string;
  brand?: string;
  images: string[];
  mainImage?: string;
  weight?: number;
  dimensions?: any;
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  price: number;
  slug?: string;
  description?: string;
  shortDescription?: string;
  comparePrice?: number;
  costPrice?: number;
  stock?: number;
  lowStockThreshold?: number;
  categoryId?: string;
  brand?: string;
  images?: string[];
  mainImage?: string;
  weight?: number;
  dimensions?: any;
  isActive?: boolean;
  isFeatured?: boolean;
  isDigital?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}