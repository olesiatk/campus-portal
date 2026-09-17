import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class DeanService {
  private readonly url = '/api/users';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.url).pipe(map((users) => users.filter((u) => u.role === 'dean')));
  }

  getByDepartment(departmentId: number): Observable<User[]> {
    return this.getAll().pipe(map((deans) => deans.filter((d) => d.departmentId === departmentId)));
  }
}
