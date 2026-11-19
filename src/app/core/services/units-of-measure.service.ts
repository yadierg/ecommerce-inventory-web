import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ============================================
// MODELO
// ============================================
export type UnitOfMeasureType =
  | 'unit' | 'length' | 'area' | 'volume'
  | 'weight' | 'time' | 'service' | 'other';

export interface UnitOfMeasure {
  id: string;
  tenantId: string | null;
  name: string;
  abbreviation: string;
  nameEn?: string | null;
  description?: string | null;
  type: UnitOfMeasureType;
  decimalPlaces: number;
  isActive: boolean;
  isSystem: boolean;
  order: number;
  createdById?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUnitOfMeasureDto {
  name: string;
  abbreviation: string;
  nameEn?: string;
  description?: string;
  type?: UnitOfMeasureType;
  decimalPlaces?: number;
  isActive?: boolean;
  order?: number;
}

export interface UpdateUnitOfMeasureDto {
  name?: string;
  nameEn?: string;
  description?: string;
  type?: UnitOfMeasureType;
  decimalPlaces?: number;
  isActive?: boolean;
  order?: number;
}

export interface PaginatedUnitsResponse {
  data: UnitOfMeasure[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface QueryUnitsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: UnitOfMeasureType;
  isActive?: boolean;
}

// ============================================
// SERVICIO
// ============================================
@Injectable({ providedIn: 'root' })
export class UnitsOfMeasureService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin/units-of-measure`;

  // GET /active → array directo (para dropdowns)
  findActive(): Observable<UnitOfMeasure[]> {
    return this.http.get<UnitOfMeasure[]>(`${this.baseUrl}/active`);
  }

  // GET /type/:type → array directo
  findByType(type: UnitOfMeasureType): Observable<UnitOfMeasure[]> {
    return this.http.get<UnitOfMeasure[]>(`${this.baseUrl}/type/${type}`);
  }

  // GET / (paginado) → { data, meta }
  findAll(params: QueryUnitsParams = {}): Observable<PaginatedUnitsResponse> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive);

    return this.http.get<PaginatedUnitsResponse>(this.baseUrl, { params: httpParams });
  }

  // GET /:id
  findOne(id: string): Observable<UnitOfMeasure> {
    return this.http.get<UnitOfMeasure>(`${this.baseUrl}/${id}`);
  }

  // GET /stats
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats`);
  }

  // POST /
  create(dto: CreateUnitOfMeasureDto): Observable<UnitOfMeasure> {
    return this.http.post<UnitOfMeasure>(this.baseUrl, dto);
  }

  // PATCH /:id
  update(id: string, dto: UpdateUnitOfMeasureDto): Observable<UnitOfMeasure> {
    return this.http.patch<UnitOfMeasure>(`${this.baseUrl}/${id}`, dto);
  }

  // PATCH /:id/toggle-active
  toggleActive(id: string): Observable<UnitOfMeasure> {
    return this.http.patch<UnitOfMeasure>(`${this.baseUrl}/${id}/toggle-active`, {});
  }

  // DELETE /:id
  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}