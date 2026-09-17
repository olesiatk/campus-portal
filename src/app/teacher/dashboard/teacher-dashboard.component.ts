import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { SubjectService } from '../../core/services/subject.service';
import { StudentService } from '../../core/services/student.service';
import { Subject as SubjectModel, User } from '../../core/models';

interface TeacherStats {
  subjects: number;
  students: number;
}

@Component({
  selector: 'app-teacher-dashboard',
  standalone: false,
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.scss',
})
export class TeacherDashboardComponent implements OnInit {
  stats: TeacherStats | null = null;
  teacher: User | null = null;

  constructor(
    private readonly auth: AuthService,
    private readonly subjectService: SubjectService,
    private readonly studentService: StudentService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.teacher = this.auth.currentUser;
    if (!this.teacher) {
      return;
    }
    const teacherId = this.teacher.id;

    forkJoin({
      subjects: this.subjectService.getByTeacher(teacherId),
      students: this.studentService.getAll(),
    }).subscribe(({ subjects, students }) => {
      const streamIds = new Set(subjects.map((s: SubjectModel) => s.streamId));
      const subjectIds = new Set(subjects.map((s: SubjectModel) => s.id));
      const studentCount = students.filter(
        (s) =>
          (s.streamId && streamIds.has(s.streamId)) ||
          (s.electiveSubjectIds ?? []).some((id) => subjectIds.has(id))
      ).length;
      this.stats = { subjects: subjects.length, students: studentCount };
      this.cdr.detectChanges();
    });
  }
}
