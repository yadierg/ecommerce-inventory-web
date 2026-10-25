import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  CreatePurchaseOrderDto,
  PurchaseOrder,
  PurchaseOrderStats,
  PurchaseOrderStatus,
  ReceivePurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from '../models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrdersService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/inventory/purchase-orders`;

  findAll() {
    return this.http.get<PurchaseOrder[]>(this.base);
  }

  findOne(id: string) {
    return this.http.get<PurchaseOrder>(`${this.base}/${id}`);
  }

  findByNumber(orderNumber: string) {
    return this.http.get<PurchaseOrder>(`${this.base}/number/${orderNumber}`);
  }

  stats() {
    return this.http.get<PurchaseOrderStats>(`${this.base}/stats`);
  }

  create(dto: CreatePurchaseOrderDto) {
    return this.http.post<PurchaseOrder>(this.base, dto);
  }

  update(id: string, dto: UpdatePurchaseOrderDto) {
    return this.http.patch<PurchaseOrder>(`${this.base}/${id}`, dto);
  }

  changeStatus(id: string, status: PurchaseOrderStatus) {
    return this.http.patch<PurchaseOrder>(`${this.base}/${id}/status`, { status });
  }

  receive(id: string, dto: ReceivePurchaseOrderDto) {
    return this.http.post<PurchaseOrder>(`${this.base}/${id}/receive`, dto);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}