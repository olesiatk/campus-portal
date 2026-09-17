import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { SubjectService } from '../../core/services/subject.service';
import { TeacherService } from '../../core/services/teacher.service';
import { ScheduleEntry, Subject as SubjectModel, User } from '../../core/models';

interface ScheduleRow extends ScheduleEntry {
  subjectName: string;
  teacherName: string;
}

const DAY_NAMES = ['', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота'];

@Component({
  selector: 'app-student-schedule',
  standalone: false,
  templateUrl: './student-schedule.component.html',
  styleUrl: './student-schedule.component.scss',
})
export class StudentScheduleComponent implements OnInit {
  byDay: { day: number; dayName: string; entries: ScheduleRow[] }[] = [];

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
      const rows = entries.map((e) => this.toRow(e, subjects, teachers));
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

  private toRow(entry: ScheduleEntry, subjects: SubjectModel[], teachers: User[]): ScheduleRow {
    const teacher = teachers.find((t) => t.id === entry.teacherId);
    return {
      ...entry,
      subjectName: subjects.find((s) => s.id === entry.subjectId)?.name ?? '—',
      teacherName: teacher ? `${teacher.lastName} ${teacher.firstName}` : '—',
    };
  }
}
