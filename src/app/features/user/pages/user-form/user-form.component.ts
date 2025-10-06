import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ReturnHospital } from '../../../../core/models/hospital/return-hospital.model';
import { ReturnPaginated } from '../../../../core/models/pagination/return-paginated.model';
import { ReturnRole } from '../../../../core/models/role/return-role.model';
import { ReturnUser } from '../../../../core/models/user/return-user.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { HospitalService } from '../../../../core/services/hospital/hospital.service';
import { RoleService } from '../../../../core/services/role/role.service';
import { SocketService } from '../../../../core/services/socket/socket.service';
import { UserService } from '../../../../core/services/user/user.service';

@Component({
  selector: 'app-user-form',
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
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent {
  user!: ReturnUser;
  userForm!: FormGroup;
  userId: string | null = null;
  isEditMode = false;
  isAdminGeral = false;

  hospitals: ReturnHospital[] = [];
  roles: ReturnRole[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private hospitalService: HospitalService,
    private roleService: RoleService,
    private authService: AuthService,
    private socketService: SocketService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userId = this.route.snapshot.paramMap.get('userId');
        this.isEditMode = !!this.userId;

        this.socketService.onUserCreated((user) => {
          this.snackBar.open('Usuário criado com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/users']);
        });

        this.socketService.onUserUpdated((updatedUser: ReturnUser) => {
          if (user.id === updatedUser.id) {
            this.authService.updateCurrentUser(updatedUser);
          }

          this.snackBar.open('Usuário atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/users']);
        });

        this.user = user;
        this.isAdminGeral = user.role.name === 'AdminGeral';


        this.userForm = this.fb.group({
          hospitalId: ['', this.isAdminGeral ? [Validators.required] : []],
          name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
          cpf: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
          phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(11)]],
          email: ['', [Validators.required, Validators.email]],
          password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
          roleId: ['', [Validators.required]],
        });

        if (this.isAdminGeral) this.loadHospitals();
        this.loadRoles();

        if (this.isEditMode) {
          this.loadUser(this.userId!);
        }
      }
    });
  }

  loadHospitals() {
    this.hospitalService.findAllHospitals({}).subscribe({
      next: (response: ReturnPaginated<ReturnHospital>) => {
        this.hospitals = response.data;
      },
      error: (err: HttpErrorResponse) => this.showError(err)
    })
  }

  loadRoles() {
    this.roleService.findAllRoles().subscribe({
      next: (roles: ReturnRole[]) => {
        this.roles = roles;
      },
      error: (err: HttpErrorResponse) => this.showError(err)
    })
  }

  loadUser(id: string): void {
    this.userService.findUserById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          hospitalId: user.hospitalId,
          name: user.name,
          cpf: user.cpf,
          phone: user.phone,
          email: user.email,
          roleId: user.roleId
        });
      },
      error: (err: HttpErrorResponse) => {
        this.showError(err)
        this.router.navigate(['/users']);
      }
    });
  }

  get shouldShowHospitalField(): boolean {
    const roleId = this.userForm?.get('roleId')?.value;
    if (!roleId) return false;

    const selectedRole = this.roles.find((r) => r.id === roleId);
    return selectedRole?.name !== 'AdminGeral';
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = { ...this.userForm.value };

    const selectedRole = this.roles.find((r) => r.id === formValue.roleId);

    if (selectedRole?.name === 'AdminGeral') {
      delete formValue.hospitalId;
    }

    if (!this.isAdminGeral) {
      formValue.hospitalId = this.user.hospitalId;
    }

    let dto = { ...formValue };

    if (!this.isAdminGeral && this.isEditMode) {
      const { password, hospitalId, ...rest } = formValue;
      dto = rest;
    } else if (this.isAdminGeral && this.isEditMode) {
      const { password, ...rest } = formValue;
      dto = rest;
    }

    if (this.isEditMode && this.userId) {
      this.socketService.updateUser(this.userId, dto);
    } else {
      this.socketService.createUser(dto);
    }
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

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}
