import { Pipe, PipeTransform } from '@angular/core';

import { Role } from '../../core/models';

const LABELS: Record<Role, string> = {
  admin: 'Адміністратор',
  dean: 'Декан',
  teacher: 'Викладач',
  student: 'Студент',
};

@Pipe({ name: 'roleLabel', standalone: false })
export class RoleLabelPipe implements PipeTransform {
  transform(role: Role | null | undefined): string {
    return role ? LABELS[role] : '';
  }
}
