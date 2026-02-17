import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { TokenService } from "src/app/core/service/token.service";

export const AuthGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const token = tokenService.getToken();

  // Verifica si el token existe (no verifica expiración)
  if (token && token.length > 0) {
    return true;
  }
  router.navigate(["/auth/login"]);
  return false;
};
