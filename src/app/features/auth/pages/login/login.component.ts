import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { Role } from '../../../../core/enums/role.enum';
import { LoginPayload } from '../../../../core/models/auth/login-payload.model';
import { ReturnLogin } from '../../../../core/models/auth/return-login.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatSnackBarModule,
    LoadingComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword: boolean = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.isLoading = true;
    this.authService.login((this.loginForm.value) as LoginPayload).subscribe({
      next: (login: ReturnLogin) => {
        this.isLoading = false;
        if (login.user.role.name as Role === Role.AdministradorGeral) {
          this.router.navigate(['/hospitals'])
        } else if (
          login.user.role.name as Role === Role.AdministradorHospital ||
          login.user.role.name as Role === Role.Recepcionista ||
          login.user.role.name as Role === Role.Medico
        ) {
          this.router.navigate(['/chat'])
        }
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err?.error?.message || 'Erro inesperado. Tente novamente.';

        this.snackBar.open(errorMessage, 'Fechar', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['mat-warn']
        });
      }
    })
  }
}
