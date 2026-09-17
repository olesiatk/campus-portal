import { Component } from '@angular/core';

@Component({
  selector: 'app-dean-shell',
  standalone: false,
  templateUrl: './dean-shell.component.html',
  styleUrl: './dean-shell.component.scss',
})
export class DeanShellComponent {
  readonly navLinks = [
    { path: '.', label: 'Огляд', icon: 'dashboard', exact: true },
    { path: 'teachers', label: 'Викладачі', icon: 'school' },
    { path: 'students', label: 'Студенти', icon: 'groups' },
    { path: 'subjects', label: 'Предмети', icon: 'menu_book' },
    { path: 'grades', label: 'Оцінки', icon: 'grade' },
  ];
}
