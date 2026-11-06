import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PriceHistory, CreatePriceHistoryDto, PriceHistoryStats } from '../models/materials.models';

@Injectable({ providedIn: 'root' })
export class PriceHistoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/inventory/price-history`;

  findByMaterial(materialId: string) {
    return this.http.get<PriceHistory[]>(`${this.baseUrl}/material/${materialId}`);
  }

  getStats(materialId: string) {
    return this.http.get<PriceHistoryStats>(`${this.baseUrl}/material/${materialId}/stats`);
  }

  create(dto: CreatePriceHistoryDto) {
    return this.http.post<PriceHistory>(this.baseUrl, dto);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}