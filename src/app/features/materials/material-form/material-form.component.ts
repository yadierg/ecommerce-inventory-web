import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
//import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { MaterialsService } from '../../../core/services/materials.service';
import { ProductTypesService } from '../../../core/services/product-types.service';
import { AttributeDefinitionsService } from '../../../core/services/attribute-definitions.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductType, AttributeDefinition, AttributeDataType } from '../../../core/models/materials.models';

@Component({
  selector: 'app-material-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSlideToggleModule,
    MatProgressSpinnerModule, MatDividerModule
  ],
  templateUrl: './material-form.component.html',
  styleUrls: ['./material-form.component.scss']
})
export class MaterialFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private materialsSvc = inject(MaterialsService);
  private typesSvc = inject(ProductTypesService);
  private attrsSvc = inject(AttributeDefinitionsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);

  isEdit = signal(false);
  loading = signal(true);
  saving = signal(false);
  private id: string | null = null;

  productTypes = signal<ProductType[]>([]);
  attributeDefinitions = signal<AttributeDefinition[]>([]);

  form = this.fb.group({
    sku: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    productTypeId: ['', Validators.required],
    unitOfMeasureId: ['d15e484b-20ac-4396-a8f5-28eb565b044e', Validators.required], // Default: Metro (o el que uses)
    unitCost: [0],
    minStock: [0],
    maxStock: [null as number | null],
    reorderPoint: [0],
    brand: [''],
    isActive: [true],
    isConsumable: [true],
    isPurchasable: [true],
    attributes: this.fb.array([]) // 👈 FormArray dinámico
  });

  get attributes(): FormArray {
    return this.form.get('attributes') as FormArray;
  }

  ngOnInit() {
    this.typesSvc.findActive().subscribe(data => {
      this.productTypes.set(data);
      
      this.id = this.route.snapshot.paramMap.get('id');
      if (this.id) {
        this.isEdit.set(true);
        this.loadMaterial(this.id);
      } else {
        this.loading.set(false);
      }
    });

    // Escuchar cambios en el tipo de producto para cargar atributos
    this.form.get('productTypeId')?.valueChanges.subscribe(typeId => {
      if (typeId) {
        this.onProductTypeChange(typeId);
      }
    });
  }

  loadMaterial(id: string) {
    this.materialsSvc.findOne(id).subscribe({
      next: (material) => {
        this.form.patchValue({
          sku: material.sku,
          name: material.name,
          description: material.description || '',
          productTypeId: material.productTypeId || '',
          unitOfMeasureId: material.unitOfMeasureId,
          unitCost: Number(material.unitCost),
          minStock: material.minStock,
          maxStock: material.maxStock || null,
          reorderPoint: material.reorderPoint,
          brand: material.brand || '',
          isActive: material.isActive,
          isConsumable: material.isConsumable,
          isPurchasable: material.isPurchasable
        });
        // Los atributos se cargan en onProductTypeChange
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('No se pudo cargar el material');
        this.router.navigate(['/materials']);
      }
    });
  }

  onProductTypeChange(productTypeId: string) {
    // 1. Obtenemos las definiciones (la estructura)
    this.attrsSvc.findByProductType(productTypeId).subscribe(defs => {
      this.attributeDefinitions.set(defs);
      
      // 2. Si estamos editando, tenemos que mezclar los valores actuales
      if (this.isEdit() && this.id) {
        this.materialsSvc.findOne(this.id).subscribe(mat => {
          this.buildAttributesForm(defs, mat.attributes);
        });
      } else {
        this.buildAttributesForm(defs, []);
      }
    });
  }

  buildAttributesForm(defs: AttributeDefinition[], currentValues: any[] = []) {
    this.attributes.clear();
    defs.forEach(def => {
      // Buscamos si el material ya tiene un valor para este atributo
      const existing = currentValues.find(a => a.attributeKey === def.key);
      
      this.attributes.push(this.fb.group({
        attributeKey: [def.key],
        attributeLabel: [def.label],
        attributeType: [def.dataType],
        unit: [def.unit],
        attributeValue: [existing ? existing.attributeValue : ''],
        isRequired: [def.isRequired]
      }));
    });
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
      sku: formValue.sku,
      name: formValue.name,
      description: formValue.description,
      productTypeId: formValue.productTypeId,
      unitOfMeasureId: formValue.unitOfMeasureId,
      unitCost: formValue.unitCost,
      minStock: formValue.minStock,
      maxStock: formValue.maxStock,
      reorderPoint: formValue.reorderPoint,
      brand: formValue.brand,
      isActive: formValue.isActive,
      isConsumable: formValue.isConsumable,
      isPurchasable: formValue.isPurchasable,
      // Mapeamos los atributos al formato que espera el backend
      attributes: (formValue.attributes || []).map((a: any) => ({
        attributeKey: a.attributeKey,
        attributeLabel: a.attributeLabel,
        attributeValue: String(a.attributeValue || ''),
        attributeType: a.attributeType,
        unit: a.unit
      }))
    };

    const obs = this.id 
      ? this.materialsSvc.update(this.id, payload)
      : this.materialsSvc.create(payload);

    obs.subscribe({
      next: () => {
        this.notification.success(this.id ? 'Material actualizado' : 'Material creado');
        this.router.navigate(['/materials']);
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message || 'Error al guardar material');
      }
    });
  }
}