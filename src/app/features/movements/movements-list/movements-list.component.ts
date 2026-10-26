import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe, NgClass} from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MovementsService } from '../../../core/services/movements.service';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { Movement, MovementFilters, MovementType } from '../../../core/models/movement.model';
import { Warehouse } from '../../../core/models/warehouse.model';

@Component({
  selector: 'app-movements-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    DatePipe,
    DecimalPipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
  ],
  templateUrl: './movements-list.component.html',
  styleUrls: ['./movements-list.component.scss']
})
export class MovementsListComponent implements OnInit {
  private svc = inject(MovementsService);
  private warehousesSvc = inject(WarehousesService);
  private router = inject(Router);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading = signal(true);
  dataSource = new MatTableDataSource<Movement>([]);
  warehouses = signal<Warehouse[]>([]);

  // Filtros
  warehouseFilter = new FormControl<string | null>(null);
  typeFilter = new FormControl<MovementType | 'all'>('all');
  dateFromFilter = new FormControl<Date | null>(null);
  dateToFilter = new FormControl<Date | null>(null);

  columns = ['date', 'type', 'product', 'warehouse', 'quantity', 'reason'];

  ngOnInit() {
    this.loadWarehouses();
    this.loadMovements();

    // Escuchar cambios en los filtros
    this.warehouseFilter.valueChanges.subscribe(() => this.loadMovements());
    this.typeFilter.valueChanges.subscribe(() => this.loadMovements());
    this.dateFromFilter.valueChanges.subscribe(() => this.loadMovements());
    this.dateToFilter.valueChanges.subscribe(() => this.loadMovements());
  }

  loadWarehouses() {
    this.warehousesSvc.findAll().subscribe((data) => {
      this.warehouses.set(data);
    });
  }

  loadMovements() {
    this.loading.set(true);
    const filters: MovementFilters = {};

    if (this.warehouseFilter.value) {
      filters.warehouseId = this.warehouseFilter.value;
    }
    /*  if (this.typeFilter.value && this.typeFilter.value !== 'all') {
        filters.type = this.typeFilter.value as MovementType;
      } */
    if (this.dateFromFilter.value) {
      filters.from = this.dateFromFilter.value.toISOString();
    }
    if (this.dateToFilter.value) {
      filters.to = this.dateToFilter.value.toISOString();
    }

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

  clearFilters() {
    this.warehouseFilter.setValue(null);
    this.typeFilter.setValue('all');
    this.dateFromFilter.setValue(null);
    this.dateToFilter.setValue(null);
    this.loadMovements();
  }

  typeLabel(type: MovementType): string {
    const labels: Record<MovementType, string> = {
      in: 'Entrada',
      out: 'Salida',
      adjustment: 'Ajuste',
      transfer_in: 'Transf. Entrada',
      transfer_out: 'Transf. Salida',
      purchase_receive: 'Recep. Compra',
      sale: 'Venta'
    };
    return labels[type] || type;
  }
}