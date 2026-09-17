import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DeanShellComponent } from './dean-shell/dean-shell.component';
import { DeanDashboardComponent } from './dashboard/dean-dashboard.component';
import { DepartmentTeachersListComponent } from './teachers/department-teachers-list.component';
import { DepartmentStudentsListComponent } from './students/department-students-list.component';
import { DepartmentSubjectsListComponent } from './subjects/department-subjects-list.component';
import { DepartmentGradesOverviewComponent } from './grades/department-grades-overview.component';

const routes: Routes = [
  {
    path: '',
    component: DeanShellComponent,
    children: [
      { path: '', component: DeanDashboardComponent },
      { path: 'teachers', component: DepartmentTeachersListComponent },
      { path: 'students', component: DepartmentStudentsListComponent },
      { path: 'subjects', component: DepartmentSubjectsListComponent },
      { path: 'grades', component: DepartmentGradesOverviewComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeanRoutingModule {}
