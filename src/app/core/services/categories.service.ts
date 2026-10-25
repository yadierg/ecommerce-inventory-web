import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Category } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/store/categories`;

  findAll() {
    return this.http.get<Category[]>(this.baseUrl);
  }

  create(dto: Partial<Category>) {
    return this.http.post<Category>(this.baseUrl, dto);
  }

  update(id: string, dto: Partial<Category>) {
    return this.http.patch<Category>(`${this.baseUrl}/${id}`, dto);
  }

  remove(id: string) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}