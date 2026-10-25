import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { StocksService } from '../../../core/services/stocks.service';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Warehouse } from '../../../core/models/warehouse.model';

@Component({
  selector: 'app-stock-transfer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './stock-transfer.component.html',
  styleUrls: ['./stock-transfer.component.scss']
})
export class StockTransferComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(StocksService);
  private warehousesSvc = inject(WarehousesService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  loading = signal(true);
  saving = signal(false);
  warehouses = signal<Warehouse[]>([]);

  form = this.fb.group({
    productId: ['', Validators.required],
    fromWarehouseId: ['', Validators.required],
    toWarehouseId: ['', Validators.required],
    quantity: [null as number | null, [Validators.required, Validators.min(1)]],
    notes: [''],
  });

  ngOnInit() {
    this.warehousesSvc.findAll().subscribe({
      next: (data) => {
        this.warehouses.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('No se pudieron cargar los almacenes');
        this.loading.set(false);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    
    // Validación básica en cliente: no transferir al mismo almacén
    if (formValue.fromWarehouseId === formValue.toWarehouseId) {
      this.notification.warn('El almacén de origen y destino no pueden ser iguales');
      return;
    }

    this.saving.set(true);
    const payload = {
      productId: formValue.productId as string,
      fromWarehouseId: formValue.fromWarehouseId as string,
      toWarehouseId: formValue.toWarehouseId as string,
      quantity: formValue.quantity as number,
      notes: formValue.notes || undefined
    };

    this.svc.transfer(payload).subscribe({
      next: () => {
        this.notification.success('Transferencia realizada con éxito');
        this.router.navigate(['/stocks']);
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message || 'Error al transferir el stock');
      }
    });
  }
}