import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

import { SubjectService } from '../../core/services/subject.service';
import { DepartmentService } from '../../core/services/department.service';
import { StreamService } from '../../core/services/stream.service';
import { TeacherService } from '../../core/services/teacher.service';
import { Department, Stream, Subject as SubjectModel, User } from '../../core/models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { SubjectFormDialogComponent } from './subject-form-dialog.component';

interface SubjectRow extends SubjectModel {
  departmentName: string;
  streamLabel: string;
  teacherName: string;
}

@Component({
  selector: 'app-subject-list',
  standalone: false,
  templateUrl: './subject-list.component.html',
  styleUrl: './subject-list.component.scss',
})
export class SubjectListComponent implements OnInit, AfterViewInit {
  displayedColumns = ['name', 'department', 'stream', 'teacher', 'actions'];
  dataSource = new MatTableDataSource<SubjectRow>([]);
  departments: Department[] = [];
  streams: Stream[] = [];
  teachers: User[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly subjectService: SubjectService,
    private readonly departmentService: DepartmentService,
    private readonly streamService: StreamService,
    private readonly teacherService: TeacherService,
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
      subjects: this.subjectService.getAll(),
      departments: this.departmentService.getAll(),
      streams: this.streamService.getAll(),
      teachers: this.teacherService.getAll(),
    }).subscribe(({ subjects, departments, streams, teachers }) => {
      this.departments = departments;
      this.streams = streams;
      this.teachers = teachers;
      this.dataSource.data = subjects.map((s) => this.toRow(s));
      this.cdr.detectChanges();
    });
  }

  private toRow(subject: SubjectModel): SubjectRow {
    const stream = this.streams.find((s) => s.id === subject.streamId);
    const teacher = this.teachers.find((t) => t.id === subject.teacherId);
    return {
      ...subject,
      departmentName: this.departments.find((d) => d.id === subject.departmentId)?.name ?? '—',
      streamLabel: stream ? `${stream.courseYear} курс` : '—',
      teacherName: teacher ? `${teacher.lastName} ${teacher.firstName}` : '—',
    };
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  add(): void {
    this.dialog
      .open(SubjectFormDialogComponent, { data: { departments: this.departments, streams: this.streams } })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.subjectService.create(result as Omit<SubjectModel, 'id'>).subscribe(() => {
          this.snackBar.open('Предмет додано', 'ОК', { duration: 3000 });
          this.load();
        });
      });
  }

  edit(subject: SubjectRow): void {
    this.dialog
      .open(SubjectFormDialogComponent, {
        data: { departments: this.departments, streams: this.streams, subject },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.subjectService.update({ ...subject, ...result }).subscribe(() => {
          this.snackBar.open('Зміни збережено', 'ОК', { duration: 3000 });
          this.load();
        });
      });
  }

  remove(subject: SubjectRow): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: { title: 'Видалити предмет?', message: `"${subject.name}" буде видалено назавжди.` },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.subjectService.delete(subject.id).subscribe(() => {
          this.snackBar.open('Предмет видалено', 'ОК', { duration: 3000 });
          this.load();
        });
      });
  }
}
