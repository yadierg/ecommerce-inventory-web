import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PurchaseOrder, PurchaseOrderStatus } from '../../../core/models/purchase-order.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-po-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTableModule,
    MatDialogModule,
    NgClass,
  ],
  templateUrl: './po-detail.component.html',
  styleUrls: ['./po-detail.component.scss']
})
export class PoDetailComponent implements OnInit {
  private svc = inject(PurchaseOrdersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);

  loading = signal(true);
  po = signal<PurchaseOrder | null>(null);
  columns = ['product', 'qty', 'received', 'price', 'total'];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/purchase-orders']);
      return;
    }
    this.loadOrder(id);
  }

  loadOrder(id: string) {
    this.loading.set(true);
    this.svc.findOne(id).subscribe({
      next: (data) => {
        this.po.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('No se pudo cargar la orden');
        this.router.navigate(['/purchase-orders']);
      }
    });
  }

  getStatusLabel(status: PurchaseOrderStatus): string {
    const labels: Record<PurchaseOrderStatus, string> = {
      draft: 'Borrador', sent: 'Enviada', confirmed: 'Confirmada',
      partially_received: 'Parcial', received: 'Recibida', cancelled: 'Cancelada'
    };
    return labels[status] || status;
  }

  changeStatus(newStatus: PurchaseOrderStatus, confirmMsg: string) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Cambiar Estado', message: confirmMsg, confirmText: 'Sí, continuar', color: 'primary' }
    });

    ref.afterClosed().subscribe(ok => {
      if (!ok || !this.po()) return;
      this.svc.changeStatus(this.po()!.id, newStatus).subscribe({
        next: () => {
          this.notification.success('Estado actualizado');
          this.loadOrder(this.po()!.id);
        },
        error: (err) => this.notification.error(err?.error?.message || 'Error al cambiar estado')
      });
    });
  }

  deleteOrder() {
    if (!this.po()) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar Orden', message: '¿Eliminar esta orden en borrador?', confirmText: 'Eliminar', color: 'warn' }
    });

    ref.afterClosed().subscribe(ok => {
      if (!ok || !this.po()) return;
      this.svc.remove(this.po()!.id).subscribe({
        next: () => {
          this.notification.success('Orden eliminada');
          this.router.navigate(['/purchase-orders']);
        }
      });
    });
  }
}