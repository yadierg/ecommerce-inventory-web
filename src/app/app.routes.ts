import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'warehouses',
        loadComponent: () =>
          import('./features/warehouses/warehouses-list/warehouses-list.component').then(
            (m) => m.WarehousesListComponent,
          ),
      },
      {
        path: 'warehouses/new',
        loadComponent: () =>
          import('./features/warehouses/warehouse-form/warehouse-form.component').then(
            (m) => m.WarehouseFormComponent,
          ),
      },
      {
        path: 'warehouses/:id/edit',
        loadComponent: () =>
          import('./features/warehouses/warehouse-form/warehouse-form.component').then(
            (m) => m.WarehouseFormComponent,
          ),
      },
      {
        path: 'warehouses/:id',
        loadComponent: () =>
          import('./features/warehouses/warehouse-detail/warehouse-detail.component').then(
            (m) => m.WarehouseDetailComponent,
          ),
      },
      {
        path: 'stocks',
        loadComponent: () =>
          import('./features/stocks/stocks-list/stocks-list.component').then(
            (m) => m.StocksListComponent,
          ),
      },
      {
        path: 'stocks/transfer',
        loadComponent: () =>
          import('./features/stocks/stock-transfer/stock-transfer.component').then(
            (m) => m.StockTransferComponent,
          ),
      },
      {
        path: 'stocks/:id/adjust',
        loadComponent: () =>
          import('./features/stocks/stock-adjust/stock-adjust.component').then(
            (m) => m.StockAdjustComponent,
          ),
      },
      {
        path: 'movements',
        loadComponent: () =>
          import('./features/movements/movements-list/movements-list.component').then(
            (m) => m.MovementsListComponent,
          ),
      },
      {
        path: 'suppliers',
        loadComponent: () =>
          import('./features/suppliers/suppliers-list/suppliers-list.component').then(
            (m) => m.SuppliersListComponent,
          ),
      },
      {
        path: 'suppliers/new',
        loadComponent: () =>
          import('./features/suppliers/supplier-form/supplier-form.component').then(
            (m) => m.SupplierFormComponent,
          ),
      },
      {
        path: 'suppliers/:id/edit',
        loadComponent: () =>
          import('./features/suppliers/supplier-form/supplier-form.component').then(
            (m) => m.SupplierFormComponent,
          ),
      },
      {
        path: 'purchase-orders',
        loadComponent: () =>
          import('./features/purchase-orders/po-list/po-list.component').then(
            (m) => m.PoListComponent,
          ),
      },
      {
        path: 'purchase-orders/new',
        loadComponent: () =>
          import('./features/purchase-orders/po-form/po-form.component').then(
            (m) => m.PoFormComponent,
          ),
      },
      {
        path: 'purchase-orders/:id',
        loadComponent: () =>
          import('./features/purchase-orders/po-detail/po-detail.component').then(
            (m) => m.PoDetailComponent,
          ),
      },
      {
        path: 'purchase-orders/:id/receive',
        loadComponent: () =>
          import('./features/purchase-orders/po-receive/po-receive.component').then(
            (m) => m.PoReceiveComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];