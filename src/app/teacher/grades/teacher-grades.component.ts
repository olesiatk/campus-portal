import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { SubjectService } from '../../core/services/subject.service';
import { StudentService } from '../../core/services/student.service';
import { GradeService } from '../../core/services/grade.service';
import { Grade, Subject as SubjectModel, User } from '../../core/models';

@Component({
  selector: 'app-teacher-grades',
  standalone: false,
  templateUrl: './teacher-grades.component.html',
  styleUrl: './teacher-grades.component.scss',
})
export class TeacherGradesComponent implements OnInit {
  subjects: SubjectModel[] = [];
  students: User[] = [];
  filteredStudents: User[] = [];
  grades: Grade[] = [];
  displayedColumns = ['date', 'value', 'comment'];

  form: UntypedFormGroup;
  private teacherId!: number;

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly auth: AuthService,
    private readonly subjectService: SubjectService,
    private readonly studentService: StudentService,
    private readonly gradeService: GradeService,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      subjectId: [null, Validators.required],
      studentId: [null, Validators.required],
      date: [new Date(), Validators.required],
      value: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      comment: [''],
    });
  }

  ngOnInit(): void {
    const teacher = this.auth.currentUser;
    if (!teacher) {
      return;
    }
    this.teacherId = teacher.id;

    forkJoin({
      subjects: this.subjectService.getByTeacher(teacher.id),
      students: this.studentService.getAll(),
    }).subscribe(({ subjects, students }) => {
      this.subjects = subjects;
      this.students = students;
      this.cdr.detectChanges();
    });

    this.form.get('subjectId')!.valueChanges.subscribe((subjectId) => this.onSubjectChange(subjectId));
    this.form.get('studentId')!.valueChanges.subscribe(() => this.loadGrades());
  }

  private onSubjectChange(subjectId: number | null): void {
    this.form.patchValue({ studentId: null }, { emitEvent: false });
    this.grades = [];
    if (!subjectId) {
      this.filteredStudents = [];
      return;
    }
    const subject = this.subjects.find((s) => s.id === subjectId);
    if (!subject) {
      this.filteredStudents = [];
      return;
    }
    this.filteredStudents = this.students.filter(
      (s) => s.streamId === subject.streamId || (s.electiveSubjectIds ?? []).includes(subject.id)
    );
  }

  private loadGrades(): void {
    const { subjectId, studentId } = this.form.value;
    if (!subjectId || !studentId) {
      this.grades = [];
      return;
    }
    this.gradeService.getByStudent(studentId).subscribe((grades) => {
      this.grades = grades.filter((g) => g.subjectId === subjectId);
      this.cdr.detectChanges();
    });
  }

  addGrade(): void {
    const { subjectId, studentId, date, value, comment } = this.form.value;
    if (!subjectId || !studentId || value === null || value === undefined) {
      this.form.markAllAsTouched();
      return;
    }
    this.gradeService
      .addGrade({
        studentId,
        subjectId,
        teacherId: this.teacherId,
        date: (date instanceof Date ? date : new Date(date)).toISOString().slice(0, 10),
        value,
        comment: comment || undefined,
      })
      .subscribe(() => {
        this.snackBar.open('Оцінку додано', 'ОК', { duration: 3000 });
        this.form.patchValue({ value: null, comment: '' });
        this.loadGrades();
        this.cdr.detectChanges();
      });
  }
}
