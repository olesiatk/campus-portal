import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { StudentService } from '../../core/services/student.service';
import { GradeService } from '../../core/services/grade.service';
import { SubjectService } from '../../core/services/subject.service';
import { TeacherService } from '../../core/services/teacher.service';
import { Grade } from '../../core/models';

interface GradeRow extends Grade {
  studentName: string;
  subjectName: string;
  teacherName: string;
}

@Component({
  selector: 'app-department-grades-overview',
  standalone: false,
  templateUrl: './department-grades-overview.component.html',
  styleUrl: './department-grades-overview.component.scss',
})
export class DepartmentGradesOverviewComponent implements OnInit, AfterViewInit {
  displayedColumns = ['date', 'student', 'subject', 'teacher', 'value', 'comment'];
  dataSource = new MatTableDataSource<GradeRow>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly auth: AuthService,
    private readonly studentService: StudentService,
    private readonly gradeService: GradeService,
    private readonly subjectService: SubjectService,
    private readonly teacherService: TeacherService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const dean = this.auth.currentUser;
    if (!dean?.departmentId) {
      return;
    }
    this.studentService.getByDepartment(dean.departmentId).subscribe((students) => {
      const studentIds = students.map((s) => s.id);
      forkJoin({
        grades: this.gradeService.getByStudentIds(studentIds),
        subjects: this.subjectService.getAll(),
        teachers: this.teacherService.getAll(),
      }).subscribe(({ grades, subjects, teachers }) => {
        this.dataSource.data = grades
          .map((g) => {
            const student = students.find((s) => s.id === g.studentId);
            const subject = subjects.find((s) => s.id === g.subjectId);
            const teacher = teachers.find((t) => t.id === g.teacherId);
            return {
              ...g,
              studentName: student ? `${student.lastName} ${student.firstName}` : '—',
              subjectName: subject?.name ?? '—',
              teacherName: teacher ? `${teacher.lastName} ${teacher.firstName}` : '—',
            };
          })
          .sort((a, b) => b.date.localeCompare(a.date));
        this.cdr.detectChanges();
      });
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }
}
