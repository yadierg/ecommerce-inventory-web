import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  CreateSupplierDto,
  Supplier,
  SupplierStats,
  UpdateSupplierDto,
} from '../models/supplier.model';

@Injectable({ providedIn: 'root' })
export class SuppliersService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/inventory/suppliers`;

  findAll() {
    return this.http.get<Supplier[]>(this.base);
  }

  findOne(id: string) {
    return this.http.get<Supplier>(`${this.base}/${id}`);
  }

  findByCode(code: string) {
    return this.http.get<Supplier>(`${this.base}/code/${code}`);
  }

  stats() {
    return this.http.get<SupplierStats>(`${this.base}/stats`);
  }

  create(dto: CreateSupplierDto) {
    return this.http.post<Supplier>(this.base, dto);
  }

  update(id: string, dto: UpdateSupplierDto) {
    return this.http.patch<Supplier>(`${this.base}/${id}`, dto);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}