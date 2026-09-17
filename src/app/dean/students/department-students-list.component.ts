import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { StudentService } from '../../core/services/student.service';
import { GroupService } from '../../core/services/group.service';
import { User } from '../../core/models';

interface StudentRow extends User {
  groupName: string;
}

@Component({
  selector: 'app-department-students-list',
  standalone: false,
  templateUrl: './department-students-list.component.html',
  styleUrl: './department-students-list.component.scss',
})
export class DepartmentStudentsListComponent implements OnInit, AfterViewInit {
  displayedColumns = ['lastName', 'email', 'group'];
  dataSource = new MatTableDataSource<StudentRow>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly auth: AuthService,
    private readonly studentService: StudentService,
    private readonly groupService: GroupService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const dean = this.auth.currentUser;
    if (!dean?.departmentId) {
      return;
    }
    forkJoin({
      students: this.studentService.getByDepartment(dean.departmentId),
      groups: this.groupService.getByDepartment(dean.departmentId),
    }).subscribe(({ students, groups }) => {
      this.dataSource.data = students
        .map((s) => ({ ...s, groupName: groups.find((g) => g.id === s.groupId)?.name ?? '—' }))
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
