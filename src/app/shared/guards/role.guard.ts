import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const roleType = localStorage.getItem('role_type');
  const expectedRoles = route.data['roles'] as Array<string>;

  if (roleType && expectedRoles && expectedRoles.includes(roleType.toLowerCase())) {
    return true;
  }

  // Redirigir a la lista de proyectos si no tiene los permisos necesarios (evitando entrada a update/crear tarea)
  router.navigate(['/project-management/projects/list']); 
  return false;
};
