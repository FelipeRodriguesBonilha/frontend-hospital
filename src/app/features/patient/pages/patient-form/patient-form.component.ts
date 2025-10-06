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
import { ReturnPatient } from '../../../../core/models/patient/return-patient.model';
import { ReturnUser } from '../../../../core/models/user/return-user.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { HospitalService } from '../../../../core/services/hospital/hospital.service';
import { PatientService } from '../../../../core/services/patient/patient.service';

@Component({
  selector: 'app-patient-form',
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
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.css'
})
export class PatientFormComponent {
  user!: ReturnUser;
  patientForm!: FormGroup;
  patientId: string | null = null;
  isEditMode = false;
  isAdminGeral = false;

  hospitals: ReturnHospital[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private authService: AuthService,
    private hospitalService: HospitalService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.patientId = this.route.snapshot.paramMap.get('patientId');
        this.isEditMode = !!this.patientId;


        this.user = user;
        this.isAdminGeral = user.role.name === 'AdminGeral';


        this.patientForm = this.fb.group({
          hospitalId: ['', this.isAdminGeral ? [Validators.required] : []],
          name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
          cpf: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
          phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(11)]],
          email: ['', [Validators.required, Validators.email]],
          address: ['', [Validators.minLength(3), Validators.maxLength(100)]]
        });

        if (this.isAdminGeral) this.loadHospitals();
        if (this.isEditMode) this.loadPatient(this.patientId!);
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

  loadPatient(id: string): void {
    this.patientService.findPatientById(id).subscribe({
      next: (patient: ReturnPatient) => {
        this.patientForm.patchValue({
          hospitalId: patient.hospitalId,
          name: patient.name,
          cpf: patient.cpf,
          phone: patient.phone,
          email: patient.email,
          address: patient.address,
        });
      },
      error: (err: HttpErrorResponse) => this.showError(err)
    });
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    const formValue = {
      ...this.patientForm.value,
      hospitalId: this.isAdminGeral ? this.patientForm.get('hospitalId')?.value : this.user.hospitalId
    };

    if (this.isEditMode && this.patientId) {
      let updateDto = formValue;

      if (!this.isAdminGeral) {
        const { hospitalId, ...rest } = formValue;
        updateDto = rest;
      }

      this.patientService.updatePatient(this.patientId, updateDto).subscribe({
        next: () => this.router.navigate(['/patients']),
        error: (err: HttpErrorResponse) => this.showError(err)
      });
    } else {
      this.patientService.createPatient(formValue).subscribe({
        next: () => this.router.navigate(['/patients']),
        error: (err: HttpErrorResponse) => this.showError(err)
      });
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
    this.router.navigate(['/patients']);
  }
}
