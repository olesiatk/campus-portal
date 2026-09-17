import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-shell',
  standalone: false,
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
})
export class AdminShellComponent {
  readonly navLinks = [
    { path: '.', label: 'Огляд', icon: 'dashboard', exact: true },
    { path: 'departments', label: 'Кафедри та потоки', icon: 'account_balance' },
    { path: 'teachers', label: 'Викладачі', icon: 'school' },
    { path: 'students', label: 'Студенти', icon: 'groups' },
    { path: 'subjects', label: 'Предмети', icon: 'menu_book' },
    { path: 'requests', label: 'Заявки на реєстрацію', icon: 'how_to_reg' },
  ];
}
