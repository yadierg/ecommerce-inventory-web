import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NgClass } from '@angular/common';

import { AttributeDefinitionsService } from '../../../core/services/attribute-definitions.service';
import { ProductTypesService } from '../../../core/services/product-types.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AttributeDefinition, ProductType, AttributeDataType } from '../../../core/models/materials.models';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-attributes-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, NgClass, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatSlideToggleModule,
    MatProgressSpinnerModule, MatTooltipModule, MatDialogModule
  ],
  templateUrl: './attributes-list.component.html',
  styleUrls: ['./attributes-list.component.scss']
})
export class AttributesListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private attrsSvc = inject(AttributeDefinitionsService);
  private typesSvc = inject(ProductTypesService);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  typeId: string | null = null;
  productType = signal<ProductType | null>(null);
  attributes = signal<AttributeDefinition[]>([]);
  
  loading = signal(true);
  saving = signal(false);
  editMode = signal(false);
  currentId = signal<string | null>(null);

  dataTypes = Object.values(AttributeDataType);

  columns = ['label', 'key', 'type', 'unit', 'status', 'actions'];

  form = this.fb.group({
    key: ['', [Validators.required, Validators.pattern('^[a-z0-9_]+$')]],
    label: ['', Validators.required],
    dataType: [AttributeDataType.STRING, Validators.required],
    unit: [''],
    isRequired: [false],
    orderIndex: [100]
  });

  ngOnInit() {
    this.typeId = this.route.snapshot.paramMap.get('id');
    if (!this.typeId) {
      this.router.navigate(['/product-types']);
      return;
    }

    this.typesSvc.findOne(this.typeId).subscribe(data => this.productType.set(data));
    this.loadAttributes();
  }

  loadAttributes() {
    if (!this.typeId) return;
    this.loading.set(true);
    this.attrsSvc.findByProductType(this.typeId).subscribe({
      next: (data) => {
        this.attributes.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  editAttribute(attr: AttributeDefinition) {
    this.editMode.set(true);
    this.currentId.set(attr.id);
    this.form.patchValue({
      key: attr.key,
      label: attr.label,
      dataType: attr.dataType,
      unit: attr.unit || '',
      isRequired: attr.isRequired,
      orderIndex: attr.orderIndex
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editMode.set(false);
    this.currentId.set(null);
    this.form.reset({ dataType: AttributeDataType.STRING, isRequired: false, orderIndex: 100 });
  }

    onSubmit() {
        if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
        }

        this.saving.set(true);
        const formValue = this.form.value;

        // 👇 Construimos el payload explícitamente con el tipo correcto
        const payload: any = {
        label: formValue.label,
        dataType: formValue.dataType,
        unit: formValue.unit || undefined,
        isRequired: formValue.isRequired,
        orderIndex: formValue.orderIndex,
        };

        if (this.editMode()) {
        // En edición, la clave (key) no se puede cambiar
        // No enviamos productTypeId
        } else {
        // En creación, añadimos la clave y el productTypeId
        payload.key = formValue.key;
        payload.productTypeId = this.typeId!;
        }

        const obs = this.currentId()
        ? this.attrsSvc.update(this.currentId()!, payload)
        : this.attrsSvc.create(payload);

        obs.subscribe({
        next: () => {
            this.notification.success(this.editMode() ? 'Atributo actualizado' : 'Atributo creado');
            this.cancelEdit();
            this.loadAttributes();
            this.saving.set(false);
        },
        error: (err) => {
            this.saving.set(false);
            this.notification.error(err?.error?.message || 'Error al guardar atributo');
        }
        });
    }

  deleteAttribute(attr: AttributeDefinition) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Atributo',
        message: `¿Seguro que deseas eliminar el atributo "${attr.label}"?`,
        confirmText: 'Eliminar',
        color: 'warn'
      }
    });

    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.attrsSvc.remove(attr.id).subscribe({
        next: () => {
          this.notification.success('Atributo eliminado');
          this.loadAttributes();
        },
        error: (err) => this.notification.error(err?.error?.message || 'No se pudo eliminar')
      });
    });
  }
}