import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';

import { StocksService } from '../../../core/services/stocks.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Stock } from '../../../core/models/stock.model';

@Component({
  selector: 'app-stock-adjust',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DecimalPipe, 
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatRadioModule,
  ],
  templateUrl: './stock-adjust.component.html',
  styleUrls: ['./stock-adjust.component.scss']
})
export class StockAdjustComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(StocksService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);

  loading = signal(true);
  saving = signal(false);
  stock = signal<Stock | null>(null);
  stockId: string | null = null;

  form = this.fb.group({
    type: ['add', Validators.required], // add = entrada, remove = salida
    quantity: [null as number | null, [Validators.required, Validators.min(1)]],
    reason: ['', Validators.required],
    notes: [''],
  });

  ngOnInit() {
    this.stockId = this.route.snapshot.paramMap.get('id');
    if (!this.stockId) {
      this.router.navigate(['/stocks']);
      return;
    }

    this.svc.findOne(this.stockId).subscribe({
      next: (s) => {
        this.stock.set(s);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('No se pudo cargar el stock');
        this.router.navigate(['/stocks']);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid || !this.stockId) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.form.value;
    
    // Si es remove, la cantidad va en negativo
    const finalQuantity = formValue.type === 'remove' 
      ? -(formValue.quantity as number) 
      : (formValue.quantity as number);

    const payload = {
      quantity: finalQuantity,
      reason: formValue.reason as string,
      notes: formValue.notes || undefined
    };

    this.svc.adjust(this.stockId, payload).subscribe({
      next: () => {
        this.notification.success('Stock ajustado correctamente');
        this.router.navigate(['/stocks']);
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message || 'Error al ajustar el stock');
      }
    });
  }
}