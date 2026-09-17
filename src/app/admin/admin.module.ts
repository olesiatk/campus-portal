import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminShellComponent } from './admin-shell/admin-shell.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { DepartmentsOverviewComponent } from './departments/departments-overview.component';
import { TeacherListComponent } from './teachers/teacher-list.component';
import { TeacherFormDialogComponent } from './teachers/teacher-form-dialog.component';
import { StudentListComponent } from './students/student-list.component';
import { StudentFormDialogComponent } from './students/student-form-dialog.component';
import { SubjectListComponent } from './subjects/subject-list.component';
import { SubjectFormDialogComponent } from './subjects/subject-form-dialog.component';
import { PendingRequestsListComponent } from './requests/pending-requests-list.component';
import { ApproveRequestDialogComponent } from './requests/approve-request-dialog.component';

@NgModule({
  declarations: [
    AdminShellComponent,
    AdminDashboardComponent,
    DepartmentsOverviewComponent,
    TeacherListComponent,
    TeacherFormDialogComponent,
    StudentListComponent,
    StudentFormDialogComponent,
    SubjectListComponent,
    SubjectFormDialogComponent,
    PendingRequestsListComponent,
    ApproveRequestDialogComponent,
  ],
  imports: [SharedModule, AdminRoutingModule],
})
export class AdminModule {}
