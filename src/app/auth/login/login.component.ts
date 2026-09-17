import { ChangeDetectorRef, Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models';

const HOME_BY_ROLE: Record<Role, string> = {
  admin: '/admin',
  teacher: '/teacher',
  dean: '/dean',
  student: '/student',
};

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  form: UntypedFormGroup;
  submitting = false;
  errorMessage = '';

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.errorMessage = '';
    const { email, password } = this.form.value;

    this.auth.login(email, password).subscribe({
      next: (user) => {
        this.submitting = false;
        this.router.navigate([HOME_BY_ROLE[user.role]]);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.message || 'Не вдалося увійти. Перевірте дані.';
        this.cdr.detectChanges();
      },
    });
  }
}
