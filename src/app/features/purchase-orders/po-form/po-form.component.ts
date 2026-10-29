import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, AsyncPipe } from '@angular/common';
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

import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { ProductsService } from '../../../core/services/products.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Supplier } from '../../../core/models/supplier.model';
import { Warehouse } from '../../../core/models/warehouse.model';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-po-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CurrencyPipe,
    AsyncPipe,
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
  private productsSvc = inject(ProductsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);

  isEdit = signal(false);
  loading = signal(true);
  saving = signal(false);
  private id: string | null = null;

  suppliers = signal<Supplier[]>([]);
  warehouses = signal<Warehouse[]>([]);
  products = signal<Product[]>([]);

  // Almacena los observables de filtrado por cada fila
  filteredProducts: Observable<Product[]>[] = [];

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
    // 👇 Extraemos .data de la respuesta paginada
    this.suppliersSvc.findAll().subscribe(res => this.suppliers.set(res.data));
    
    this.warehousesSvc.findAll().subscribe(data => this.warehouses.set(data));
    
    this.productsSvc.findAll({ limit: 1000 }).subscribe(res => {
      this.products.set(res.data);
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
        this.filteredProducts = [];

        po.items.forEach(item => {
          this.addItem(item.productId, item.quantity, item.unitPrice);
        });

        this.loading.set(false);
      },
      error: () => {
        this.notification.error('No se pudo cargar la orden');
        this.router.navigate(['/purchase-orders']);
      }
    });
  }

  addItem(productId = '', quantity = 1, unitPrice = 0) {
    const itemGroup = this.fb.group({
      productSearch: ['', Validators.required], // Control de búsqueda visual
      productId: [productId, Validators.required], // ID real para el backend
      quantity: [quantity, [Validators.required, Validators.min(1)]],
      unitPrice: [unitPrice, [Validators.required, Validators.min(0)]]
    });

    this.items.push(itemGroup);

    // Configuramos el filtro reactivo para este item
    const searchControl = itemGroup.get('productSearch') as FormControl;
    const filtered = searchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
    this.filteredProducts.push(filtered);

    // Si estamos editando, cargamos el nombre del producto
    if (productId) {
      const p = this.products().find(x => x.id === productId);
      if (p) searchControl.setValue(p.name, { emitEvent: false });
    }
  }

  private _filter(value: string | Product): Product[] {
    const name = typeof value === 'string' ? value : value?.name;
    if (!name) return this.products();
    const filterValue = name.toLowerCase();
    return this.products().filter(p => 
      p.name.toLowerCase().includes(filterValue) || 
      p.sku.toLowerCase().includes(filterValue)
    );
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.filteredProducts.splice(index, 1);
    }
  }

  // Al seleccionar un producto, guardamos el ID
  onProductSelected(index: number, product: Product) {
    const group = this.items.at(index);
    group.get('productId')?.setValue(product.id);
    if (product.costPrice) {
      group.get('unitPrice')?.setValue(product.costPrice);
    }
  }

  displayProduct = (product: Product | string | null): string => {
    if (!product) return '';
    return typeof product === 'string' ? product : product.name;
  };

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

    const itemsPayload = (formValue.items || []).map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    }));

    const payload: any = {
      supplierId: formValue.supplierId,
      warehouseId: formValue.warehouseId,
      orderDate: formValue.orderDate?.toISOString().split('T')[0],
      expectedDate: formValue.expectedDate ? formValue.expectedDate.toISOString().split('T')[0] : undefined,
      notes: formValue.notes || undefined,
      items: itemsPayload
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