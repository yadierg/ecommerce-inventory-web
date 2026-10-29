import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Supplier, CreateSupplierDto, UpdateSupplierDto, SupplierStats } from '../models/supplier.model';

// 👇 Interfaz para respuestas paginadas
export interface PaginatedSupplierResponse {
  data: Supplier[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class SuppliersService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/inventory/suppliers`;

  findAll() {
    // 👇 Ahora esperamos la respuesta paginada
    return this.http.get<PaginatedSupplierResponse>(this.baseUrl);
  }

  findOne(id: string) {
    return this.http.get<Supplier>(`${this.baseUrl}/${id}`);
  }

  findByCode(code: string) {
    return this.http.get<Supplier>(`${this.baseUrl}/code/${code}`);
  }

  stats() {
    return this.http.get<SupplierStats>(`${this.baseUrl}/stats`);
  }

  create(dto: CreateSupplierDto) {
    return this.http.post<Supplier>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateSupplierDto) {
    return this.http.patch<Supplier>(`${this.baseUrl}/${id}`, dto);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}