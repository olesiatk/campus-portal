import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { AuthService } from '../../core/services/auth.service';
import { TeacherService } from '../../core/services/teacher.service';
import { SubjectService } from '../../core/services/subject.service';
import { forkJoin } from 'rxjs';
import { User } from '../../core/models';

interface TeacherRow extends User {
  subjectCount: number;
}

@Component({
  selector: 'app-department-teachers-list',
  standalone: false,
  templateUrl: './department-teachers-list.component.html',
  styleUrl: './department-teachers-list.component.scss',
})
export class DepartmentTeachersListComponent implements OnInit, AfterViewInit {
  displayedColumns = ['lastName', 'email', 'phone', 'subjectCount'];
  dataSource = new MatTableDataSource<TeacherRow>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly auth: AuthService,
    private readonly teacherService: TeacherService,
    private readonly subjectService: SubjectService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const dean = this.auth.currentUser;
    if (!dean?.departmentId) {
      return;
    }
    forkJoin({
      teachers: this.teacherService.getByDepartment(dean.departmentId),
      subjects: this.subjectService.getByDepartment(dean.departmentId),
    }).subscribe(({ teachers, subjects }) => {
      this.dataSource.data = teachers
        .map((t) => ({ ...t, subjectCount: subjects.filter((s) => s.teacherId === t.id).length }))
        .sort((a, b) => a.lastName.localeCompare(b.lastName));
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }
}
