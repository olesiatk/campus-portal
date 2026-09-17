import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Subject as SubjectModel } from '../models';

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private readonly url = '/api/subjects';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<SubjectModel[]> {
    return this.http.get<SubjectModel[]>(this.url);
  }

  getByDepartment(departmentId: number): Observable<SubjectModel[]> {
    return this.getAll().pipe(map((subjects) => subjects.filter((s) => s.departmentId === departmentId)));
  }

  getByStream(streamId: number): Observable<SubjectModel[]> {
    return this.getAll().pipe(map((subjects) => subjects.filter((s) => s.streamId === streamId)));
  }

  getByTeacher(teacherId: number): Observable<SubjectModel[]> {
    return this.getAll().pipe(map((subjects) => subjects.filter((s) => s.teacherId === teacherId)));
  }

  getByIds(ids: number[]): Observable<SubjectModel[]> {
    return this.getAll().pipe(map((subjects) => subjects.filter((s) => ids.includes(s.id))));
  }

  create(subject: Omit<SubjectModel, 'id'>): Observable<SubjectModel> {
    return this.http.post<SubjectModel>(this.url, subject);
  }

  update(subject: SubjectModel): Observable<SubjectModel> {
    return this.http.put<SubjectModel>(`${this.url}/${subject.id}`, subject);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
