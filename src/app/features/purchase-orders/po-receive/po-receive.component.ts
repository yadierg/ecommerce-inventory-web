import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PurchaseOrder } from '../../../core/models/purchase-order.model';

@Component({
  selector: 'app-po-receive',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './po-receive.component.html',
  styleUrls: ['./po-receive.component.scss']
})
export class PoReceiveComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(PurchaseOrdersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);

  loading = signal(true);
  saving = signal(false);
  po = signal<PurchaseOrder | null>(null);
  public id: string | null = null;

  form = this.fb.group({
    items: this.fb.array([]),
    notes: ['']
  });

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (!this.id) {
      this.router.navigate(['/purchase-orders']);
      return;
    }
    this.loadOrder(this.id);
  }

  loadOrder(id: string) {
    this.svc.findOne(id).subscribe({
      next: (data) => {
        this.po.set(data);
        
        // Construir el formulario con los ítems pendientes de recibir
        this.items.clear();
        data.items.forEach(item => {
          const pending = item.quantity - (item.receivedQuantity || 0);
          this.items.push(this.fb.group({
            productId: [item.productId],
            quantity: [pending, [Validators.required, Validators.min(0), Validators.max(pending)]]
          }));
        });

        this.loading.set(false);
      },
      error: () => {
        this.notification.error('No se pudo cargar la orden');
        this.router.navigate(['/purchase-orders']);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid || !this.id) return;

    // 👈 Usamos this.form.getRawValue() y lo tipamos con any para evitar el error
    const formValue = this.form.getRawValue() as any;
    
    const receiveItems = (formValue.items || [])
      .filter((i: any) => i.quantity > 0)
      .map((i: any) => ({ productId: i.productId, quantity: i.quantity }));

    if (receiveItems.length === 0) {
      this.notification.warn('Debes recibir al menos 1 unidad');
      return;
    }

    this.saving.set(true);
    const payload = {
      items: receiveItems,
      notes: formValue.notes || undefined
    };

    this.svc.receive(this.id, payload).subscribe({
      next: () => {
        this.notification.success('Mercancía recibida y sumada al stock');
        this.router.navigate(['/purchase-orders', this.id]);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message || 'Error al recibir mercancía');
      }
    });
  }
}