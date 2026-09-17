import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';

import { Role } from '../models';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const allowedRoles = route.data['roles'] as Role[] | undefined;
    const user = this.auth.currentUser;

    if (!user) {
      return this.router.createUrlTree(['/login']);
    }
    if (!allowedRoles || allowedRoles.includes(user.role)) {
      return true;
    }
    return this.router.createUrlTree(['/login']);
  }
}
