import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { DepartmentService } from '../../core/services/department.service';
import { StreamService } from '../../core/services/stream.service';
import { GroupService } from '../../core/services/group.service';
import { TeacherService } from '../../core/services/teacher.service';
import { DeanService } from '../../core/services/dean.service';
import { Department, Group, Stream, User } from '../../core/models';

interface StreamRow {
  stream: Stream;
  group: Group;
}

interface DepartmentBlock {
  department: Department;
  streamRows: StreamRow[];
  teachers: User[];
  deans: User[];
}

@Component({
  selector: 'app-departments-overview',
  standalone: false,
  templateUrl: './departments-overview.component.html',
  styleUrl: './departments-overview.component.scss',
})
export class DepartmentsOverviewComponent implements OnInit {
  blocks: DepartmentBlock[] = [];

  constructor(
    private readonly departmentService: DepartmentService,
    private readonly streamService: StreamService,
    private readonly groupService: GroupService,
    private readonly teacherService: TeacherService,
    private readonly deanService: DeanService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      departments: this.departmentService.getAll(),
      streams: this.streamService.getAll(),
      groups: this.groupService.getAll(),
      teachers: this.teacherService.getAll(),
      deans: this.deanService.getAll(),
    }).subscribe(({ departments, streams, groups, teachers, deans }) => {
      this.blocks = departments.map((department) => {
        const deptStreams = streams
          .filter((s) => s.departmentId === department.id)
          .sort((a, b) => a.courseYear - b.courseYear);
        const streamRows: StreamRow[] = deptStreams.map((stream) => ({
          stream,
          group: groups.find((g) => g.streamId === stream.id)!,
        }));
        return {
          department,
          streamRows,
          teachers: teachers.filter((t) => t.departmentId === department.id),
          deans: deans.filter((d) => d.departmentId === department.id),
        };
      });
      this.cdr.detectChanges();
    });
  }
}
