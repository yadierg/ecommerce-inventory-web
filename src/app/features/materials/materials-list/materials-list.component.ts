import { Component, inject, OnInit, signal, ViewChild, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MaterialsService } from '../../../core/services/materials.service';
import { ProductTypesService } from '../../../core/services/product-types.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Material, ProductType } from '../../../core/models/materials.models';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-materials-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgClass,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatDialogModule,
    CurrencyPipe,
    DecimalPipe,
  ],
  templateUrl: './materials-list.component.html',
  styleUrls: ['./materials-list.component.scss']
})
export class MaterialsListComponent implements OnInit {
  private materialsSvc = inject(MaterialsService);
  private productTypesSvc = inject(ProductTypesService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading = signal(true);
  
  // 👇 Usamos un signal para los materiales
  materials = signal<Material[]>([]);
  productTypes = signal<ProductType[]>([]);

  // Filtros
  searchQuery = signal('');
  typeFilter = signal<string | null>(null);

  // 👇 Lista filtrada basada en el signal de materiales
  filteredMaterials = computed(() => {
    let result = this.materials(); // 👈 Leemos el signal
    const query = this.searchQuery().toLowerCase();
    const typeId = this.typeFilter();

    if (query) {
      result = result.filter(m => 
        m.name.toLowerCase().includes(query) || 
        m.sku.toLowerCase().includes(query)
      );
    }
    if (typeId) {
      result = result.filter(m => m.productTypeId === typeId);
    }
    return result;
  });

  columns = ['sku', 'name', 'type', 'avgCost', 'stock', 'status', 'actions'];

  ngOnInit() {
    this.loadMaterialTypes();
    this.load();
  }

  loadMaterialTypes() {
    this.productTypesSvc.findActive().subscribe(data => this.productTypes.set(data));
  }

  load() {
    this.loading.set(true);
    this.materialsSvc.findAll({ limit: 1000 }).subscribe({
      next: (res) => {
        // 👇 Seteamos el signal con los datos
        this.materials.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.notification.error('Error al cargar materiales');
        this.loading.set(false);
      }
    });
  }

  clearFilters() {
    this.searchQuery.set('');
    this.typeFilter.set(null);
  }

  deleteMaterial(material: Material) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Material',
        message: `¿Seguro que deseas eliminar "${material.name}"?`,
        confirmText: 'Eliminar',
        color: 'warn'
      }
    });

    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      
      this.materialsSvc.remove(material.id).subscribe({
        next: () => {
          this.notification.success('Material eliminado');
          
          // 👇 LA MAGIA: Actualizamos el signal filtrando el material eliminado
          this.materials.update(list => list.filter(m => m.id !== material.id));
        },
        error: (err) => {
          this.notification.error(err?.error?.message || 'Error al eliminar');
        }
      });
    });
  }
}