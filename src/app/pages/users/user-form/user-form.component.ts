import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReturnHospital } from '../../../core/models/hospital/return-hospital';
import { ReturnRole } from '../../../core/models/role/return-role';
import { HospitalService } from '../../../core/services/hospital/hospital.service';
import { RoleService } from '../../../core/services/role/role.service';
import { UserService } from '../../../core/services/user/user.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ReturnUser } from '../../../core/models/user/return-user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.isEditMode = !!this.userId;

    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;
        this.isAdminGeral = user.role.name === 'AdminGeral';
      }
    });

    this.userForm = this.fb.group({
      hospitalId: ['', this.isAdminGeral ? [Validators.required] : []],
      name: ['', Validators.required],
      cpf: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', this.isEditMode ? [] : [Validators.required]],
      roleId: ['', Validators.required],
    });

    if(this.isAdminGeral) this.loadHospitals();
    this.loadRoles();

    if (this.isEditMode) {
      this.loadUser(this.userId!);
    }
  }

  loadHospitals() {
    this.hospitalService.findAllHospitals().subscribe({
      next: (hospitals: ReturnHospital[]) => {
        this.hospitals = hospitals;
      },
      error: () => {

      }
    })
  }

  loadRoles() {
    this.roleService.findAllRoles().subscribe({
      next: (roles: ReturnRole[]) => {
        this.roles = roles;
      },
      error: () => {

      }
    })
  }

  private loadUser(id: string): void {
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
      error: (err) => {
        console.error('Erro ao carregar usuário:', err);
        alert('Usuário não encontrado!');
        this.router.navigate(['/users']);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = {
      ...this.userForm.value,
      hospitalId: this.isAdminGeral ? this.userForm.get('hospitalId')?.value : this.user.hospitalId
    };

    if (this.isEditMode && this.userId) {
      const { password, ...updateDto } = formValue;

      this.userService.updateUser(this.userId, updateDto).subscribe({
        next: () => this.router.navigate(['/users']),
        error: (err) => console.error('Erro ao atualizar:', err)
      });
    } else {
      this.userService.createUser(formValue).subscribe({
        next: () => this.router.navigate(['/users']),
        error: (err) => console.error('Erro ao criar:', err)
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}
