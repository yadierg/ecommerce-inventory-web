import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, CurrencyPipe, NgClass, UpperCasePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { PurchaseOrder, PurchaseOrderStatus } from '../../../core/models/purchase-order.model';

@Component({
  selector: 'app-po-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DatePipe,
    CurrencyPipe,
    NgClass,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
  ],
  templateUrl: './po-list.component.html',
  styleUrls: ['./po-list.component.scss']
})
export class PoListComponent implements OnInit {
  private svc = inject(PurchaseOrdersService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading = signal(true);
  dataSource = new MatTableDataSource<PurchaseOrder>([]);
  
  statusFilter = new FormControl<PurchaseOrderStatus | 'all'>('all');
  columns = ['orderNumber', 'supplier', 'date', 'total', 'status', 'actions'];

  ngOnInit() {
    this.loadOrders();
    this.statusFilter.valueChanges.subscribe(() => this.loadOrders());
  }

  loadOrders() {
    this.loading.set(true);
    this.svc.findAll().subscribe({
      next: (data) => {
        let filtered = data;
        const status = this.statusFilter.value;
        if (status && status !== 'all') {
          filtered = data.filter(po => po.status === status);
        }
        
        this.dataSource.data = filtered;
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

  getStatusLabel(status: PurchaseOrderStatus): string {
    const labels: Record<PurchaseOrderStatus, string> = {
      draft: 'Borrador',
      sent: 'Enviada',
      confirmed: 'Confirmada',
      partially_received: 'Parcial',
      received: 'Recibida',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  }
}