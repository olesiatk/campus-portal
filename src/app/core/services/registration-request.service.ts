import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PendingRequest, User } from '../models';

@Injectable({ providedIn: 'root' })
export class RegistrationRequestService {
  private readonly url = '/api/pendingRequests';
  private readonly usersUrl = '/api/users';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<PendingRequest[]> {
    return this.http.get<PendingRequest[]>(this.url);
  }

  getPending(): Observable<PendingRequest[]> {
    return this.getAll().pipe(map((requests) => requests.filter((r) => r.status === 'pending')));
  }

  submit(request: Omit<PendingRequest, 'id' | 'status' | 'requestedAt'>): Observable<PendingRequest> {
    const payload: Omit<PendingRequest, 'id'> = {
      ...request,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    return this.http.post<PendingRequest>(this.url, payload);
  }

  /**
   * Approves a request and assigns a password.
   * - If the request claims an existing person (targetUserId set), just updates that user's password.
   * - Otherwise creates a brand-new user (student sign-up) with the chosen password.
   */
  approve(request: PendingRequest, password: string): Observable<User> {
    const userUpdate$: Observable<User> = request.targetUserId
      ? this.http.get<User>(`${this.usersUrl}/${request.targetUserId}`).pipe(
          switchMap((existing) => this.http.put<User>(`${this.usersUrl}/${existing.id}`, { ...existing, password }))
        )
      : this.http.post<User>(this.usersUrl, {
          role: request.role,
          firstName: request.firstName,
          lastName: request.lastName,
          email: request.email,
          phone: request.phone ?? '',
          password,
          departmentId: request.departmentId,
          streamId: request.streamId,
          groupId: request.groupId,
          subgroup: null,
          electiveSubjectIds: [],
        });

    return userUpdate$.pipe(
      switchMap((user) =>
        this.http
          .put<PendingRequest>(`${this.url}/${request.id}`, { ...request, status: 'approved' })
          .pipe(map(() => user))
      )
    );
  }

  reject(request: PendingRequest): Observable<PendingRequest> {
    return this.http.put<PendingRequest>(`${this.url}/${request.id}`, { ...request, status: 'rejected' });
  }
}
