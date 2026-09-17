import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';

import departments from '../mock-data/seed/departments.json';
import streams from '../mock-data/seed/streams.json';
import groups from '../mock-data/seed/groups.json';
import users from '../mock-data/seed/users.json';
import subjects from '../mock-data/seed/subjects.json';
import grades from '../mock-data/seed/grades.json';
import schedule from '../mock-data/seed/schedule.json';
import pendingRequests from '../mock-data/seed/pending-requests.json';

@Injectable({ providedIn: 'root' })
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    return {
      departments: JSON.parse(JSON.stringify(departments)),
      streams: JSON.parse(JSON.stringify(streams)),
      groups: JSON.parse(JSON.stringify(groups)),
      users: JSON.parse(JSON.stringify(users)),
      subjects: JSON.parse(JSON.stringify(subjects)),
      grades: JSON.parse(JSON.stringify(grades)),
      scheduleEntries: JSON.parse(JSON.stringify(schedule)),
      pendingRequests: JSON.parse(JSON.stringify(pendingRequests)),
    };
  }
}
