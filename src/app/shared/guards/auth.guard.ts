import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'src/app/core/service/auth.service';

export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);

  if (authService.canActivate()) {
    return true;
  }

  authService.redirectIfUnauthenticated();

  return false;
};
