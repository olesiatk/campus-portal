import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'teacher',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['teacher'] },
    loadChildren: () => import('./teacher/teacher.module').then((m) => m.TeacherModule),
  },
  {
    path: 'student',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['student'] },
    loadChildren: () => import('./student/student.module').then((m) => m.StudentModule),
  },
  {
    path: 'dean',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['dean'] },
    loadChildren: () => import('./dean/dean.module').then((m) => m.DeanModule),
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
