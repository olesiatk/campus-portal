import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { DepartmentService } from '../../core/services/department.service';
import { GroupService } from '../../core/services/group.service';
import { StreamService } from '../../core/services/stream.service';
import { SubjectService } from '../../core/services/subject.service';
import { Department, Group, Stream, User } from '../../core/models';

@Component({
  selector: 'app-student-dashboard',
  standalone: false,
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss',
})
export class StudentDashboardComponent implements OnInit {
  student: User | null = null;
  department: Department | null = null;
  group: Group | null = null;
  stream: Stream | null = null;
  subjectCount = 0;

  constructor(
    private readonly auth: AuthService,
    private readonly departmentService: DepartmentService,
    private readonly groupService: GroupService,
    private readonly streamService: StreamService,
    private readonly subjectService: SubjectService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.student = this.auth.currentUser;
    if (!this.student) {
      return;
    }

    forkJoin({
      departments: this.departmentService.getAll(),
      groups: this.groupService.getAll(),
      streams: this.streamService.getAll(),
      subjects: this.subjectService.getAll(),
    }).subscribe(({ departments, groups, streams, subjects }) => {
      this.department = departments.find((d) => d.id === this.student!.departmentId) ?? null;
      this.group = groups.find((g) => g.id === this.student!.groupId) ?? null;
      this.stream = streams.find((s) => s.id === this.student!.streamId) ?? null;
      const homeCount = subjects.filter((s) => s.streamId === this.student!.streamId).length;
      const electiveCount = this.student!.electiveSubjectIds?.length ?? 0;
      this.subjectCount = homeCount + electiveCount;
      this.cdr.detectChanges();
    });
  }
}
