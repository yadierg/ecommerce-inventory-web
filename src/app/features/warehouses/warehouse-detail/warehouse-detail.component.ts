import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Warehouse } from '../../../core/models/warehouse.model';

@Component({
  selector: 'app-warehouse-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    DecimalPipe,
  ],
  templateUrl: './warehouse-detail.component.html',
  styleUrls: ['./warehouse-detail.component.scss']
})
export class WarehouseDetailComponent implements OnInit {
  private svc = inject(WarehousesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);

  loading = signal(true);
  warehouse = signal<Warehouse | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/warehouses']);
      return;
    }
    this.svc.findOne(id).subscribe({
      next: (w) => {
        this.warehouse.set(w);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('No se pudo cargar el almacén');
        this.router.navigate(['/warehouses']);
      },
    });
  }
}