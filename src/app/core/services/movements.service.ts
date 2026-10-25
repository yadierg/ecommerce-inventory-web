import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  CreateMovementDto,
  Movement,
  MovementFilters,
  MovementStats,
} from '../models/movement.model';

@Injectable({ providedIn: 'root' })
export class MovementsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/inventory/movements`;

  findAll(filters: MovementFilters = {}) {
    let params = new HttpParams();
    if (filters.productId) params = params.set('productId', filters.productId);
    if (filters.warehouseId) params = params.set('warehouseId', filters.warehouseId);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);

    return this.http.get<Movement[]>(this.base, { params });
  }

  findOne(id: string) {
    return this.http.get<Movement>(`${this.base}/${id}`);
  }

  stats() {
    return this.http.get<MovementStats>(`${this.base}/stats`);
  }

  byProduct(productId: string) {
    return this.http.get<Movement[]>(`${this.base}/product/${productId}`);
  }

  byWarehouse(warehouseId: string) {
    return this.http.get<Movement[]>(`${this.base}/warehouse/${warehouseId}`);
  }

  create(dto: CreateMovementDto) {
    return this.http.post<Movement>(this.base, dto);
  }
}