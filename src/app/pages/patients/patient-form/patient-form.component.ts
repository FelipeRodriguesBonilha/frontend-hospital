import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReturnPatient } from '../../../core/models/patient/return-patient';
import { PatientService } from '../../../core/services/patient/patient.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ReturnUser } from '../../../core/models/user/return-user.model';
import { HospitalService } from '../../../core/services/hospital/hospital.service';
import { ReturnHospital } from '../../../core/models/hospital/return-hospital';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
    private hospitalService: HospitalService
  ) { }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('patientId');
    this.isEditMode = !!this.patientId;

    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;
        this.isAdminGeral = user.role.name === 'AdminGeral';
      }
    });

    this.patientForm = this.fb.group({
      hospitalId: ['', this.isAdminGeral ? [Validators.required] : []],
      name: ['', Validators.required],
      cpf: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.required],
      address: [''],
    });

    if (this.isAdminGeral) this.loadHospitals();
    if (this.isEditMode) this.loadPatient(this.patientId!);
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
      error: (err) => {
        console.error('Erro ao carregar paciente:', err);
        alert('Paciente não encontrado!');
        this.router.navigate(['/patients']);
      }
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
      this.patientService.updatePatient(this.patientId, formValue).subscribe({
        next: () => this.router.navigate(['/patients']),
        error: (err) => console.error('Erro ao atualizar:', err)
      });
    } else {
      this.patientService.createPatient(formValue).subscribe({
        next: () => this.router.navigate(['/patients']),
        error: (err) => console.error('Erro ao criar:', err)
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/patients']);
  }
}
