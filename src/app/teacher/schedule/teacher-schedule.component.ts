import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { SubjectService } from '../../core/services/subject.service';
import { GroupService } from '../../core/services/group.service';
import { WeekScheduleEvent } from '../../shared/components/week-schedule-grid/week-schedule-grid.component';

@Component({
  selector: 'app-teacher-schedule',
  standalone: false,
  templateUrl: './teacher-schedule.component.html',
  styleUrl: './teacher-schedule.component.scss',
})
export class TeacherScheduleComponent implements OnInit {
  events: WeekScheduleEvent[] = [];

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
      this.events = entries.map((e) => {
        const subject = subjects.find((s) => s.id === e.subjectId);
        const group = groups.find((g) => g.id === e.groupId);
        return {
          id: e.id,
          dayOfWeek: e.dayOfWeek,
          startTime: e.startTime,
          endTime: e.endTime,
          title: subject?.name ?? '—',
          subtitle: [group?.name, e.room].filter(Boolean).join(' · '),
          colorSeed: e.subjectId,
        };
      });
      this.cdr.detectChanges();
    });
  }
}
