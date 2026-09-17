import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { DepartmentService } from '../../core/services/department.service';
import { GroupService } from '../../core/services/group.service';
import { StreamService } from '../../core/services/stream.service';
import { TeacherService } from '../../core/services/teacher.service';
import { DeanService } from '../../core/services/dean.service';
import { RegistrationRequestService } from '../../core/services/registration-request.service';
import { Department, Group, Stream, User } from '../../core/models';

interface GroupOption {
  group: Group;
  courseYear: number;
}

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit {
  departments: Department[] = [];
  streams: Stream[] = [];
  groupOptions: GroupOption[] = [];
  existingPeople: User[] = [];

  submitted = false;
  submitting = false;
  errorMessage = '';

  form: UntypedFormGroup;

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly departmentService: DepartmentService,
    private readonly streamService: StreamService,
    private readonly groupService: GroupService,
    private readonly teacherService: TeacherService,
    private readonly deanService: DeanService,
    private readonly registrationService: RegistrationRequestService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      role: ['student'],
      departmentId: [null, Validators.required],
      groupId: [null],
      targetUserId: [null],
      firstName: [''],
      lastName: [''],
      email: ['', Validators.email],
    });
  }

  ngOnInit(): void {
    this.departmentService.getAll().subscribe((departments) => {
      this.departments = departments;
      this.cdr.detectChanges();
    });
    this.streamService.getAll().subscribe((streams) => {
      this.streams = streams;
      this.cdr.detectChanges();
    });

    this.form.get('role')!.valueChanges.subscribe(() => this.onDependentFieldsChanged());
    this.form.get('departmentId')!.valueChanges.subscribe(() => this.onDependentFieldsChanged());
  }

  get isStudent(): boolean {
    return this.form.get('role')!.value === 'student';
  }

  private onDependentFieldsChanged(): void {
    this.form.patchValue({ groupId: null, targetUserId: null }, { emitEvent: false });
    this.groupOptions = [];
    this.existingPeople = [];

    const departmentId = this.form.get('departmentId')!.value;
    if (!departmentId) {
      return;
    }

    if (this.isStudent) {
      this.groupService.getByDepartment(departmentId).subscribe((groups) => {
        this.groupOptions = groups
          .map((group) => {
            const stream = this.streams.find((s) => s.id === group.streamId);
            return { group, courseYear: stream ? stream.courseYear : 0 };
          })
          .sort((a, b) => a.courseYear - b.courseYear);
        this.cdr.detectChanges();
      });
    } else {
      const role = this.form.get('role')!.value;
      const service = role === 'teacher' ? this.teacherService : this.deanService;
      service.getByDepartment(departmentId).subscribe((people) => {
        this.existingPeople = people;
        this.cdr.detectChanges();
      });
    }
  }

  submit(): void {
    const value = this.form.value;
    if (!value.departmentId) {
      this.errorMessage = 'Оберіть кафедру';
      return;
    }

    if (this.isStudent) {
      if (!value.groupId || !value.firstName || !value.lastName || !value.email) {
        this.errorMessage = "Заповніть ім'я, прізвище, email та оберіть потік";
        return;
      }
      const option = this.groupOptions.find((o) => o.group.id === value.groupId);
      this.errorMessage = '';
      this.submitting = true;
      this.registrationService
        .submit({
          role: 'student',
          departmentId: value.departmentId,
          streamId: option?.group.streamId,
          groupId: value.groupId,
          firstName: value.firstName,
          lastName: value.lastName,
          email: value.email,
        })
        .subscribe(() => this.onSubmitted());
    } else {
      if (!value.targetUserId) {
        this.errorMessage = 'Оберіть себе зі списку';
        return;
      }
      const person = this.existingPeople.find((p) => p.id === value.targetUserId);
      this.errorMessage = '';
      this.submitting = true;
      this.registrationService
        .submit({
          role: value.role,
          departmentId: value.departmentId,
          targetUserId: value.targetUserId,
          email: person?.email ?? '',
        })
        .subscribe(() => this.onSubmitted());
    }
  }

  private onSubmitted(): void {
    this.submitting = false;
    this.submitted = true;
    this.cdr.detectChanges();
  }
}
