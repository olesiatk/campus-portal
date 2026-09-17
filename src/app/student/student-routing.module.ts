import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StudentShellComponent } from './student-shell/student-shell.component';
import { StudentDashboardComponent } from './dashboard/student-dashboard.component';
import { StudentScheduleComponent } from './schedule/student-schedule.component';
import { ClassmatesListComponent } from './classmates/classmates-list.component';
import { MySubjectsComponent } from './subjects/my-subjects.component';
import { MyGradesComponent } from './grades/my-grades.component';

const routes: Routes = [
  {
    path: '',
    component: StudentShellComponent,
    children: [
      { path: '', component: StudentDashboardComponent },
      { path: 'schedule', component: StudentScheduleComponent },
      { path: 'subjects', component: MySubjectsComponent },
      { path: 'classmates', component: ClassmatesListComponent },
      { path: 'grades', component: MyGradesComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentRoutingModule {}
