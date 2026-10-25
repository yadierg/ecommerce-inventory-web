import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { WarehousesService } from '../../../core/services/warehouses.service';
import { ProductsService } from '../../../core/services/products.service';
import { InitialStockService } from '../../../core/services/initial-stock.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Warehouse } from '../../../core/models/warehouse.model';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-initial-stock',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './initial-stock.component.html',
  styleUrls: ['./initial-stock.component.scss']
})
export class InitialStockComponent implements OnInit {
  private fb = inject(FormBuilder);
  private warehousesSvc = inject(WarehousesService);
  private productsSvc = inject(ProductsService);
  private initialStockSvc = inject(InitialStockService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  loading = signal(true);
  saving = signal(false);
  
  warehouses = signal<Warehouse[]>([]);
  products = signal<Product[]>([]);

  form = this.fb.group({
    warehouseId: ['', Validators.required],
    reason: ['Carga inicial de inventario'],
    items: this.fb.array([])
  });

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.warehousesSvc.findAll().subscribe(wh => {
      this.warehouses.set(wh);
      if (wh.length > 0) {
        this.form.patchValue({ warehouseId: wh[0].id });
      }
      
      this.productsSvc.findAll({ limit: 100 }).subscribe(prodRes => {
        this.products.set(prodRes.data);
        this.loading.set(false);
        this.addItem(); // Añadir una fila por defecto
      });
    });
  }

  addItem() {
    this.items.push(this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitCost: [0]
    }));
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.warn('Revisa los datos ingresados');
      return;
    }

    this.saving.set(true);
    const formValue = this.form.value;

    const payload = {
      warehouseId: formValue.warehouseId,
      reason: formValue.reason,
      items: formValue.items
    };

    this.initialStockSvc.load(payload as any).subscribe({
      next: (res) => {
        this.notification.success(`Carga exitosa: ${res.created} creados, ${res.updated} actualizados`);
        this.router.navigate(['/stocks']);
      },
      error: (err) => {
        this.saving.set(false);
        if (err.status === 400 && Array.isArray(err.error?.message)) {
          this.notification.error(`Errores:\n${err.error.message.join('\n')}`);
        } else {
          this.notification.error(err?.error?.message || 'Error al cargar inventario');
        }
      }
    });
  }
}