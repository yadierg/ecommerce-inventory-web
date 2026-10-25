import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common'; // 👈 AÑADIR ESTA LÍNEA
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';

import { ProductsService } from '../../../core/services/products.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    CurrencyPipe,
  ],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  private productsSvc = inject(ProductsService);
  private categoriesSvc = inject(CategoriesService);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);

  products = signal<Product[]>([]);
  categories = signal<any[]>([]);
  loading = signal(true);
  saving = signal(false);

  columns = ['sku', 'name', 'price', 'stock', 'actions'];

  form = this.fb.group({
    name: ['', Validators.required],
    sku: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    categoryId: ['']
  });

  ngOnInit() {
    this.loadProducts();
    this.categoriesSvc.findAll().subscribe(data => this.categories.set(data));
  }

  loadProducts() {
    this.loading.set(true);
    this.productsSvc.findAll({ limit: 100 }).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.productsSvc.create(this.form.value as any).subscribe({
      next: () => {
        this.notification.success('Producto creado. Ahora puedes cargar su stock.');
        this.form.reset({ price: 0 });
        this.saving.set(false);
        this.loadProducts();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message || 'Error al crear producto');
      }
    });
  }
}