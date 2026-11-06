import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  Material,
  CreateMaterialDto,
  UpdateMaterialDto,
  QueryMaterialsParams,
  PaginatedResponse,
} from '../models/materials.models';

@Injectable({ providedIn: 'root' })
export class MaterialsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/inventory/materials`;

  findAll(params: QueryMaterialsParams = {}) {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<Material>>(this.baseUrl, { params: httpParams });
  }

  findOne(id: string) {
    return this.http.get<Material>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateMaterialDto) {
    return this.http.post<Material>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateMaterialDto) {
    return this.http.patch<Material>(`${this.baseUrl}/${id}`, dto);
  }

  toggleActive(id: string) {
    return this.http.patch<Material>(`${this.baseUrl}/${id}/toggle-active`, {});
  }

  recalculateCost(id: string) {
    return this.http.post<Material>(`${this.baseUrl}/${id}/recalculate-cost`, {});
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}