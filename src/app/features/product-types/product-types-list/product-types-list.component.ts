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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router'; // 👈 Añadido para el botón de atributos

import { ProductTypesService } from '../../../core/services/product-types.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductType } from '../../../core/models/materials.models';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-types-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    NgClass, 
    RouterLink, // 👈 Añadido
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatButtonModule, 
    MatIconModule, 
    MatTableModule, 
    MatSlideToggleModule,
    MatProgressSpinnerModule, 
    MatTooltipModule, 
    MatDialogModule
  ],
  templateUrl: './product-types-list.component.html',
  styleUrls: ['./product-types-list.component.scss']
})
export class ProductTypesListComponent implements OnInit {
  private svc = inject(ProductTypesService);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  types = signal<ProductType[]>([]);
  loading = signal(true);
  saving = signal(false);
  editMode = signal(false);
  currentId = signal<string | null>(null);

  // 👇 Filtros
  searchQuery = signal('');
  showSystem = signal(true);

  // 👇 Lista filtrada
  filteredTypes = computed(() => {
    let result = this.types();
    const query = this.searchQuery().toLowerCase();
    const showSys = this.showSystem();

    if (query) {
      result = result.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.code.toLowerCase().includes(query)
      );
    }
    if (!showSys) {
      result = result.filter(t => !t.isSystem);
    }
    return result;
  });

  columns = ['code', 'name', 'type', 'status', 'actions'];

  form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(20)]],
    name: ['', Validators.required],
    nameEn: [''],
    isActive: [true],
    orderIndex: [100]
  });

  ngOnInit() {
    this.loadTypes();
  }

  loadTypes() {
    this.loading.set(true);
    this.svc.findAll().subscribe({
      next: (res) => {
        this.types.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  editType(type: ProductType) {
    this.editMode.set(true);
    this.currentId.set(type.id);
    this.form.patchValue({
      code: type.code,
      name: type.name,
      nameEn: type.nameEn || '',
      isActive: type.isActive,
      orderIndex: type.orderIndex
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editMode.set(false);
    this.currentId.set(null);
    this.form.reset({ isActive: true, orderIndex: 100 });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = { ...this.form.value };

    if (this.editMode()) {
      delete payload.code;
    }

    const obs = this.currentId()
      ? this.svc.update(this.currentId()!, payload as any)
      : this.svc.create(payload as any);

    obs.subscribe({
      next: () => {
        this.notification.success(this.editMode() ? 'Tipo actualizado' : 'Tipo creado');
        this.cancelEdit();
        this.loadTypes();
        this.saving.set(false);
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message || 'Error al guardar');
      }
    });
  }

  deleteType(type: ProductType) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Tipo de Producto',
        message: `¿Seguro que deseas eliminar "${type.name}"? Si hay materiales usándolo, fallará.`,
        confirmText: 'Eliminar',
        color: 'warn'
      }
    });

    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.svc.remove(type.id).subscribe({
        next: () => {
          this.notification.success('Tipo eliminado');
          this.loadTypes();
        },
        error: (err) => this.notification.error(err?.error?.message || 'No se pudo eliminar')
      });
    });
  }
}