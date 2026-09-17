import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

import { RegistrationRequestService } from '../../core/services/registration-request.service';
import { DepartmentService } from '../../core/services/department.service';
import { Department, PendingRequest } from '../../core/models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ApproveRequestDialogComponent } from './approve-request-dialog.component';

@Component({
  selector: 'app-pending-requests-list',
  standalone: false,
  templateUrl: './pending-requests-list.component.html',
  styleUrl: './pending-requests-list.component.scss',
})
export class PendingRequestsListComponent implements OnInit {
  requests: PendingRequest[] = [];
  departments: Department[] = [];

  constructor(
    private readonly registrationService: RegistrationRequestService,
    private readonly departmentService: DepartmentService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    forkJoin({
      requests: this.registrationService.getPending(),
      departments: this.departmentService.getAll(),
    }).subscribe(({ requests, departments }) => {
      this.requests = requests;
      this.departments = departments;
      this.cdr.detectChanges();
    });
  }

  departmentName(id: number): string {
    return this.departments.find((d) => d.id === id)?.name ?? '—';
  }

  isClaim(request: PendingRequest): boolean {
    return !!request.targetUserId;
  }

  approve(request: PendingRequest): void {
    this.dialog
      .open(ApproveRequestDialogComponent, { data: { request } })
      .afterClosed()
      .subscribe((password) => {
        if (!password) {
          return;
        }
        this.registrationService.approve(request, password).subscribe(() => {
          this.snackBar.open(`Пароль надіслано на ${request.email}: ${password}`, 'ОК', { duration: 8000 });
          this.load();
        });
      });
  }

  reject(request: PendingRequest): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: { title: 'Відхилити заявку?', message: `Заявка від ${request.email} буде відхилена.` },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.registrationService.reject(request).subscribe(() => {
          this.snackBar.open('Заявку відхилено', 'ОК', { duration: 3000 });
          this.load();
        });
      });
  }
}
