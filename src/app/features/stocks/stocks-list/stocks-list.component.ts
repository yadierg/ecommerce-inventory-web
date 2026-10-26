import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgClass, DecimalPipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { StocksService } from '../../../core/services/stocks.service';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Stock, StockFilters } from '../../../core/models/stock.model';
import { Warehouse } from '../../../core/models/warehouse.model';
import { StockEditDialogComponent } from '../stock-edit-dialog/stock-edit-dialog.component';

@Component({
  selector: 'app-stocks-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgClass,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatDialogModule,
    DecimalPipe,
  ],
  templateUrl: './stocks-list.component.html',
  styleUrls: ['./stocks-list.component.scss']
})
export class StocksListComponent implements OnInit {
  private svc = inject(StocksService);
  private warehousesSvc = inject(WarehousesService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading = signal(true);
  dataSource = new MatTableDataSource<Stock>([]);
  warehouses = signal<Warehouse[]>([]);
  
  warehouseFilter = new FormControl<string | null>(null);
  statusFilter = new FormControl<string>('all');

  columns = ['product', 'warehouse', 'quantity', 'minStock', 'status', 'actions'];

  ngOnInit() {
    this.loadWarehouses();
    this.loadStocks();

    this.warehouseFilter.valueChanges.subscribe(() => this.loadStocks());
    this.statusFilter.valueChanges.subscribe(() => this.loadStocks());
  }

  loadWarehouses() {
    this.warehousesSvc.findAll().subscribe((data) => {
      this.warehouses.set(data);
    });
  }

  loadStocks() {
    this.loading.set(true);
    const filters: StockFilters = {};
    
    if (this.warehouseFilter.value) {
      filters.warehouseId = this.warehouseFilter.value;
    }

    this.svc.findAll(filters).subscribe({
      next: (response) => {
        let stocks = response.data;
        const status = this.statusFilter.value;
        
        // Filtrado local estricto para alertas
        if (status === 'low') {
          stocks = stocks.filter(s => s.quantity > 0 && s.minStock !== undefined && s.minStock > 0 && s.quantity <= s.minStock);
        } else if (status === 'out') {
          stocks = stocks.filter(s => s.quantity === 0);
        }

        this.dataSource.data = stocks;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getStatus(stock: Stock): 'out' | 'low' | 'ok' {
    if (stock.quantity === 0) return 'out';
    if (stock.minStock && stock.minStock > 0 && stock.quantity <= stock.minStock) return 'low';
    return 'ok';
  }

  goToAdjust(stock: Stock) {
    this.router.navigate(['/stocks', stock.id, 'adjust']);
  }

  editStock(stock: Stock) {
    const ref = this.dialog.open(StockEditDialogComponent, {
      width: '400px',
      data: { stock }
    });

    ref.afterClosed().subscribe(result => {
      if (!result) return;

      this.svc.update(stock.id, result).subscribe({
        next: () => {
          this.notification.success('Stock actualizado correctamente');
          this.loadStocks();
        },
        error: (err: any) => {
          this.notification.error(err?.error?.message || 'Error al actualizar stock');
        }
      });
    });
  }
}