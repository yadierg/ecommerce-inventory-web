import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // 1. Intentamos obtener del localStorage (ya saneado en el AuthService)
  // 2. Si no hay, usamos el del environment por defecto
  const tenantId = authService.getTenantId() || environment.tenantId;

  // 3. Validación final extrema
  if (tenantId && tenantId !== 'undefined' && tenantId !== 'null') {
    req = req.clone({
      setHeaders: { 'x-tenant-id': tenantId },
    });
  } else {
    console.warn('⚠️ ALERTA: No se pudo resolver un tenantId válido para la petición a:', req.url);
  }

  return next(req);
};