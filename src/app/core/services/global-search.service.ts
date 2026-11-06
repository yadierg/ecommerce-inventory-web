import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SearchResult {
  type: 'product' | 'supplier' | 'po' | 'warehouse';
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
}

@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  search(query: string) {
    if (!query || query.length < 2) return of([]);

    const q = query.toLowerCase();

    // Hacemos las peticiones en paralelo a cada módulo
    return forkJoin({
      products: this.http.get<any>(`${this.apiUrl}/store/products?search=${q}&limit=5`).pipe(catchError(() => of({ data: [] }))),
      suppliers: this.http.get<any>(`${this.apiUrl}/inventory/suppliers`).pipe(catchError(() => of({ data: [] }))),
      orders: this.http.get<any>(`${this.apiUrl}/inventory/purchase-orders`).pipe(catchError(() => of({ data: [] }))),
      warehouses: this.http.get<any>(`${this.apiUrl}/inventory/warehouses`).pipe(catchError(() => of([]))),
    }).pipe(
      map((res: any) => {
        const results: SearchResult[] = [];

        // 1. Productos (el backend ya filtra por 'search')
        if (res.products?.data) {
          res.products.data.slice(0, 3).forEach((p: any) => {
            results.push({
              type: 'product',
              id: p.id,
              title: p.name,
              subtitle: `SKU: ${p.sku} | $${p.price}`,
              icon: 'inventory_2',
              route: `/products`
            });
          });
        }

        // 2. Proveedores (filtramos localmente)
        const supplierList = Array.isArray(res.suppliers) ? res.suppliers : res.suppliers?.data || [];
        supplierList
          .filter((s: any) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
          .slice(0, 3)
          .forEach((s: any) => {
            results.push({
              type: 'supplier',
              id: s.id,
              title: s.name,
              subtitle: `Código: ${s.code}`,
              icon: 'business',
              route: `/suppliers`
            });
          });

        // 3. Órdenes de Compra (filtramos localmente)
        const orderList = Array.isArray(res.orders) ? res.orders : res.orders?.data || [];
        orderList
          .filter((o: any) => o.orderNumber.toLowerCase().includes(q))
          .slice(0, 3)
          .forEach((o: any) => {
            results.push({
              type: 'po',
              id: o.id,
              title: `Orden ${o.orderNumber}`,
              subtitle: `Proveedor: ${o.supplier?.name || 'N/A'} | Total: $${o.totalAmount}`,
              icon: 'shopping_cart',
              route: `/purchase-orders/${o.id}`
            });
          });

        // 4. Almacenes (filtramos localmente)
        const warehouseList = Array.isArray(res.warehouses) ? res.warehouses : res.warehouses?.data || [];
        warehouseList
          .filter((w: any) => w.name.toLowerCase().includes(q) || w.code.toLowerCase().includes(q))
          .slice(0, 3)
          .forEach((w: any) => {
            results.push({
              type: 'warehouse',
              id: w.id,
              title: w.name,
              subtitle: `Código: ${w.code}`,
              icon: 'warehouse',
              route: `/warehouses/${w.id}`
            });
          });

        return results;
      })
    );
  }
}