// ============================================
// PRODUCT TYPES
// ============================================
export interface ProductType {
  id: string;
  tenantId: string | null;
  code: string;
  name: string;
  nameEn?: string;
  categoryId?: string | null;
  icon?: string;
  isSystem: boolean;
  isActive: boolean;
  orderIndex: number;
  metadata?: Record<string, any>;
  attributeDefinitions?: AttributeDefinition[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductTypeDto {
  code: string;
  name: string;
  nameEn?: string;
  categoryId?: string;
  icon?: string;
  isActive?: boolean;
  orderIndex?: number;
  metadata?: Record<string, any>;
}

// ============================================
// ATTRIBUTE DEFINITIONS
// ============================================
export enum AttributeDataType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  ENUM = 'enum',
}

export interface AttributeDefinition {
  id: string;
  tenantId: string | null;
  productTypeId?: string | null;
  key: string;
  label: string;
  labelEn?: string;
  dataType: AttributeDataType;
  unit?: string;
  enumValues?: string[] | null;
  isRequired: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  validationRegex?: string;
  minValue?: number | null;
  maxValue?: number | null;
  orderIndex: number;
  isSystem: boolean;
  productType?: ProductType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttributeDefinitionDto {
  productTypeId?: string;
  key: string;
  label: string;
  labelEn?: string;
  dataType?: AttributeDataType;
  unit?: string;
  enumValues?: string[];
  isRequired?: boolean;
  isSearchable?: boolean;
  isFilterable?: boolean;
  validationRegex?: string;
  minValue?: number;
  maxValue?: number;
  orderIndex?: number;
}

// ============================================
// PRODUCT ATTRIBUTES (EAV)
// ============================================
export interface ProductAttribute {
  id: string;
  tenantId: string;
  materialId?: string | null;
  productId?: string | null;
  attributeDefinitionId?: string | null;
  attributeKey: string;
  attributeLabel: string;
  attributeValue: string;
  attributeType: AttributeDataType;
  unit?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttributeInput {
  attributeKey: string;
  attributeLabel: string;
  attributeValue: string;
  attributeType?: AttributeDataType;
  unit?: string;
  orderIndex?: number;
}

// ============================================
// MATERIALS
// ============================================
export interface Material {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  description?: string;
  categoryId?: string | null;
  productTypeId?: string | null;
  unitOfMeasureId: string;
  unitCost: number;
  lastPurchaseCost?: number | null;
  averageCost: number;
  minStock: number;
  maxStock?: number | null;
  reorderPoint: number;
  isActive: boolean;
  isPurchasable: boolean;
  isConsumable: boolean;
  brand?: string;
  supplierId?: string | null;
  image?: string;
  notes?: string;
  metadata?: Record<string, any>;
  unitOfMeasure?: any; // UnitOfMeasure
  productType?: ProductType;
  category?: any; // Category
  supplier?: any; // Supplier
  attributes?: ProductAttribute[];
  priceHistory?: PriceHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProductTypeDto {
  name?: string;
  nameEn?: string;
  categoryId?: string;
  icon?: string;
  isActive?: boolean;
  orderIndex?: number;
  metadata?: Record<string, any>;
}

export interface CreateMaterialDto {
  sku: string;
  name: string;
  description?: string;
  categoryId?: string;
  productTypeId?: string;
  unitOfMeasureId: string;
  unitCost?: number;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  isActive?: boolean;
  isPurchasable?: boolean;
  isConsumable?: boolean;
  brand?: string;
  supplierId?: string;
  image?: string;
  notes?: string;
  metadata?: Record<string, any>;
  attributes?: ProductAttributeInput[];
}

export interface UpdateMaterialDto {
  name?: string;
  description?: string;
  categoryId?: string;
  productTypeId?: string;
  unitOfMeasureId?: string;
  unitCost?: number;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  isActive?: boolean;
  isPurchasable?: boolean;
  isConsumable?: boolean;
  brand?: string;
  supplierId?: string;
  image?: string;
  notes?: string;
  metadata?: Record<string, any>;
  attributes?: ProductAttributeInput[];
}

export interface QueryMaterialsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  productTypeId?: string;
  supplierId?: string;
  brand?: string;
  isActive?: boolean;
  isConsumable?: boolean;
}

// ============================================
// PRICE HISTORY
// ============================================
export interface PriceHistory {
  id: string;
  tenantId: string;
  materialId: string;
  supplierId?: string | null;
  purchaseOrderId?: string | null;
  unitCost: number;
  quantity: number;
  currency: string;
  purchaseDate: string;
  notes?: string;
  supplier?: any;
  createdAt: string;
}

export interface CreatePriceHistoryDto {
  materialId: string;
  supplierId?: string;
  purchaseOrderId?: string;
  unitCost: number;
  quantity: number;
  currency?: string;
  purchaseDate: string;
  notes?: string;
}

export interface PriceHistoryStats {
  minCost: number;
  maxCost: number;
  avgCost: number;
  count: number;
}

// ============================================
// PAGINATED RESPONSE
// ============================================
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}