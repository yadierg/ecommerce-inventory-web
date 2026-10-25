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

import { SuppliersService } from '../../../core/services/suppliers.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-supplier-form',
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
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.scss']
})
export class SupplierFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(SuppliersService);
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
    contactName: [''],
    email: ['', Validators.email],
    phone: [''],
    address: [''],
    city: [''],
    state: [''],
    country: [''],
    taxId: [''],
    paymentTerms: [''],
    notes: [''],
    isActive: [true],
  });

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.isEdit.set(true);
      this.loading.set(true);
      this.svc.findOne(this.id).subscribe({
        next: (s) => {
          this.form.patchValue({
            code: s.code,
            name: s.name,
            contactName: s.contactName ?? '',
            email: s.email ?? '',
            phone: s.phone ?? '',
            address: s.address ?? '',
            city: s.city ?? '',
            state: s.state ?? '',
            country: s.country ?? '',
            taxId: s.taxId ?? '',
            paymentTerms: s.paymentTerms ?? '',
            notes: s.notes ?? '',
            isActive: s.isActive,
          });
          this.loading.set(false);
        },
        error: () => {
          this.notification.error('No se pudo cargar el proveedor');
          this.router.navigate(['/suppliers']);
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

    const obs = this.id
      ? this.svc.update(this.id, payload)
      : this.svc.create(payload);

    obs.subscribe({
      next: () => {
        this.notification.success(this.id ? 'Proveedor actualizado' : 'Proveedor creado');
        this.router.navigate(['/suppliers']);
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message || 'Error al guardar el proveedor');
      },
    });
  }
}