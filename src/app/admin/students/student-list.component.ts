import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

import { StudentService } from '../../core/services/student.service';
import { DepartmentService } from '../../core/services/department.service';
import { StreamService } from '../../core/services/stream.service';
import { GroupService } from '../../core/services/group.service';
import { Department, Group, Stream, User } from '../../core/models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { StudentFormDialogComponent } from './student-form-dialog.component';

interface StudentRow extends User {
  groupName: string;
  departmentName: string;
}

@Component({
  selector: 'app-student-list',
  standalone: false,
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
})
export class StudentListComponent implements OnInit, AfterViewInit {
  displayedColumns = ['lastName', 'email', 'group', 'department', 'actions'];
  dataSource = new MatTableDataSource<StudentRow>([]);
  departments: Department[] = [];
  streams: Stream[] = [];
  groups: Group[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly studentService: StudentService,
    private readonly departmentService: DepartmentService,
    private readonly streamService: StreamService,
    private readonly groupService: GroupService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  private load(): void {
    forkJoin({
      students: this.studentService.getAll(),
      departments: this.departmentService.getAll(),
      streams: this.streamService.getAll(),
      groups: this.groupService.getAll(),
    }).subscribe(({ students, departments, streams, groups }) => {
      this.departments = departments;
      this.streams = streams;
      this.groups = groups;
      this.dataSource.data = students
        .map((s) => this.toRow(s))
        .sort((a, b) => a.lastName.localeCompare(b.lastName));
      this.cdr.detectChanges();
    });
  }

  private toRow(student: User): StudentRow {
    const group = this.groups.find((g) => g.id === student.groupId);
    return {
      ...student,
      groupName: group?.name ?? '—',
      departmentName: this.departments.find((d) => d.id === student.departmentId)?.name ?? '—',
    };
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  add(): void {
    this.dialog
      .open(StudentFormDialogComponent, {
        data: { departments: this.departments, streams: this.streams, groups: this.groups },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.studentService.create(result as Omit<User, 'id'>).subscribe(() => {
          this.snackBar.open('Студента додано', 'ОК', { duration: 3000 });
          this.load();
        });
      });
  }

  edit(student: StudentRow): void {
    this.dialog
      .open(StudentFormDialogComponent, {
        data: { departments: this.departments, streams: this.streams, groups: this.groups, student },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.studentService.update({ ...student, ...result }).subscribe(() => {
          this.snackBar.open('Зміни збережено', 'ОК', { duration: 3000 });
          this.load();
        });
      });
  }

  remove(student: StudentRow): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: { title: 'Видалити студента?', message: `${student.lastName} ${student.firstName} буде видалено назавжди.` },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.studentService.delete(student.id).subscribe(() => {
          this.snackBar.open('Студента видалено', 'ОК', { duration: 3000 });
          this.load();
        });
      });
  }
}
