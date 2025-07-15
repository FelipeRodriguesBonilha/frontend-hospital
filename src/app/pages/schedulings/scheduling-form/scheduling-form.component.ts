import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReturnHospital } from '../../../core/models/hospital/return-hospital';
import { ReturnUser } from '../../../core/models/user/return-user.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user/user.service';
import { HospitalService } from '../../../core/services/hospital/hospital.service';
import { SchedulingService } from '../../../core/services/scheduling/scheduling.service';
import { ReturnScheduling } from '../../../core/models/scheduling/return-scheduling';
import { CommonModule, DatePipe } from '@angular/common';
import { PatientService } from '../../../core/services/patient/patient.service';
import { ReturnPatient } from '../../../core/models/patient/return-patient';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-scheduling-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './scheduling-form.component.html',
  styleUrl: './scheduling-form.component.css',
  providers: [DatePipe]
})
export class SchedulingFormComponent {
  user!: ReturnUser;
  schedulingForm!: FormGroup;
  schedulingId: string | null = null;
  isEditMode = false;
  isAdminGeral = false;

  hospitals: ReturnHospital[] = [];
  users: ReturnUser[] = [];
  patients: ReturnPatient[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private schedulingService: SchedulingService,
    private userService: UserService,
    private hospitalService: HospitalService,
    private patientService: PatientService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.schedulingId = this.route.snapshot.paramMap.get('schedulingId');
    this.isEditMode = !!this.schedulingId;

    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;
        this.isAdminGeral = user.role.name === 'AdminGeral';
      }
    });

    this.schedulingForm = this.fb.group({
      hospitalId: ['', this.isAdminGeral ? [Validators.required] : []],
      createdById: ['', Validators.required],
      providerId: ['', Validators.required],
      patientId: ['', Validators.required],
      observation: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });

    if (this.isAdminGeral) this.loadHospitals();
    this.loadUsers();
    this.loadPatients();

    if (this.isEditMode) {
      this.loadScheduling(this.schedulingId!);
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

  loadUsers() {
    this.userService.findAllUsers().subscribe({
      next: (users: ReturnUser[]) => {
        this.users = users;
      },
      error: () => {

      }
    })
  }

  loadPatients() {
    this.patientService.findAllPatients().subscribe({
      next: (patients: ReturnPatient[]) => {
        this.patients = patients;
      },
      error: () => {

      }
    })
  }

  loadScheduling(id: string): void {
    this.schedulingService.findSchedulingById(id).subscribe({
      next: (scheduling: ReturnScheduling) => {
        this.schedulingForm.patchValue({
          hospitalId: scheduling.hospitalId,
          createdById: scheduling.createdById,
          providerId: scheduling.providerId,
          patientId: scheduling.patientId,
          observation: scheduling.observation,
          startDate: this.datePipe.transform(scheduling.startDate, 'yyyy-MM-ddTHH:mm'),
          endDate: this.datePipe.transform(scheduling.endDate, 'yyyy-MM-ddTHH:mm'),
        });
      },
      error: (err) => {
        console.error('Erro ao carregar usuário:', err);
        alert('Usuário não encontrado!');
        this.router.navigate(['/schedulings']);
      }
    });
  }

  onSubmit(): void {
    if (this.schedulingForm.invalid) {
      this.schedulingForm.markAllAsTouched();
      return;
    }

    const formValue = {
      ...this.schedulingForm.value,
      startDate: new Date(this.schedulingForm.value.startDate).toISOString(),
      endDate: new Date(this.schedulingForm.value.endDate).toISOString(),
      hospitalId: this.isAdminGeral ? this.schedulingForm.get('hospitalId')?.value : this.user.hospitalId
    };

    if (this.isEditMode && this.schedulingId) {
      this.schedulingService.updateScheduling(this.schedulingId, formValue).subscribe({
        next: () => this.router.navigate(['/schedulings']),
        error: (err) => console.error('Erro ao atualizar:', err)
      });
    } else {
      this.schedulingService.createScheduling(formValue).subscribe({
        next: () => this.router.navigate(['/schedulings']),
        error: (err) => console.error('Erro ao criar:', err)
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/schedulings']);
  }
}
