import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MaterialModule } from './material.module';
import { RoleLabelPipe } from './pipes/role-label.pipe';
import { RoleBadgeComponent } from './components/role-badge/role-badge.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { WeekScheduleGridComponent } from './components/week-schedule-grid/week-schedule-grid.component';

const SHARED_IMPORTS = [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MaterialModule];
const SHARED_DECLARATIONS = [
  RoleLabelPipe,
  RoleBadgeComponent,
  PageHeaderComponent,
  ConfirmDialogComponent,
  WeekScheduleGridComponent,
];

@NgModule({
  declarations: [SHARED_DECLARATIONS],
  imports: [SHARED_IMPORTS],
  exports: [SHARED_IMPORTS, SHARED_DECLARATIONS],
})
export class SharedModule {}
