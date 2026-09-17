import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private readonly url = '/api/users';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.url).pipe(map((users) => users.filter((u) => u.role === 'teacher')));
  }

  getByDepartment(departmentId: number): Observable<User[]> {
    return this.getAll().pipe(map((teachers) => teachers.filter((t) => t.departmentId === departmentId)));
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.url}/${id}`);
  }

  create(teacher: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.url, { ...teacher, role: 'teacher' });
  }

  update(teacher: User): Observable<User> {
    return this.http.put<User>(`${this.url}/${teacher.id}`, teacher);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
