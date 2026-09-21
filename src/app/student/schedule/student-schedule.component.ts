import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { SubjectService } from '../../core/services/subject.service';
import { TeacherService } from '../../core/services/teacher.service';
import { WeekScheduleEvent } from '../../shared/components/week-schedule-grid/week-schedule-grid.component';

@Component({
  selector: 'app-student-schedule',
  standalone: false,
  templateUrl: './student-schedule.component.html',
  styleUrl: './student-schedule.component.scss',
})
export class StudentScheduleComponent implements OnInit {
  events: WeekScheduleEvent[] = [];

  constructor(
    private readonly auth: AuthService,
    private readonly scheduleService: ScheduleService,
    private readonly subjectService: SubjectService,
    private readonly teacherService: TeacherService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const student = this.auth.currentUser;
    if (!student) {
      return;
    }
    forkJoin({
      entries: this.scheduleService.getScheduleForStudent(student),
      subjects: this.subjectService.getAll(),
      teachers: this.teacherService.getAll(),
    }).subscribe(({ entries, subjects, teachers }) => {
      this.events = entries.map((e) => {
        const subject = subjects.find((s) => s.id === e.subjectId);
        const teacher = teachers.find((t) => t.id === e.teacherId);
        const teacherName = teacher ? `${teacher.lastName} ${teacher.firstName}` : undefined;
        return {
          id: e.id,
          dayOfWeek: e.dayOfWeek,
          startTime: e.startTime,
          endTime: e.endTime,
          title: subject?.name ?? '—',
          subtitle: [teacherName, e.room].filter(Boolean).join(' · '),
          colorSeed: e.subjectId,
        };
      });
      this.cdr.detectChanges();
    });
  }
}
