import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { SubjectService } from '../../core/services/subject.service';
import { StreamService } from '../../core/services/stream.service';
import { TeacherService } from '../../core/services/teacher.service';
import { Subject as SubjectModel } from '../../core/models';

interface SubjectRow extends SubjectModel {
  streamLabel: string;
  teacherName: string;
}

@Component({
  selector: 'app-department-subjects-list',
  standalone: false,
  templateUrl: './department-subjects-list.component.html',
  styleUrl: './department-subjects-list.component.scss',
})
export class DepartmentSubjectsListComponent implements OnInit, AfterViewInit {
  displayedColumns = ['name', 'stream', 'teacher'];
  dataSource = new MatTableDataSource<SubjectRow>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly auth: AuthService,
    private readonly subjectService: SubjectService,
    private readonly streamService: StreamService,
    private readonly teacherService: TeacherService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const dean = this.auth.currentUser;
    if (!dean?.departmentId) {
      return;
    }
    forkJoin({
      subjects: this.subjectService.getByDepartment(dean.departmentId),
      streams: this.streamService.getByDepartment(dean.departmentId),
      teachers: this.teacherService.getByDepartment(dean.departmentId),
    }).subscribe(({ subjects, streams, teachers }) => {
      this.dataSource.data = subjects
        .map((s) => ({
          ...s,
          streamLabel: `${streams.find((st) => st.id === s.streamId)?.courseYear ?? '—'} курс`,
          teacherName: (() => {
            const t = teachers.find((te) => te.id === s.teacherId);
            return t ? `${t.lastName} ${t.firstName}` : '—';
          })(),
        }))
        .sort((a, b) => a.streamLabel.localeCompare(b.streamLabel));
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
