import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MaterialsService } from '../../../core/services/materials.service';
import { PriceHistoryService } from '../../../core/services/price-history.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Material, PriceHistory, PriceHistoryStats } from '../../../core/models/materials.models';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-material-prices',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, DecimalPipe, MatCardModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatTableModule,
    MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule, MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './material-prices.component.html',
  styleUrls: ['./material-prices.component.scss']
})
export class MaterialPricesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private materialsSvc = inject(MaterialsService);
  private pricesSvc = inject(PriceHistoryService);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  materialId: string | null = null;
  material = signal<Material | null>(null);
  prices = signal<PriceHistory[]>([]);
  stats = signal<PriceHistoryStats | null>(null);
  
  loading = signal(true);
  saving = signal(false);

  columns = ['date', 'supplier', 'quantity', 'unitCost', 'total', 'actions'];

  form = this.fb.group({
    unitCost: [0, [Validators.required, Validators.min(0.01)]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    purchaseDate: [new Date(), Validators.required],
    supplierId: [null as string | null],
    notes: ['']
  });

  ngOnInit() {
    this.materialId = this.route.snapshot.paramMap.get('id');
    if (!this.materialId) {
      this.router.navigate(['/materials']);
      return;
    }

    this.materialsSvc.findOne(this.materialId).subscribe(data => this.material.set(data));
    this.loadData();
  }

  loadData() {
    if (!this.materialId) return;
    this.loading.set(true);

    this.pricesSvc.findByMaterial(this.materialId).subscribe(prices => {
      this.prices.set(prices);
      
      this.pricesSvc.getStats(this.materialId!).subscribe(stats => {
        this.stats.set(stats);
        this.loading.set(false);
      });
    });
  }

  onSubmit() {
    if (this.form.invalid || !this.materialId) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.form.value;

    const payload = {
      materialId: this.materialId,
      unitCost: Number(formValue.unitCost),
      quantity: Number(formValue.quantity),
      purchaseDate: formValue.purchaseDate?.toISOString().split('T')[0]!,
      supplierId: formValue.supplierId || undefined,
      notes: formValue.notes || undefined
    };

    this.pricesSvc.create(payload).subscribe({
      next: () => {
        this.notification.success('Compra registrada. Costo promedio actualizado.');
        this.form.reset({ unitCost: 0, quantity: 1, purchaseDate: new Date() });
        this.loadData();
        
        // Recargamos el material para ver el nuevo averageCost
        this.materialsSvc.findOne(this.materialId!).subscribe(data => this.material.set(data));
        
        this.saving.set(false);
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message || 'Error al registrar la compra');
      }
    });
  }

  deletePrice(price: PriceHistory) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Registro de Precio',
        message: '¿Seguro que deseas eliminar este registro? El costo promedio se recalculará.',
        confirmText: 'Eliminar',
        color: 'warn'
      }
    });

    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.pricesSvc.remove(price.id).subscribe({
        next: () => {
          this.notification.success('Registro eliminado');
          this.loadData();
          this.materialsSvc.findOne(this.materialId!).subscribe(data => this.material.set(data));
        },
        error: (err) => this.notification.error(err?.error?.message || 'No se pudo eliminar')
      });
    });
  }
}