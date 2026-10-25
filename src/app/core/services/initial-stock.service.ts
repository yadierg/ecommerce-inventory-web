import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface InitialStockDto {
  warehouseId: string;
  reason?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost?: number;
  }>;
}

@Injectable({ providedIn: 'root' })
export class InitialStockService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/inventory/stocks/initial`;

  load(dto: InitialStockDto) {
    return this.http.post<any>(this.baseUrl, dto);
  }
}