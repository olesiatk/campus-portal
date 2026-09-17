import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { DepartmentService } from '../../core/services/department.service';
import { TeacherService } from '../../core/services/teacher.service';
import { StudentService } from '../../core/services/student.service';
import { SubjectService } from '../../core/services/subject.service';
import { RegistrationRequestService } from '../../core/services/registration-request.service';

interface DashboardStats {
  departments: number;
  teachers: number;
  students: number;
  subjects: number;
  pendingRequests: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;

  constructor(
    private readonly departmentService: DepartmentService,
    private readonly teacherService: TeacherService,
    private readonly studentService: StudentService,
    private readonly subjectService: SubjectService,
    private readonly registrationService: RegistrationRequestService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      departments: this.departmentService.getAll(),
      teachers: this.teacherService.getAll(),
      students: this.studentService.getAll(),
      subjects: this.subjectService.getAll(),
      pending: this.registrationService.getPending(),
    }).subscribe(({ departments, teachers, students, subjects, pending }) => {
      this.stats = {
        departments: departments.length,
        teachers: teachers.length,
        students: students.length,
        subjects: subjects.length,
        pendingRequests: pending.length,
      };
      this.cdr.detectChanges();
    });
  }
}
