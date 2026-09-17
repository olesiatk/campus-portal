import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { SubjectService } from '../../core/services/subject.service';
import { StreamService } from '../../core/services/stream.service';
import { Stream, Subject as SubjectModel } from '../../core/models';

interface SubjectRow extends SubjectModel {
  streamLabel: string;
}

@Component({
  selector: 'app-my-subjects',
  standalone: false,
  templateUrl: './my-subjects.component.html',
  styleUrl: './my-subjects.component.scss',
})
export class MySubjectsComponent implements OnInit {
  displayedColumns = ['name', 'stream'];
  subjects: SubjectRow[] = [];

  constructor(
    private readonly auth: AuthService,
    private readonly subjectService: SubjectService,
    private readonly streamService: StreamService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const teacher = this.auth.currentUser;
    if (!teacher) {
      return;
    }
    forkJoin({
      subjects: this.subjectService.getByTeacher(teacher.id),
      streams: this.streamService.getAll(),
    }).subscribe(({ subjects, streams }) => {
      this.subjects = subjects
        .map((s) => this.toRow(s, streams))
        .sort((a, b) => a.streamLabel.localeCompare(b.streamLabel));
      this.cdr.detectChanges();
    });
  }

  private toRow(subject: SubjectModel, streams: Stream[]): SubjectRow {
    const stream = streams.find((s) => s.id === subject.streamId);
    return { ...subject, streamLabel: stream ? `${stream.courseYear} курс` : '—' };
  }
}
