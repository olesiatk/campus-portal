import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { TeacherService } from '../../core/services/teacher.service';
import { Department, Stream, Subject as SubjectModel, User } from '../../core/models';

export interface SubjectFormDialogData {
  departments: Department[];
  streams: Stream[];
  subject?: SubjectModel;
}

@Component({
  selector: 'app-subject-form-dialog',
  standalone: false,
  templateUrl: './subject-form-dialog.component.html',
  styleUrl: './subject-form-dialog.component.scss',
})
export class SubjectFormDialogComponent implements OnInit {
  teachers: User[] = [];
  filteredStreams: Stream[] = [];
  form: UntypedFormGroup;

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly teacherService: TeacherService,
    private readonly dialogRef: MatDialogRef<SubjectFormDialogComponent, Partial<SubjectModel>>,
    @Inject(MAT_DIALOG_DATA) public data: SubjectFormDialogData,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      name: [this.data.subject?.name ?? '', Validators.required],
      departmentId: [this.data.subject?.departmentId ?? null, Validators.required],
      streamId: [this.data.subject?.streamId ?? null, Validators.required],
      teacherId: [this.data.subject?.teacherId ?? null, Validators.required],
    });
  }

  ngOnInit(): void {
    const departmentId = this.form.get('departmentId')!.value;
    if (departmentId) {
      this.onDepartmentChange(departmentId, false);
    }
    this.form.get('departmentId')!.valueChanges.subscribe((id) => this.onDepartmentChange(id, true));
  }

  private onDepartmentChange(departmentId: number | null, resetChildren: boolean): void {
    this.filteredStreams = this.data.streams.filter((s) => s.departmentId === departmentId);
    if (departmentId) {
      this.teacherService.getByDepartment(departmentId).subscribe((teachers) => {
        this.teachers = teachers;
        this.cdr.detectChanges();
      });
    } else {
      this.teachers = [];
    }
    if (resetChildren) {
      this.form.patchValue({ streamId: null, teacherId: null });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value as Partial<SubjectModel>);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
