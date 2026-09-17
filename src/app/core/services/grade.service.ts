import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Grade } from '../models';

@Injectable({ providedIn: 'root' })
export class GradeService {
  private readonly url = '/api/grades';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Grade[]> {
    return this.http.get<Grade[]>(this.url);
  }

  getByStudent(studentId: number): Observable<Grade[]> {
    return this.getAll().pipe(map((grades) => grades.filter((g) => g.studentId === studentId)));
  }

  getByTeacher(teacherId: number): Observable<Grade[]> {
    return this.getAll().pipe(map((grades) => grades.filter((g) => g.teacherId === teacherId)));
  }

  getByStudentIds(studentIds: number[]): Observable<Grade[]> {
    return this.getAll().pipe(map((grades) => grades.filter((g) => studentIds.includes(g.studentId))));
  }

  addGrade(grade: Omit<Grade, 'id'>): Observable<Grade> {
    return this.http.post<Grade>(this.url, grade);
  }
}
