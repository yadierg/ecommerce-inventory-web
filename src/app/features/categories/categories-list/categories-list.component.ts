import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CategoriesService } from '../../../core/services/categories.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Category } from '../../../core/models/product.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss']
})
export class CategoriesListComponent implements OnInit {
  private categoriesSvc = inject(CategoriesService);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  categories = signal<Category[]>([]);
  loading = signal(true);
  saving = signal(false);
  editMode = signal(false);
  currentId = signal<string | null>(null);

  // Filtro
  searchQuery = signal('');

  filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.categories();
    return this.categories().filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.slug.toLowerCase().includes(query)
    );
  });

  columns = ['name', 'slug', 'status', 'actions'];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    slug: [''],
    description: [''],
    isActive: [true]
  });

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.categoriesSvc.findAll().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  clearFilters() {
    this.searchQuery.set('');
  }

  editCategory(cat: Category) {
    this.editMode.set(true);
    this.currentId.set(cat.id);
    this.form.patchValue({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      isActive: cat.isActive
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editMode.set(false);
    this.currentId.set(null);
    this.form.reset({ isActive: true });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = { ...this.form.value };
    
    if (!payload.slug) {
      delete payload.slug;
    }

    const request = this.editMode()
      ? this.categoriesSvc.update(this.currentId()!, payload as any)
      : this.categoriesSvc.create(payload as any);

    request.subscribe({
      next: () => {
        this.notification.success(this.editMode() ? 'Categoría actualizada' : 'Categoría creada');
        this.cancelEdit();
        this.loadCategories();
        this.saving.set(false);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message || 'Error al guardar categoría');
      }
    });
  }

  deleteCategory(cat: Category) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Categoría',
        message: `¿Seguro que deseas eliminar "${cat.name}"? Los productos asociados podrían perder su categoría.`,
        confirmText: 'Eliminar',
        color: 'warn'
      }
    });

    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.categoriesSvc.remove(cat.id).subscribe({
        next: () => {
          this.notification.success('Categoría eliminada');
          this.loadCategories();
        },
        error: (err: any) => this.notification.error(err?.error?.message || 'Error al eliminar')
      });
    });
  }
}