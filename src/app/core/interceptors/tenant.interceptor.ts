import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tenantId = authService.getTenantId() || environment.tenantId;

  if (tenantId) {
    req = req.clone({
      setHeaders: { 'x-tenant-id': tenantId },
    });
  }

  return next(req);
};