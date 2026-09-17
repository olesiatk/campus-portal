import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Stream } from '../models';

// Note: the mock in-memory API filters query params via RegExp.test() on
// stringified values, which can produce false substring matches on numeric
// ids (e.g. departmentId=1 matching 11). All id-based filtering here is
// therefore done client-side after fetching the full collection.
@Injectable({ providedIn: 'root' })
export class StreamService {
  private readonly url = '/api/streams';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Stream[]> {
    return this.http.get<Stream[]>(this.url);
  }

  getByDepartment(departmentId: number): Observable<Stream[]> {
    return this.getAll().pipe(map((streams) => streams.filter((s) => s.departmentId === departmentId)));
  }

  getById(id: number): Observable<Stream> {
    return this.getAll().pipe(
      map((streams) => {
        const found = streams.find((s) => s.id === id);
        if (!found) {
          throw new Error(`Stream ${id} not found`);
        }
        return found;
      })
    );
  }
}
