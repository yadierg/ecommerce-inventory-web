export interface Warehouse {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  managerName?: string;
  capacity?: number;
  isActive: boolean;
  isDefault: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseDto {
  name: string;
  code: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  managerName?: string;
  capacity?: number;
  isActive?: boolean;
  isDefault?: boolean;
  notes?: string;
}

export type UpdateWarehouseDto = Partial<CreateWarehouseDto>;

export interface WarehouseStats {
  total: number;
  active: number;
  inactive: number;
  defaultWarehouse?: Warehouse;
}