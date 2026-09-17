import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { StudentRoutingModule } from './student-routing.module';

import { StudentShellComponent } from './student-shell/student-shell.component';
import { StudentDashboardComponent } from './dashboard/student-dashboard.component';
import { StudentScheduleComponent } from './schedule/student-schedule.component';
import { ClassmatesListComponent } from './classmates/classmates-list.component';
import { MySubjectsComponent } from './subjects/my-subjects.component';
import { MyGradesComponent } from './grades/my-grades.component';

@NgModule({
  declarations: [
    StudentShellComponent,
    StudentDashboardComponent,
    StudentScheduleComponent,
    ClassmatesListComponent,
    MySubjectsComponent,
    MyGradesComponent,
  ],
  imports: [SharedModule, StudentRoutingModule],
})
export class StudentModule {}
