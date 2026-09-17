import { Component } from '@angular/core';

@Component({
  selector: 'app-teacher-shell',
  standalone: false,
  templateUrl: './teacher-shell.component.html',
  styleUrl: './teacher-shell.component.scss',
})
export class TeacherShellComponent {
  readonly navLinks = [
    { path: '.', label: 'Огляд', icon: 'dashboard', exact: true },
    { path: 'subjects', label: 'Мої предмети', icon: 'menu_book' },
    { path: 'students', label: 'Мої студенти', icon: 'groups' },
    { path: 'grades', label: 'Оцінки', icon: 'grade' },
    { path: 'schedule', label: 'Розклад', icon: 'calendar_month' },
  ];
}
