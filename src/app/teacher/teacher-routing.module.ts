import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TeacherShellComponent } from './teacher-shell/teacher-shell.component';
import { TeacherDashboardComponent } from './dashboard/teacher-dashboard.component';
import { MySubjectsComponent } from './my-subjects/my-subjects.component';
import { MyStudentsListComponent } from './my-students/my-students-list.component';
import { TeacherGradesComponent } from './grades/teacher-grades.component';
import { TeacherScheduleComponent } from './schedule/teacher-schedule.component';

const routes: Routes = [
  {
    path: '',
    component: TeacherShellComponent,
    children: [
      { path: '', component: TeacherDashboardComponent },
      { path: 'subjects', component: MySubjectsComponent },
      { path: 'students', component: MyStudentsListComponent },
      { path: 'grades', component: TeacherGradesComponent },
      { path: 'schedule', component: TeacherScheduleComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeacherRoutingModule {}
