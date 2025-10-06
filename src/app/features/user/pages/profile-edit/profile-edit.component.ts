import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ReturnUser } from '../../../../core/models/user/return-user.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { SocketService } from '../../../../core/services/socket/socket.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatSnackBarModule,
    NgxMaskDirective
  ],
  providers: [provideNgxMask({ dropSpecialCharacters: true })],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent {
  user!: ReturnUser;
  profileForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private socketService: SocketService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;

        this.profileForm = this.fb.group({
          name: [user.name, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
          cpf: [user.cpf, [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
          phone: [user.phone, [Validators.required, Validators.minLength(10), Validators.maxLength(11)]],
          email: [user.email, [Validators.required, Validators.email]]
        });

        this.socketService.onUserUpdated((updatedUser: ReturnUser) => {
          this.authService.updateCurrentUser(updatedUser);
          this.snackBar.open('Perfil atualizado com sucesso!', 'Fechar', { duration: 3000 });
        });
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const updateDto = this.profileForm.value;
    this.socketService.updateProfile(updateDto);

    this.router.navigate(['/']);
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }

  showError(err: HttpErrorResponse) {
    const errorMessage = err?.error?.message || 'Erro inesperado. Tente novamente.';
    this.snackBar.open(errorMessage, 'Fechar', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['mat-warn']
    });
  }
}