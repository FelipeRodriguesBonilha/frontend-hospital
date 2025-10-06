import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    if (typeof window === 'undefined') return next(req);

    const authToken = localStorage.getItem('token');
    if (!authToken) return next(req);

    const authReq = req.clone({
        headers: req.headers.set('Authorization', authToken)
    });

    return next(authReq).pipe(
        catchError((error) => {
            if (error.status === 401) {
                const authService = inject(AuthService);
                const router = inject(Router);
                
                authService.logout();
                
                if (!router.url.includes('/login')) {
                    router.navigate(['/login']);
                }
            }
            
            return throwError(() => error);
        })
    );
};