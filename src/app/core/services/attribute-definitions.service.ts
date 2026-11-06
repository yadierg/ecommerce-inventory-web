import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AttributeDefinition, CreateAttributeDefinitionDto } from '../models/materials.models';

@Injectable({ providedIn: 'root' })
export class AttributeDefinitionsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/inventory/attribute-definitions`;

  findByProductType(productTypeId: string) {
    return this.http.get<AttributeDefinition[]>(`${this.baseUrl}/type/${productTypeId}`);
  }

  create(dto: CreateAttributeDefinitionDto) {
    return this.http.post<AttributeDefinition>(this.baseUrl, dto);
  }

  update(id: string, dto: Partial<CreateAttributeDefinitionDto>) {
    return this.http.patch<AttributeDefinition>(`${this.baseUrl}/${id}`, dto);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}