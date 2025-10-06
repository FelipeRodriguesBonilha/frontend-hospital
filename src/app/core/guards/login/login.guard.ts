import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Role } from '../../enums/role.enum';
import { AuthService } from '../../services/auth/auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  const user = authService.getCurrentUser();
  const userRole = user?.role?.name as Role | undefined;

  if (!user || !userRole) {
    authService.logout();
    return true;
  }

  return redirectByRole(userRole, router);
};

function redirectByRole(role: Role, router: Router): UrlTree {
  switch (role) {
    case Role.AdministradorGeral:
      return router.parseUrl('/hospitals');
    case Role.AdministradorHospital:
    case Role.Medico:
    case Role.Recepcionista:
      return router.parseUrl('/chat');
    default:
      return router.parseUrl('/login');
  }
}
