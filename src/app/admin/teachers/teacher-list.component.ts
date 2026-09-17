import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

import { TeacherService } from '../../core/services/teacher.service';
import { DepartmentService } from '../../core/services/department.service';
import { Department, User } from '../../core/models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { TeacherFormDialogComponent } from './teacher-form-dialog.component';

@Component({
  selector: 'app-teacher-list',
  standalone: false,
  templateUrl: './teacher-list.component.html',
  styleUrl: './teacher-list.component.scss',
})
export class TeacherListComponent implements OnInit, AfterViewInit {
  displayedColumns = ['lastName', 'email', 'phone', 'department', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  departments: Department[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly teacherService: TeacherService,
    private readonly departmentService: DepartmentService,
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
      teachers: this.teacherService.getAll(),
      departments: this.departmentService.getAll(),
    }).subscribe(({ teachers, departments }) => {
      this.departments = departments;
      this.dataSource.data = teachers.sort((a, b) => a.lastName.localeCompare(b.lastName));
      this.cdr.detectChanges();
    });
  }

  departmentName(id?: number): string {
    return this.departments.find((d) => d.id === id)?.name ?? '—';
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  add(): void {
    this.dialog
      .open(TeacherFormDialogComponent, { data: { departments: this.departments } })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.teacherService.create(result as Omit<User, 'id'>).subscribe(() => {
          this.snackBar.open('Викладача додано', 'ОК', { duration: 3000 });
          this.load();
        });
      });
  }

  edit(teacher: User): void {
    this.dialog
      .open(TeacherFormDialogComponent, { data: { departments: this.departments, teacher } })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.teacherService.update({ ...teacher, ...result }).subscribe(() => {
          this.snackBar.open('Зміни збережено', 'ОК', { duration: 3000 });
          this.load();
        });
      });
  }

  remove(teacher: User): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Видалити викладача?',
          message: `${teacher.lastName} ${teacher.firstName} буде видалено назавжди.`,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.teacherService.delete(teacher.id).subscribe(() => {
          this.snackBar.open('Викладача видалено', 'ОК', { duration: 3000 });
          this.load();
        });
      });
  }
}
