import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    if (typeof window === 'undefined') return next(req);

    const authToken = localStorage.getItem('token');
    if (!authToken) return next(req);

    const authReq = req.clone({
        headers: req.headers.set('Authorization', authToken)
    });

    return next(authReq);
};