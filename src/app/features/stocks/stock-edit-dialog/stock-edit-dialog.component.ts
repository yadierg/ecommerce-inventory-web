import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Stock } from '../../../core/models/stock.model';

@Component({
  selector: 'app-stock-edit-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule
  ],
  templateUrl: './stock-edit-dialog.component.html',
  styleUrls: ['./stock-edit-dialog.component.scss']
})
export class StockEditDialogComponent implements OnInit {
  form!: FormGroup; // 👈 Se inicializa en ngOnInit

  constructor(
    private fb: FormBuilder,
    public ref: MatDialogRef<StockEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { stock: Stock }
  ) {}

  ngOnInit() {
    // 👈 Inicializamos el form aquí, cuando this.data ya existe
    this.form = this.fb.group({
      minStock: [this.data.stock.minStock || 0, [Validators.required, Validators.min(0)]],
      maxStock: [this.data.stock.maxStock || null],
      location: [this.data.stock.location || '']
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.ref.close(this.form.value);
  }
}