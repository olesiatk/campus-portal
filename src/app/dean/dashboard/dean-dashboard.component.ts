import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { DepartmentService } from '../../core/services/department.service';
import { TeacherService } from '../../core/services/teacher.service';
import { StudentService } from '../../core/services/student.service';
import { SubjectService } from '../../core/services/subject.service';
import { Department } from '../../core/models';

interface DeanStats {
  teachers: number;
  students: number;
  subjects: number;
}

@Component({
  selector: 'app-dean-dashboard',
  standalone: false,
  templateUrl: './dean-dashboard.component.html',
  styleUrl: './dean-dashboard.component.scss',
})
export class DeanDashboardComponent implements OnInit {
  department: Department | null = null;
  stats: DeanStats | null = null;

  constructor(
    private readonly auth: AuthService,
    private readonly departmentService: DepartmentService,
    private readonly teacherService: TeacherService,
    private readonly studentService: StudentService,
    private readonly subjectService: SubjectService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const dean = this.auth.currentUser;
    if (!dean?.departmentId) {
      return;
    }
    const departmentId = dean.departmentId;

    this.departmentService.getById(departmentId).subscribe((department) => {
      this.department = department;
      this.cdr.detectChanges();
    });

    forkJoin({
      teachers: this.teacherService.getByDepartment(departmentId),
      students: this.studentService.getByDepartment(departmentId),
      subjects: this.subjectService.getByDepartment(departmentId),
    }).subscribe(({ teachers, students, subjects }) => {
      this.stats = { teachers: teachers.length, students: students.length, subjects: subjects.length };
      this.cdr.detectChanges();
    });
  }
}
