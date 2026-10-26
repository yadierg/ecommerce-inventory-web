import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  AdjustStockDto,
  CreateStockDto,
  Stock,
  StockFilters,
  StockStats,
  TransferStockDto,
} from '../models/stock.model';

// 👈 Nueva interfaz para la respuesta paginada
export interface PaginatedStockResponse {
  data: Stock[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class StocksService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/inventory/stocks`;

  findAll(filters: StockFilters = {}) {
    let params = new HttpParams();
    if (filters.warehouseId) params = params.set('warehouseId', filters.warehouseId);
    if (filters.productId) params = params.set('productId', filters.productId);
    if (filters.lowStock !== undefined)
      params = params.set('lowStock', String(filters.lowStock));
    if (filters.outOfStock !== undefined)
      params = params.set('outOfStock', String(filters.outOfStock));

    // 👈 Ahora esperamos un objeto paginado
    return this.http.get<PaginatedStockResponse>(this.base, { params });
  }

  findOne(id: string) {
    return this.http.get<Stock>(`${this.base}/${id}`);
  }

  stats() {
    return this.http.get<StockStats>(`${this.base}/stats`);
  }

  create(dto: CreateStockDto) {
    return this.http.post<Stock>(this.base, dto);
  }

  update(id: string, dto: Partial<CreateStockDto>) {
    return this.http.patch<Stock>(`${this.base}/${id}`, dto);
  }

  adjust(id: string, dto: AdjustStockDto) {
    return this.http.patch<Stock>(`${this.base}/${id}/adjust`, dto);
  }

  transfer(dto: TransferStockDto) {
    return this.http.post<{ message: string }>(`${this.base}/transfer`, dto);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}