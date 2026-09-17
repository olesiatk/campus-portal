import { Component } from '@angular/core';

@Component({
  selector: 'app-student-shell',
  standalone: false,
  templateUrl: './student-shell.component.html',
  styleUrl: './student-shell.component.scss',
})
export class StudentShellComponent {
  readonly navLinks = [
    { path: '.', label: 'Огляд', icon: 'dashboard', exact: true },
    { path: 'schedule', label: 'Розклад', icon: 'calendar_month' },
    { path: 'subjects', label: 'Мої предмети', icon: 'menu_book' },
    { path: 'classmates', label: 'Одногрупники', icon: 'groups' },
    { path: 'grades', label: 'Мої оцінки', icon: 'grade' },
  ];
}
