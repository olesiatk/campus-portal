import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { GradeService } from '../../core/services/grade.service';
import { SubjectService } from '../../core/services/subject.service';
import { Grade, Subject as SubjectModel } from '../../core/models';

interface SubjectGrades {
  subject: SubjectModel;
  grades: Grade[];
  average: number;
}

@Component({
  selector: 'app-my-grades',
  standalone: false,
  templateUrl: './my-grades.component.html',
  styleUrl: './my-grades.component.scss',
})
export class MyGradesComponent implements OnInit {
  displayedColumns = ['date', 'value', 'comment'];
  bySubject: SubjectGrades[] = [];

  constructor(
    private readonly auth: AuthService,
    private readonly gradeService: GradeService,
    private readonly subjectService: SubjectService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const student = this.auth.currentUser;
    if (!student) {
      return;
    }
    forkJoin({
      grades: this.gradeService.getByStudent(student.id),
      subjects: this.subjectService.getAll(),
    }).subscribe(({ grades, subjects }) => {
      const subjectIds = Array.from(new Set(grades.map((g) => g.subjectId)));
      this.bySubject = subjectIds
        .map((subjectId) => {
          const subject = subjects.find((s) => s.id === subjectId);
          const subjectGrades = grades
            .filter((g) => g.subjectId === subjectId)
            .sort((a, b) => a.date.localeCompare(b.date));
          const average =
            subjectGrades.reduce((sum, g) => sum + g.value, 0) / (subjectGrades.length || 1);
          return { subject: subject!, grades: subjectGrades, average: Math.round(average * 10) / 10 };
        })
        .filter((sg) => !!sg.subject)
        .sort((a, b) => a.subject.name.localeCompare(b.subject.name));
      this.cdr.detectChanges();
    });
  }
}
