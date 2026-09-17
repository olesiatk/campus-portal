import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from './core/services/auth.service';
import { Role, User } from './core/models';

const HOME_BY_ROLE: Record<Role, string> = {
  admin: '/admin',
  teacher: '/teacher',
  dean: '/dean',
  student: '/student',
};

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  currentUser$: Observable<User | null>;

  constructor(private readonly auth: AuthService) {
    this.currentUser$ = this.auth.currentUser$;
  }

  logout(): void {
    this.auth.logout();
  }

  homeLink(role: Role): string {
    return HOME_BY_ROLE[role];
  }
}
