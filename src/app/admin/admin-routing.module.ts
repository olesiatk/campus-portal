import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminShellComponent } from './admin-shell/admin-shell.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { DepartmentsOverviewComponent } from './departments/departments-overview.component';
import { TeacherListComponent } from './teachers/teacher-list.component';
import { StudentListComponent } from './students/student-list.component';
import { SubjectListComponent } from './subjects/subject-list.component';
import { PendingRequestsListComponent } from './requests/pending-requests-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'departments', component: DepartmentsOverviewComponent },
      { path: 'teachers', component: TeacherListComponent },
      { path: 'students', component: StudentListComponent },
      { path: 'subjects', component: SubjectListComponent },
      { path: 'requests', component: PendingRequestsListComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
