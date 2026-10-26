import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatSlideToggleModule, FormsModule],
  template: `
    <div class="page">
      <h1 class="page-title">Configuración</h1>
      <mat-card class="settings-card">
        <mat-card-content>
          <h3>Preferencias de la aplicación</h3>
          
          <div class="setting-row">
            <div>
              <strong>Modo Oscuro</strong>
              <p>Cambia la apariencia de la interfaz</p>
            </div>
            <!-- Este toggle se conectará al header en el futuro -->
            <mat-slide-toggle [checked]="isDarkMode()" (change)="toggleDark($event.checked)"></mat-slide-toggle>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { max-width: 600px; margin: 0 auto; padding: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 24px; }
    .settings-card { border-radius: 12px !important; background: var(--bg-card) !important; }
    h3 { font-size: 16px; margin-bottom: 16px; }
    .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border); }
    .setting-row p { margin: 4px 0 0; font-size: 13px; color: var(--text-muted); }
  `]
})
export class SettingsComponent {
  isDarkMode = signal(localStorage.getItem('theme') === 'dark');

  toggleDark(value: boolean) {
    this.isDarkMode.set(value);
    if (value) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }
}