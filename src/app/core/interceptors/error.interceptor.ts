import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { RefreshResponse } from '../models/auth.model';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse): Observable<HttpEvent<unknown>> => {
      // 401 → intentar refresh (excepto si es login/refresh mismo)
      if (
        error.status === 401 &&
        !req.url.includes('/admin/auth/login') &&
        !req.url.includes('/admin/auth/refresh')
      ) {
        return handle401(req, next, authService, notification);
      }

      if (error.status === 403) {
        notification.error('No tienes permiso para esta acción');
      } else if (error.status === 500) {
        notification.error('Error del servidor');
      } else if (error.error?.message) {
        notification.error(error.error.message);
      }

      return throwError(() => error);
    }),
  );
};

function handle401(
  req: HttpRequest<unknown>,
  next: (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>,
  authService: AuthService,
  notification: NotificationService,
): Observable<HttpEvent<unknown>> {
  // Si ya se está refrescando, espera a que termine y reintenta con el nuevo token
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) =>
        next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })),
      ),
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  const refresh$ = authService.refresh();
  if (!refresh$) {
    isRefreshing = false;
    authService.logout();
    notification.error('Sesión expirada. Inicia sesión de nuevo.');
    return throwError(() => new Error('No refresh token'));
  }

  return refresh$.pipe(
    switchMap((res: RefreshResponse) => {
      isRefreshing = false;
      refreshTokenSubject.next(res.accessToken);
      return next(
        req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } }),
      );
    }),
    catchError((err) => {
      isRefreshing = false;
      authService.logout();
      notification.error('Sesión expirada. Inicia sesión de nuevo.');
      return throwError(() => err);
    }),
  );
}