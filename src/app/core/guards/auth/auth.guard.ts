import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { Role } from '../../enums/role.enum';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateChildFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  const user = authService.getCurrentUser();
  
  if (!user) {
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  const userRole = user?.role?.name as Role | undefined;
  const required = route.data?.['roles'] as Role[] | undefined;

  if (required?.length && (!userRole || !required.includes(userRole))) {
    return router.createUrlTree(['/unauthorized']);
  }

  return true;
};