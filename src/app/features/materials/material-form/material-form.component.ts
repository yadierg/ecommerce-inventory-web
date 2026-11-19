import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { CategoriesService } from '../../../core/services/categories.service';
import { UnitsOfMeasureService, UnitOfMeasure } from '../../../core/services/units-of-measure.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductType, AttributeDefinition, Category } from '../../../core/models/materials.models';

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
  private categoriesSvc = inject(CategoriesService);
  private unitsSvc = inject(UnitsOfMeasureService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);

  isEdit = signal(false);
  loading = signal(true);
  saving = signal(false);
  private id: string | null = null;

  // 👇 Guardamos los atributos actuales del material para reutilizarlos sin re-fetch
  private currentAttributes: any[] = [];

  productTypes = signal<ProductType[]>([]);
  categories = signal<Category[]>([]);
  unitsOfMeasure = signal<UnitOfMeasure[]>([]);
  attributeDefinitions = signal<AttributeDefinition[]>([]);

  form = this.fb.group({
    sku: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    categoryId: [null as string | null],
    productTypeId: ['', Validators.required],
    unitOfMeasureId: ['', Validators.required],
    unitCost: [0],
    minStock: [0],
    maxStock: [null as number | null],
    reorderPoint: [0],
    brand: [''],
    isActive: [true],
    isConsumable: [true],
    isPurchasable: [true],
    attributes: this.fb.array([])
  });

  get attributes(): FormArray {
    return this.form.get('attributes') as FormArray;
  }

  ngOnInit() {
    this.typesSvc.findActive().subscribe(data => this.productTypes.set(data));
    this.categoriesSvc.findAll().subscribe(data => this.categories.set(data));
    this.unitsSvc.findActive().subscribe(data => this.unitsOfMeasure.set(data));

    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.isEdit.set(true);
      this.loadMaterial(this.id);
    } else {
      this.loading.set(false);
    }

    this.form.get('productTypeId')?.valueChanges.subscribe(typeId => {
      if (typeId) {
        this.onProductTypeChange(typeId);
      }
    });
  }

  loadMaterial(id: string) {
    this.materialsSvc.findOne(id).subscribe({
      next: (material) => {
        // 👇 Guardamos atributos para reusar en onProductTypeChange
        this.currentAttributes = material.attributes ?? [];

        this.form.patchValue({
          sku: material.sku,
          name: material.name,
          description: material.description || '',
          categoryId: material.categoryId || null,
          productTypeId: material.productTypeId || '',
          unitOfMeasureId: material.unitOfMeasureId || '',
          unitCost: Number(material.unitCost),
          minStock: material.minStock,
          maxStock: material.maxStock || null,
          reorderPoint: material.reorderPoint,
          brand: material.brand || '',
          isActive: material.isActive,
          isConsumable: material.isConsumable,
          isPurchasable: material.isPurchasable
        });
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('No se pudo cargar el material');
        this.router.navigate(['/materials']);
      }
    });
  }

  onProductTypeChange(productTypeId: string) {
    this.attrsSvc.findByProductType(productTypeId).subscribe(defs => {
      this.attributeDefinitions.set(defs);
      // 👇 Usamos los atributos ya cargados (o [] si es creación)
      this.buildAttributesForm(defs, this.currentAttributes);
    });
  }

  buildAttributesForm(defs: AttributeDefinition[], currentValues: any[] = []) {
    this.attributes.clear();
    defs.forEach(def => {
      const existing = currentValues.find(a => a.attributeKey === def.key);

      this.attributes.push(this.fb.group({
        attributeKey: [def.key],
        attributeLabel: [def.label],
        attributeType: [def.dataType],
        unit: [def.unit],
        enumValues: [def.enumValues ?? []],   // 👈 NUEVO: opciones del enum
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
      categoryId: formValue.categoryId || undefined,
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