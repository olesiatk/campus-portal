import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { SubjectService } from '../../core/services/subject.service';
import { TeacherService } from '../../core/services/teacher.service';
import { Subject as SubjectModel, User } from '../../core/models';

interface SubjectRow extends SubjectModel {
  teacherName: string;
  isElective: boolean;
}

@Component({
  selector: 'app-student-my-subjects',
  standalone: false,
  templateUrl: './my-subjects.component.html',
  styleUrl: './my-subjects.component.scss',
})
export class MySubjectsComponent implements OnInit {
  displayedColumns = ['name', 'teacher', 'type'];
  subjects: SubjectRow[] = [];

  constructor(
    private readonly auth: AuthService,
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
      subjects: this.subjectService.getAll(),
      teachers: this.teacherService.getAll(),
    }).subscribe(({ subjects, teachers }) => {
      const electiveIds = student.electiveSubjectIds ?? [];
      this.subjects = subjects
        .filter((s) => s.streamId === student.streamId || electiveIds.includes(s.id))
        .map((s) => ({
          ...s,
          teacherName: this.teacherLabel(s.teacherId, teachers),
          isElective: electiveIds.includes(s.id),
        }));
      this.cdr.detectChanges();
    });
  }

  private teacherLabel(teacherId: number, teachers: User[]): string {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? `${teacher.lastName} ${teacher.firstName}` : '—';
  }
}
