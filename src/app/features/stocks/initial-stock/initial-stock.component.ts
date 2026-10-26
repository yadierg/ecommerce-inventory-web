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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

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
    MatDatepickerModule,
    MatNativeDateModule,
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
        this.addItem();
      });
    });
  }

  addItem() {
    this.items.push(this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitCost: [null],
      lotNumber: [''],
      location: [''],
      estimatedAcquisitionDate: [null],
      notes: ['']
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

    const formattedItems = (formValue.items || []).map((item: any) => {
      // Construimos el objeto base solo con lo requerido
      const cleanItem: any = {
        productId: item.productId,
        quantity: Number(item.quantity),
      };

      // Añadimos campos opcionales SOLO si tienen valor
      if (item.unitCost != null && item.unitCost !== '') cleanItem.unitCost = Number(item.unitCost);
      if (item.lotNumber) cleanItem.lotNumber = item.lotNumber;
      if (item.location) cleanItem.location = item.location;
      if (item.notes) cleanItem.notes = item.notes;
      
      if (item.estimatedAcquisitionDate) {
        const d = new Date(item.estimatedAcquisitionDate);
        cleanItem.estimatedAcquisitionDate = d.toISOString().split('T')[0];
      }

      return cleanItem;
    });

    const payload = {
      warehouseId: formValue.warehouseId,
      reason: formValue.reason || 'Carga inicial de inventario',
      items: formattedItems
    };

    console.log('Payload enviado al backend:', JSON.stringify(payload, null, 2)); // 👈 Para debug

    this.initialStockSvc.load(payload as any).subscribe({
      next: (res) => {
        this.notification.success(`Carga exitosa: ${res.created} creados, ${res.updated} actualizados`);
        this.router.navigate(['/stocks']);
      },
      error: (err) => {
        this.saving.set(false);
        console.error('Error del backend:', err.error); // 👈 Para ver el detalle
        if (err.status === 400 && Array.isArray(err.error?.message)) {
          this.notification.error(`Errores:\n${err.error.message.join('\n')}`);
        } else if (err.status === 500) {
          this.notification.error('Error interno del servidor. Revisa la consola.');
        } else {
          this.notification.error(err?.error?.message || 'Error al cargar inventario');
        }
      }
    });
  }
}