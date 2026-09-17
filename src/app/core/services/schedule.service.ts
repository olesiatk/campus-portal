import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ScheduleEntry, User } from '../models';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly url = '/api/scheduleEntries';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ScheduleEntry[]> {
    return this.http.get<ScheduleEntry[]>(this.url);
  }

  getByGroup(groupId: number): Observable<ScheduleEntry[]> {
    return this.getAll().pipe(map((entries) => entries.filter((e) => e.groupId === groupId)));
  }

  getByTeacher(teacherId: number): Observable<ScheduleEntry[]> {
    return this.getAll().pipe(map((entries) => entries.filter((e) => e.teacherId === teacherId)));
  }

  /** Own group's lessons plus lessons of the student's elective subjects (taught in other groups). */
  getScheduleForStudent(student: User): Observable<ScheduleEntry[]> {
    const electiveIds = student.electiveSubjectIds ?? [];
    return this.getAll().pipe(
      map((entries) =>
        entries.filter(
          (e) => e.groupId === student.groupId || electiveIds.includes(e.subjectId)
        )
      )
    );
  }
}
