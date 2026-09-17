import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { StudentService } from '../../core/services/student.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-classmates-list',
  standalone: false,
  templateUrl: './classmates-list.component.html',
  styleUrl: './classmates-list.component.scss',
})
export class ClassmatesListComponent implements OnInit {
  displayedColumns = ['lastName', 'email', 'phone', 'subgroup'];
  classmates: User[] = [];
  currentUserId: number | null = null;

  constructor(
    private readonly auth: AuthService,
    private readonly studentService: StudentService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const student = this.auth.currentUser;
    if (!student?.groupId) {
      return;
    }
    this.currentUserId = student.id;
    this.studentService.getByGroup(student.groupId).subscribe((students) => {
      this.classmates = students.sort((a, b) => a.lastName.localeCompare(b.lastName));
      this.cdr.detectChanges();
    });
  }
}
