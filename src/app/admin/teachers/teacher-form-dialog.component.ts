import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Department, User } from '../../core/models';

export interface TeacherFormDialogData {
  departments: Department[];
  teacher?: User;
}

@Component({
  selector: 'app-teacher-form-dialog',
  standalone: false,
  templateUrl: './teacher-form-dialog.component.html',
  styleUrl: './teacher-form-dialog.component.scss',
})
export class TeacherFormDialogComponent {
  form: UntypedFormGroup;

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly dialogRef: MatDialogRef<TeacherFormDialogComponent, Partial<User>>,
    @Inject(MAT_DIALOG_DATA) public data: TeacherFormDialogData
  ) {
    this.form = this.fb.group({
      firstName: [this.data.teacher?.firstName ?? '', Validators.required],
      lastName: [this.data.teacher?.lastName ?? '', Validators.required],
      email: [this.data.teacher?.email ?? '', [Validators.required, Validators.email]],
      phone: [this.data.teacher?.phone ?? '', Validators.required],
      departmentId: [this.data.teacher?.departmentId ?? null, Validators.required],
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value as Partial<User>);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
