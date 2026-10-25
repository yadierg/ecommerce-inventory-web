export type MovementType =
  | 'in'
  | 'out'
  | 'adjustment'
  | 'transfer_in'
  | 'transfer_out'
  | 'purchase_receive'
  | 'sale';

export interface Movement {
  id: string;
  tenantId: string;
  productId: string;
  warehouseId: string;
  type: MovementType;
  quantity: number;
  previousQuantity?: number;
  newQuantity?: number;
  reason?: string;
  notes?: string;
  referenceType?: string;
  referenceId?: string;
  userId?: string;
  createdAt: string;
  warehouse?: { id: string; name: string; code: string };
  product?: { id: string; name: string; sku?: string };
}

export interface CreateMovementDto {
  productId: string;
  warehouseId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  notes?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface MovementStats {
  total: number;
  in: number;
  out: number;
  adjustments: number;
  transfers: number;
}

export interface MovementFilters {
  productId?: string;
  warehouseId?: string;
  type?: MovementType;
  from?: string;
  to?: string;
}