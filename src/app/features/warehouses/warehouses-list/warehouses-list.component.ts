import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Warehouse } from '../../../core/models/warehouse.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-warehouses-list',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './warehouses-list.component.html',
  styleUrls: ['./warehouses-list.component.scss']
})
export class WarehousesListComponent implements OnInit {
  private svc = inject(WarehousesService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading = signal(true);
  dataSource = new MatTableDataSource<Warehouse>([]);
  columns = ['code', 'name', 'city', 'manager', 'status', 'actions'];

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.svc.findAll(true).subscribe({
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

  setDefault(w: Warehouse) {
    this.svc.setDefault(w.id).subscribe({
      next: () => {
        this.notification.success(`${w.name} marcado como default`);
        this.load();
      },
    });
  }

  confirmDelete(w: Warehouse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar almacén',
        message: `¿Estás seguro de eliminar "${w.name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        color: 'warn',
      },
    });

    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.svc.remove(w.id).subscribe({
        next: () => {
          this.notification.success('Almacén eliminado');
          this.load();
        },
        error: (err) => {
          this.notification.error(err?.error?.message || 'No se pudo eliminar el almacén');
        }
      });
    });
  }
}