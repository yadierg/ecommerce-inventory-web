export type PurchaseOrderStatus =
  | 'draft'
  | 'sent'
  | 'confirmed'
  | 'partially_received'
  | 'received'
  | 'cancelled';

export interface PurchaseOrderItem {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
  receivedQuantity?: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  orderNumber: string;
  supplierId: string;
  warehouseId: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  notes?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
  supplier?: { id: string; name: string; code: string };
  warehouse?: { id: string; name: string; code: string };
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  warehouseId: string;
  orderDate: string;
  expectedDate?: string;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export type UpdatePurchaseOrderDto = Partial<CreatePurchaseOrderDto>;

export interface ReceiveItemDto {
  productId: string;
  quantity: number;
}

export interface ReceivePurchaseOrderDto {
  items: ReceiveItemDto[];
  notes?: string;
}

export interface PurchaseOrderStats {
  total: number;
  draft: number;
  sent: number;
  confirmed: number;
  received: number;
  cancelled: number;
}