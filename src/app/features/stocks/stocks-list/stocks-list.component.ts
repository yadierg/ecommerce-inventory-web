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

import { StocksService } from '../../../core/services/stocks.service';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { Stock, StockFilters } from '../../../core/models/stock.model';
import { Warehouse } from '../../../core/models/warehouse.model';

@Component({
  selector: 'app-stocks-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
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
    DecimalPipe,
    NgClass,
  ],
  templateUrl: './stocks-list.component.html',
  styleUrls: ['./stocks-list.component.scss']
})
export class StocksListComponent implements OnInit {
  private svc = inject(StocksService);
  private warehousesSvc = inject(WarehousesService);
  private router = inject(Router);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading = signal(true);
  dataSource = new MatTableDataSource<Stock>([]);
  warehouses = signal<Warehouse[]>([]);
  
  // Filtros
  warehouseFilter = new FormControl<string | null>(null);
  statusFilter = new FormControl<string>('all');

  columns = ['product', 'warehouse', 'quantity', 'minStock', 'status', 'actions'];

  ngOnInit() {
    this.loadWarehouses();
    this.loadStocks();

    // Escuchar cambios en los filtros
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

    const status = this.statusFilter.value;
    if (status === 'low') filters.lowStock = true;
    if (status === 'out') filters.outOfStock = true;

    this.svc.findAll(filters).subscribe({
      next: (data) => {
        this.dataSource.data = data;
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
    if (stock.minStock && stock.quantity <= stock.minStock) return 'low';
    return 'ok';
  }

  goToAdjust(stock: Stock) {
    this.router.navigate(['/stocks', stock.id, 'adjust']);
  }
}