import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { TokenService } from "src/app/core/service/token.service";

export const AppGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  console.log("🚀 AppGuard ejecutándose");
  console.log("Ruta actual:", state.url);
  console.log("Token:", tokenService.getToken());
  console.log("isLoggedIn:", tokenService.isLoggedIn());

  const token = tokenService.getToken();

  if (token && token.length > 0) {
    console.log("⚠️ AppGuard: Hay token, bloqueando acceso a /auth");
    return false;
  }

  console.log("✅ AppGuard: Permitido acceder a /auth");
  return true;
};
