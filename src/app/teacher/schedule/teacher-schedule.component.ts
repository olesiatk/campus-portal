import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { SubjectService } from '../../core/services/subject.service';
import { GroupService } from '../../core/services/group.service';
import { Group, ScheduleEntry, Subject as SubjectModel } from '../../core/models';

interface ScheduleRow extends ScheduleEntry {
  subjectName: string;
  groupName: string;
}

const DAY_NAMES = ['', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота'];

@Component({
  selector: 'app-teacher-schedule',
  standalone: false,
  templateUrl: './teacher-schedule.component.html',
  styleUrl: './teacher-schedule.component.scss',
})
export class TeacherScheduleComponent implements OnInit {
  byDay: { day: number; dayName: string; entries: ScheduleRow[] }[] = [];

  constructor(
    private readonly auth: AuthService,
    private readonly scheduleService: ScheduleService,
    private readonly subjectService: SubjectService,
    private readonly groupService: GroupService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const teacher = this.auth.currentUser;
    if (!teacher) {
      return;
    }
    forkJoin({
      entries: this.scheduleService.getByTeacher(teacher.id),
      subjects: this.subjectService.getAll(),
      groups: this.groupService.getAll(),
    }).subscribe(({ entries, subjects, groups }) => {
      const rows = entries.map((e) => this.toRow(e, subjects, groups));
      this.byDay = [1, 2, 3, 4, 5, 6]
        .map((day) => ({
          day,
          dayName: DAY_NAMES[day],
          entries: rows.filter((r) => r.dayOfWeek === day).sort((a, b) => a.slot - b.slot),
        }))
        .filter((d) => d.entries.length > 0);
      this.cdr.detectChanges();
    });
  }

  private toRow(entry: ScheduleEntry, subjects: SubjectModel[], groups: Group[]): ScheduleRow {
    return {
      ...entry,
      subjectName: subjects.find((s) => s.id === entry.subjectId)?.name ?? '—',
      groupName: groups.find((g) => g.id === entry.groupId)?.name ?? '—',
    };
  }
}
