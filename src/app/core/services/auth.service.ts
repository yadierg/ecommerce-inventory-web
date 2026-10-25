import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginResponse, RefreshResponse, User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUser = signal<User | null>(null);
  private permissions = signal<string[]>([]);

  readonly user = this.currentUser.asReadonly();
  readonly userPermissions = this.permissions.asReadonly();

  constructor() {
    const user = localStorage.getItem('user');
    const permissions = localStorage.getItem('permissions');
    if (user) this.currentUser.set(JSON.parse(user));
    if (permissions) this.permissions.set(JSON.parse(permissions));
  }

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/admin/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => this.persistSession(response)),
      );
  }

  refresh() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;
    return this.http
      .post<RefreshResponse>(`${environment.apiUrl}/admin/auth/refresh`, {
        refreshToken,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('access_token', response.accessToken);
          if (response.refreshToken) {
            localStorage.setItem('refresh_token', response.refreshToken);
          }
        }),
      );
  }

  private persistSession(response: LoginResponse) {
    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('permissions', JSON.stringify(response.permissions));
    localStorage.setItem('tenant_id', response.user.tenantId);
    this.currentUser.set(response.user);
    this.permissions.set(response.permissions);
  }

  logout() {
    localStorage.clear();
    this.currentUser.set(null);
    this.permissions.set([]);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  getTenantId(): string | null {
    return localStorage.getItem('tenant_id');
  }

  getUser(): User | null {
    return this.currentUser();
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.roles?.includes(role) ?? false;
  }
}