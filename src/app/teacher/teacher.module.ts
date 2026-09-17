import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { TeacherRoutingModule } from './teacher-routing.module';

import { TeacherShellComponent } from './teacher-shell/teacher-shell.component';
import { TeacherDashboardComponent } from './dashboard/teacher-dashboard.component';
import { MySubjectsComponent } from './my-subjects/my-subjects.component';
import { MyStudentsListComponent } from './my-students/my-students-list.component';
import { TeacherGradesComponent } from './grades/teacher-grades.component';
import { TeacherScheduleComponent } from './schedule/teacher-schedule.component';

@NgModule({
  declarations: [
    TeacherShellComponent,
    TeacherDashboardComponent,
    MySubjectsComponent,
    MyStudentsListComponent,
    TeacherGradesComponent,
    TeacherScheduleComponent,
  ],
  imports: [SharedModule, TeacherRoutingModule],
})
export class TeacherModule {}
