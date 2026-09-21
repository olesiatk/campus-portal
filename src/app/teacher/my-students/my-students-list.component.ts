import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { SubjectService } from '../../core/services/subject.service';
import { StudentService } from '../../core/services/student.service';
import { GroupService } from '../../core/services/group.service';
import { Group, Subject as SubjectModel, User } from '../../core/models';

interface StudentRow extends User {
  groupName: string;
  subjectNames: string;
}

@Component({
  selector: 'app-my-students-list',
  standalone: false,
  templateUrl: './my-students-list.component.html',
  styleUrl: './my-students-list.component.scss',
})
export class MyStudentsListComponent implements OnInit, AfterViewInit {
  displayedColumns = ['lastName', 'group', 'subjects'];
  dataSource = new MatTableDataSource<StudentRow>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly auth: AuthService,
    private readonly subjectService: SubjectService,
    private readonly studentService: StudentService,
    private readonly groupService: GroupService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const teacher = this.auth.currentUser;
    if (!teacher) {
      return;
    }
    this.subjectService.getByTeacher(teacher.id).subscribe((subjects) => {
      forkJoin({
        students: this.studentService.getForSubjects(subjects),
        groups: this.groupService.getAll(),
      }).subscribe(({ students, groups }) => {
        this.dataSource.data = students
          .map((student) => this.toRow(student, subjects, groups))
          .filter((row): row is StudentRow => row !== null)
          .sort((a, b) => a.lastName.localeCompare(b.lastName));
        this.cdr.detectChanges();
      });
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  private toRow(student: User, subjects: SubjectModel[], groups: Group[]): StudentRow | null {
    const matched = subjects.filter(
      (s) => s.streamId === student.streamId || (student.electiveSubjectIds ?? []).includes(s.id)
    );
    if (!matched.length) {
      return null;
    }
    return {
      ...student,
      groupName: groups.find((g) => g.id === student.groupId)?.name ?? '—',
      subjectNames: matched.map((s) => s.name).join(', '),
    };
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }
}
