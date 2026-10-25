import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  Warehouse,
  WarehouseStats,
} from '../models/warehouse.model';

@Injectable({ providedIn: 'root' })
export class WarehousesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/inventory/warehouses`;

  findAll(includeInactive = false) {
    const params = new HttpParams().set('includeInactive', String(includeInactive));
    return this.http.get<Warehouse[]>(this.base, { params });
  }

  findOne(id: string) {
    return this.http.get<Warehouse>(`${this.base}/${id}`);
  }

  stats() {
    return this.http.get<WarehouseStats>(`${this.base}/stats`);
  }

  create(dto: CreateWarehouseDto) {
    return this.http.post<Warehouse>(this.base, dto);
  }

  update(id: string, dto: UpdateWarehouseDto) {
    return this.http.patch<Warehouse>(`${this.base}/${id}`, dto);
  }

  setDefault(id: string) {
    return this.http.patch<Warehouse>(`${this.base}/${id}/set-default`, {});
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}