import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Department } from '../models';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly url = '/api/departments';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(this.url);
  }

  getById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.url}/${id}`);
  }

  create(department: Omit<Department, 'id'>): Observable<Department> {
    return this.http.post<Department>(this.url, department);
  }

  update(department: Department): Observable<Department> {
    return this.http.put<Department>(`${this.url}/${department.id}`, department);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
