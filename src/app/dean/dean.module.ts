import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { DeanRoutingModule } from './dean-routing.module';

import { DeanShellComponent } from './dean-shell/dean-shell.component';
import { DeanDashboardComponent } from './dashboard/dean-dashboard.component';
import { DepartmentTeachersListComponent } from './teachers/department-teachers-list.component';
import { DepartmentStudentsListComponent } from './students/department-students-list.component';
import { DepartmentSubjectsListComponent } from './subjects/department-subjects-list.component';
import { DepartmentGradesOverviewComponent } from './grades/department-grades-overview.component';

@NgModule({
  declarations: [
    DeanShellComponent,
    DeanDashboardComponent,
    DepartmentTeachersListComponent,
    DepartmentStudentsListComponent,
    DepartmentSubjectsListComponent,
    DepartmentGradesOverviewComponent,
  ],
  imports: [SharedModule, DeanRoutingModule],
})
export class DeanModule {}
