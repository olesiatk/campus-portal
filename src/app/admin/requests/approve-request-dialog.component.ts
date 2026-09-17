import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { PendingRequest } from '../../core/models';

export interface ApproveRequestDialogData {
  request: PendingRequest;
}

function randomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

@Component({
  selector: 'app-approve-request-dialog',
  standalone: false,
  templateUrl: './approve-request-dialog.component.html',
  styleUrl: './approve-request-dialog.component.scss',
})
export class ApproveRequestDialogComponent {
  form: UntypedFormGroup;

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly dialogRef: MatDialogRef<ApproveRequestDialogComponent, string>,
    @Inject(MAT_DIALOG_DATA) public data: ApproveRequestDialogData
  ) {
    this.form = this.fb.group({
      password: [randomPassword(), [Validators.required, Validators.minLength(6)]],
    });
  }

  regenerate(): void {
    this.form.patchValue({ password: randomPassword() });
  }

  confirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value.password);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
