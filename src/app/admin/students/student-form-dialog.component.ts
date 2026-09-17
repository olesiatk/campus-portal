import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { SubjectService } from '../../core/services/subject.service';
import { Department, Group, Stream, Subject as SubjectModel, User } from '../../core/models';

export interface StudentFormDialogData {
  departments: Department[];
  streams: Stream[];
  groups: Group[];
  student?: User;
}

@Component({
  selector: 'app-student-form-dialog',
  standalone: false,
  templateUrl: './student-form-dialog.component.html',
  styleUrl: './student-form-dialog.component.scss',
})
export class StudentFormDialogComponent implements OnInit {
  electiveOptions: SubjectModel[] = [];
  private allSubjects: SubjectModel[] = [];
  form: UntypedFormGroup;

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly subjectService: SubjectService,
    private readonly dialogRef: MatDialogRef<StudentFormDialogComponent, Partial<User>>,
    @Inject(MAT_DIALOG_DATA) public data: StudentFormDialogData,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      firstName: [this.data.student?.firstName ?? '', Validators.required],
      lastName: [this.data.student?.lastName ?? '', Validators.required],
      email: [this.data.student?.email ?? '', [Validators.required, Validators.email]],
      phone: [this.data.student?.phone ?? '', Validators.required],
      groupId: [this.data.student?.groupId ?? null, Validators.required],
      subgroup: [this.data.student?.subgroup ?? null],
      electiveSubjectIds: [this.data.student?.electiveSubjectIds ?? []],
    });
  }

  ngOnInit(): void {
    this.subjectService.getAll().subscribe((subjects) => {
      this.allSubjects = subjects;
      this.refreshElectiveOptions(this.form.get('groupId')!.value);
    });
    this.form.get('groupId')!.valueChanges.subscribe((groupId) => this.refreshElectiveOptions(groupId));
  }

  get selectedGroup(): Group | undefined {
    return this.data.groups.find((g) => g.id === this.form.get('groupId')!.value);
  }

  get showSubgroupField(): boolean {
    return !!this.selectedGroup?.hasSubgroups;
  }

  private refreshElectiveOptions(groupId: number | null): void {
    const group = this.data.groups.find((g) => g.id === groupId);
    if (!group) {
      this.electiveOptions = [];
      return;
    }
    const stream = this.data.streams.find((s) => s.id === group.streamId);
    if (!stream) {
      this.electiveOptions = [];
      return;
    }
    const otherDeptStreamIds = this.data.streams
      .filter((s) => s.courseYear === stream.courseYear && s.departmentId !== stream.departmentId)
      .map((s) => s.id);
    this.electiveOptions = this.allSubjects.filter((s) => otherDeptStreamIds.includes(s.streamId));
    this.cdr.detectChanges();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const group = this.selectedGroup;
    const value = this.form.value;
    this.dialogRef.close({
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      phone: value.phone,
      groupId: value.groupId ?? undefined,
      departmentId: group?.departmentId,
      streamId: group?.streamId,
      subgroup: this.showSubgroupField ? value.subgroup : null,
      electiveSubjectIds: value.electiveSubjectIds,
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
