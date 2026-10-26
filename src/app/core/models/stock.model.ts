export interface Stock {
  id: string;
  tenantId: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  reservedQuantity?: number;
  availableQuantity?: number;
  minStock?: number;
  maxStock?: number;        // 👈 Ya lo tenías
  location?: string;        // 👈 AÑADIR ESTO
  shelf?: string;           // 👈 Opcional
  bin?: string;             // 👈 Opcional
  notes?: string;           // 👈 AÑADIR ESTO
  lastMovementAt?: string;
  createdAt: string;
  updatedAt: string;
  warehouse?: { id: string; name: string; code: string };
  product?: { id: string; name: string; sku?: string };
}


export interface CreateStockDto {
  warehouseId: string;
  productId: string;
  quantity: number;
  minStock?: number;
  maxStock?: number;
}

export interface AdjustStockDto {
  quantity: number;
  reason: string;
  notes?: string;
}

export interface TransferStockDto {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  notes?: string;
}

export interface StockStats {
  total: number;
  lowStock: number;
  outOfStock: number;
  totalQuantity: number;
}

export interface StockFilters {
  warehouseId?: string;
  productId?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
}