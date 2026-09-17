import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { User } from '../models';

const SESSION_KEY = 'pm_session_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSubject: BehaviorSubject<User | null>;
  public readonly currentUser$: Observable<User | null>;

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.readSession());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  login(email: string, password: string): Observable<User> {
    // Note: the mock backend's naive URL parser breaks on "@" in query params
    // (it misreads it as URL userinfo), so email lookup must filter client-side
    // rather than via `{ params: { email } }`.
    return this.http.get<User[]>('/api/users').pipe(
      map((users) => {
        const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user || user.password !== password) {
          throw new Error('Неправильний email або пароль');
        }
        return user;
      }),
      tap((user) => this.setSession(user))
    );
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private setSession(user: User): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private readSession(): User | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
