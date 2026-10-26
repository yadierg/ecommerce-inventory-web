import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateProductDto, Product } from '../models/product.model';

export interface PaginatedProductResponse {
  data: Product[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/store/products`;

  findAll(query: any = {}) {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedProductResponse>(this.baseUrl, { params });
  }

  findOne(id: string) {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateProductDto) {
    return this.http.post<Product>(this.baseUrl, dto);
  }

  // 👈 AÑADIR ESTOS DOS MÉTODOS
  update(id: string, dto: Partial<CreateProductDto>) {
    return this.http.patch<Product>(`${this.baseUrl}/${id}`, dto);
  }

  remove(id: string) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}