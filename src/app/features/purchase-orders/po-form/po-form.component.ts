import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Supplier } from '../../../core/models/supplier.model';
import { Warehouse } from '../../../core/models/warehouse.model';

@Component({
  selector: 'app-po-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CurrencyPipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './po-form.component.html',
  styleUrls: ['./po-form.component.scss']
})
export class PoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(PurchaseOrdersService);
  private suppliersSvc = inject(SuppliersService);
  private warehousesSvc = inject(WarehousesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);

  isEdit = signal(false);
  loading = signal(true);
  saving = signal(false);
  private id: string | null = null;

  suppliers = signal<Supplier[]>([]);
  warehouses = signal<Warehouse[]>([]);

  form = this.fb.group({
    supplierId: ['', Validators.required],
    warehouseId: ['', Validators.required],
    orderDate: [new Date(), Validators.required],
    expectedDate: [null as Date | null],
    notes: [''],
    items: this.fb.array([])
  });

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnInit() {
    this.loadCatalogs();
    this.id = this.route.snapshot.paramMap.get('id');
    
    if (this.id) {
      this.isEdit.set(true);
      this.loadOrder(this.id);
    } else {
      this.addItem(); // Empezar con 1 ítem por defecto
      this.loading.set(false);
    }
  }

  loadCatalogs() {
    this.suppliersSvc.findAll().subscribe(data => this.suppliers.set(data));
    this.warehousesSvc.findAll().subscribe(data => this.warehouses.set(data));
  }

  loadOrder(id: string) {
    this.svc.findOne(id).subscribe({
      next: (po) => {
        this.form.patchValue({
          supplierId: po.supplierId,
          warehouseId: po.warehouseId,
          orderDate: new Date(po.orderDate),
          expectedDate: po.expectedDate ? new Date(po.expectedDate) : null,
          notes: po.notes ?? '',
        });

        // Limpiar items por defecto y cargar los reales
        this.items.clear();
        po.items.forEach(item => {
          this.items.push(this.fb.group({
            productId: [item.productId, Validators.required],
            quantity: [item.quantity, [Validators.required, Validators.min(1)]],
            unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]]
          }));
        });

        this.loading.set(false);
      },
      error: () => {
        this.notification.error('No se pudo cargar la orden');
        this.router.navigate(['/purchase-orders']);
      }
    });
  }

  addItem() {
    this.items.push(this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    }));
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  calculateTotal(): number {
    return this.items.controls.reduce((acc, item) => {
      const qty = item.get('quantity')?.value || 0;
      const price = item.get('unitPrice')?.value || 0;
      return acc + (qty * price);
    }, 0);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.warn('Revisa los campos obligatorios');
      return;
    }

    this.saving.set(true);
    const formValue = this.form.value;

    // Formatear fechas a ISO string (solo la parte de la fecha)
    const payload: any = {
      supplierId: formValue.supplierId,
      warehouseId: formValue.warehouseId,
      orderDate: formValue.orderDate?.toISOString().split('T')[0],
      expectedDate: formValue.expectedDate ? formValue.expectedDate.toISOString().split('T')[0] : undefined,
      notes: formValue.notes || undefined,
      items: formValue.items
    };

    const obs = this.id
      ? this.svc.update(this.id, payload)
      : this.svc.create(payload);

    obs.subscribe({
      next: (res) => {
        this.notification.success(this.id ? 'Orden actualizada' : 'Orden creada correctamente');
        this.router.navigate(['/purchase-orders', res.id || this.id]);
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message || 'Error al guardar la orden');
      }
    });
  }
}