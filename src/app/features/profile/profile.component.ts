import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <div class="page">
      <h1 class="page-title">Mi Perfil</h1>
      <mat-card class="profile-card">
        <mat-card-content>
          <div class="avatar-large">{{ initials() }}</div>
          <h2>{{ user?.name }}</h2>
          <p class="email">{{ user?.email }}</p>
          <div class="role-badge">{{ user?.role }}</div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { max-width: 600px; margin: 0 auto; padding: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 24px; }
    .profile-card { text-align: center; padding: 32px; border-radius: 12px !important; background: var(--bg-card) !important; }
    .avatar-large { width: 80px; height: 80px; border-radius: 20px; background: linear-gradient(135deg, var(--brand-red), #a00d38); color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; margin: 0 auto 16px; }
    h2 { margin: 0 0 4px; font-size: 20px; color: var(--text-primary); }
    .email { color: var(--text-secondary); margin: 0 0 16px; }
    .role-badge { display: inline-block; padding: 4px 12px; background: var(--bg-app); border-radius: 20px; font-size: 12px; font-weight: 600; color: var(--brand-red); text-transform: uppercase; }
  `]
})
export class ProfileComponent {
  private authService = inject(AuthService);
  user = this.authService.getUser();

  initials(): string {
    const name = this.user?.name || 'U';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  }
}