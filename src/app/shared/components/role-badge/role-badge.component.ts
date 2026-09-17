import { Component, Input } from '@angular/core';

import { Role } from '../../../core/models';

@Component({
  selector: 'app-role-badge',
  standalone: false,
  templateUrl: './role-badge.component.html',
  styleUrl: './role-badge.component.scss',
})
export class RoleBadgeComponent {
  @Input() role: Role | null = null;
}
