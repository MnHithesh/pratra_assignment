import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, map } from 'rxjs';

import { ApiError } from '../../../core/http/api-error';
import { AuthService } from '../../../core/services/auth.service';
import { matchFieldsValidator } from '../../../shared/validators/match-fields.validator';
import { safeReturnUrl } from '../return-url';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './signup.component.html',
  styleUrl: '../auth-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly returnUrl = toSignal(
    this.route.queryParamMap.pipe(map(params => safeReturnUrl(params.get('returnUrl')))),
    { initialValue: '/' },
  );

  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.maxLength(60)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: matchFieldsValidator('password', 'confirmPassword') },
  );

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.serverError.set(null);

    this.auth
      .signup({ name: name.trim(), email: email.trim(), password })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl(this.returnUrl()),
        error: (error: ApiError) => this.serverError.set(error.message),
      });
  }
}
