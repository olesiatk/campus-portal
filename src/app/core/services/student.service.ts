import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly url = '/api/users';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.url).pipe(map((users) => users.filter((u) => u.role === 'student')));
  }

  getByDepartment(departmentId: number): Observable<User[]> {
    return this.getAll().pipe(
      map((students) => students.filter((s) => s.departmentId === departmentId))
    );
  }

  getByGroup(groupId: number): Observable<User[]> {
    return this.getAll().pipe(map((students) => students.filter((s) => s.groupId === groupId)));
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.url}/${id}`);
  }

  create(student: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.url, { ...student, role: 'student' });
  }

  update(student: User): Observable<User> {
    return this.http.put<User>(`${this.url}/${student.id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
