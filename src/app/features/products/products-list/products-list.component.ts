import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ProductsService } from '../../../core/services/products.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product, Category } from '../../../core/models/product.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CurrencyPipe, 
    MatCardModule, 
    MatFormFieldModule,
    MatInputModule, 
    MatButtonModule, 
    MatIconModule, 
    MatTableModule,
    MatSelectModule, 
    MatSlideToggleModule, 
    MatProgressSpinnerModule,
    MatDialogModule, 
    MatTooltipModule,
  ],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  private productsSvc = inject(ProductsService);
  private categoriesSvc = inject(CategoriesService);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  saving = signal(false);
  editMode = signal(false);
  currentId = signal<string | null>(null);

  // Estado de los filtros
  searchQuery = signal('');
  categoryFilter = signal<string | null>(null);
  showInactive = signal(false);

  // Lógica de filtrado
  filteredProducts = computed(() => {
    let result = this.products();
    const query = this.searchQuery().toLowerCase();
    const catId = this.categoryFilter();
    const inactive = this.showInactive();

    if (query) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.sku.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query))
      );
    }

    if (catId) {
      result = result.filter(p => p.categoryId === catId);
    }

    if (!inactive) {
      result = result.filter(p => p.isActive);
    }

    return result;
  });

  columns = ['sku', 'name', 'category', 'price', 'stock', 'actions'];

  form = this.fb.group({
    name: ['', Validators.required],
    sku: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    costPrice: [0],
    stock: [0],
    lowStockThreshold: [10],
    categoryId: [null as string | null],
    brand: [''],
    description: [''],
    isActive: [true],
    isFeatured: [false]
  });

  ngOnInit() {
    this.loadProducts();
    this.categoriesSvc.findAll().subscribe(data => this.categories.set(data));
  }

  loadProducts() {
    this.loading.set(true);
    this.productsSvc.findAll({ limit: 1000 }).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  clearFilters() {
    this.searchQuery.set('');
    this.categoryFilter.set(null);
    this.showInactive.set(false);
  }

  editProduct(p: Product) {
    this.editMode.set(true);
    this.currentId.set(p.id);
    this.form.patchValue({
      name: p.name, 
      sku: p.sku, 
      price: p.price,
      costPrice: p.costPrice || 0, 
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      categoryId: p.categoryId || null,
      brand: p.brand || '', 
      description: p.description || '',
      isActive: p.isActive, 
      isFeatured: p.isFeatured
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editMode.set(false);
    this.currentId.set(null);
    this.form.reset({ price: 0, stock: 0, lowStockThreshold: 10, isActive: true });
  }

  onSubmit() {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      return; 
    }
    
    this.saving.set(true);
    const payload = { ...this.form.value };
    if (!payload.categoryId) delete payload.categoryId;

    const request = this.editMode()
      ? this.productsSvc.update(this.currentId()!, payload as any)
      : this.productsSvc.create(payload as any);

    request.subscribe({
      next: () => {
        this.notification.success(this.editMode() ? 'Producto actualizado' : 'Producto creado');
        this.cancelEdit(); 
        this.loadProducts(); 
        this.saving.set(false);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message || 'Error al guardar producto');
      }
    });
  }

  deleteProduct(p: Product) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { 
        title: 'Eliminar Producto', 
        message: `¿Seguro que deseas eliminar "${p.name}"?`, 
        confirmText: 'Eliminar', 
        color: 'warn' 
      }
    });
    
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.productsSvc.remove(p.id).subscribe({
        next: () => { 
          this.notification.success('Producto eliminado'); 
          this.loadProducts(); 
        },
        error: (err: any) => this.notification.error(err?.error?.message || 'Error al eliminar')
      });
    });
  }
}