import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProductType, CreateProductTypeDto, UpdateProductTypeDto } from '../models/materials.models';

@Injectable({ providedIn: 'root' })
export class ProductTypesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/inventory/product-types`;

  findAll() {
    // El backend devuelve paginado, pero para el frontend pedimos un límite alto
    return this.http.get<{ data: ProductType[], meta: any }>(`${this.baseUrl}?limit=100`);
  }

  findActive() {
    return this.http.get<ProductType[]>(`${this.baseUrl}/active`);
  }

  findOne(id: string) {
    return this.http.get<ProductType>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateProductTypeDto) {
    return this.http.post<ProductType>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateProductTypeDto) {
    return this.http.patch<ProductType>(`${this.baseUrl}/${id}`, dto);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}