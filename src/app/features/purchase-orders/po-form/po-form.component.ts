import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { CurrencyPipe, AsyncPipe } from '@angular/common';
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { StocksService } from '../../../core/services/stocks.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Supplier } from '../../../core/models/supplier.model';
import { Warehouse } from '../../../core/models/warehouse.model';
import { Stock } from '../../../core/models/stock.model';

@Component({
  selector: 'app-po-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    // RouterLink,
    // CurrencyPipe,
    // AsyncPipe,
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
    MatAutocompleteModule,
  ],
  templateUrl: './po-form.component.html',
  styleUrls: ['./po-form.component.scss']
})
export class PoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(PurchaseOrdersService);
  private suppliersSvc = inject(SuppliersService);
  private warehousesSvc = inject(WarehousesService);
  private stocksSvc = inject(StocksService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);

  isEdit = signal(false);
  loading = signal(true);
  saving = signal(false);
  private id: string | null = null;

  suppliers = signal<Supplier[]>([]);
  warehouses = signal<Warehouse[]>([]);
  availableProducts = signal<Stock[]>([]);

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
      this.addItem();
      this.loading.set(false);
    }
  }

  loadCatalogs() {
    this.suppliersSvc.findAll().subscribe(data => this.suppliers.set(data));
    this.warehousesSvc.findAll().subscribe(data => this.warehouses.set(data));
    // Cargamos los productos que ya existen en el inventario
    this.stocksSvc.findAll().subscribe(data => {
      // Filtramos duplicados por ID de producto
      const unique = Array.from(new Map(data.map(s => [s.productId, s])).values());
      this.availableProducts.set(unique);
    });
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

  // Filtro para el Autocomplete de productos
  _filterProducts(value: string): Stock[] {
    const filterValue = value.toLowerCase();
    return this.availableProducts().filter(
      p => p.product?.name?.toLowerCase().includes(filterValue) || 
           p.productId.toLowerCase().includes(filterValue)
    );
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

  displayProduct = (id: string): string => {
    if (!id) return '';
    const p = this.availableProducts().find(x => x.productId === id);
    return p ? `${p.product?.name || 'Producto'} (${id.slice(0,8)})` : id;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.warn('Revisa los campos obligatorios');
      return;
    }

    this.saving.set(true);
    const formValue = this.form.value;

    const payload: any = {
      supplierId: formValue.supplierId,
      warehouseId: formValue.warehouseId,
      orderDate: formValue.orderDate?.toISOString().split('T')[0],
      expectedDate: formValue.expectedDate ? formValue.expectedDate.toISOString().split('T')[0] : undefined,
      notes: formValue.notes || undefined,
      items: formValue.items
    };

    const obs = this.id ? this.svc.update(this.id, payload) : this.svc.create(payload);

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