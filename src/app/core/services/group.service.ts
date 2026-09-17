import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Group } from '../models';

// See note in stream.service.ts: id filtering is done client-side to avoid
// the mock backend's substring-regex query matching on numeric fields.
@Injectable({ providedIn: 'root' })
export class GroupService {
  private readonly url = '/api/groups';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Group[]> {
    return this.http.get<Group[]>(this.url);
  }

  getByDepartment(departmentId: number): Observable<Group[]> {
    return this.getAll().pipe(map((groups) => groups.filter((g) => g.departmentId === departmentId)));
  }

  getByStream(streamId: number): Observable<Group[]> {
    return this.getAll().pipe(map((groups) => groups.filter((g) => g.streamId === streamId)));
  }

  getById(id: number): Observable<Group> {
    return this.getAll().pipe(
      map((groups) => {
        const found = groups.find((g) => g.id === id);
        if (!found) {
          throw new Error(`Group ${id} not found`);
        }
        return found;
      })
    );
  }

  update(group: Group): Observable<Group> {
    return this.http.put<Group>(`${this.url}/${group.id}`, group);
  }
}
