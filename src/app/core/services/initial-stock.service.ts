import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface InitialStockItemDto {
  productId: string;
  quantity: number;
  unitCost?: number;
  lotNumber?: string;
  location?: string;
  estimatedAcquisitionDate?: string;
  notes?: string;
}

export interface InitialStockDto {
  warehouseId: string;
  reason?: string;
  items: InitialStockItemDto[];
}

export interface InitialStockResponse {
  created: number;
  updated: number;
  movements: number;
  details: Array<{
    productId: string;
    productName: string;
    quantity: number;
    stockBefore: number;
    stockAfter: number;
    action: 'created' | 'updated';
  }>;
}

@Injectable({ providedIn: 'root' })
export class InitialStockService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/inventory/stocks/initial`;

  load(dto: InitialStockDto) {
    return this.http.post<InitialStockResponse>(this.baseUrl, dto);
  }
}