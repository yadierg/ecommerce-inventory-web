import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-warehouse-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './warehouse-form.component.html',
  styleUrls: ['./warehouse-form.component.scss']
})
export class WarehouseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(WarehousesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);

  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  private id: string | null = null;

  form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    address: [''],
    city: [''],
    state: [''],
    postalCode: [''],
    country: [''],
    capacity: [null as number | null],
    managerName: [''],
    phone: [''],
    email: ['', Validators.email],
    isActive: [true],
    isDefault: [false],
    notes: [''],
  });

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.isEdit.set(true);
      this.loading.set(true);
      this.svc.findOne(this.id).subscribe({
        next: (w) => {
          this.form.patchValue({
            code: w.code,
            name: w.name,
            description: w.description ?? '',
            address: w.address ?? '',
            city: w.city ?? '',
            state: w.state ?? '',
            postalCode: w.postalCode ?? '',
            country: w.country ?? '',
            capacity: w.capacity ?? null,
            managerName: w.managerName ?? '',
            phone: w.phone ?? '',
            email: w.email ?? '',
            isActive: w.isActive,
            isDefault: w.isDefault,
            notes: w.notes ?? '',
          });
          this.loading.set(false);
        },
        error: () => {
          this.notification.error('No se pudo cargar el almacén');
          this.router.navigate(['/warehouses']);
        },
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const payload = this.form.value as any;
    if (payload.capacity === null || payload.capacity === '') delete payload.capacity;

    const obs = this.id
      ? this.svc.update(this.id, payload)
      : this.svc.create(payload);

    obs.subscribe({
      next: () => {
        this.notification.success(this.id ? 'Almacén actualizado' : 'Almacén creado');
        this.router.navigate(['/warehouses']);
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message || 'Error al guardar el almacén');
      },
    });
  }
}