import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Login y refresh van SIN token (usan header x-tenant-id pero no Bearer)
  const isAuthEndpoint =
    req.url.includes('/admin/auth/login') ||
    req.url.includes('/admin/auth/refresh');

  if (isAuthEndpoint) return next(req);

  const token = authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};