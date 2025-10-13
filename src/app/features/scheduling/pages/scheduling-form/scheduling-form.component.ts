import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Role } from '../../../../core/enums/role.enum';
import { ReturnHospital } from '../../../../core/models/hospital/return-hospital.model';
import { ReturnPaginated } from '../../../../core/models/pagination/return-paginated.model';
import { ReturnPatient } from '../../../../core/models/patient/return-patient.model';
import { ReturnScheduling } from '../../../../core/models/scheduling/return-scheduling.model';
import { ReturnUser } from '../../../../core/models/user/return-user.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { HospitalService } from '../../../../core/services/hospital/hospital.service';
import { PatientService } from '../../../../core/services/patient/patient.service';
import { SchedulingService } from '../../../../core/services/scheduling/scheduling.service';
import { UserService } from '../../../../core/services/user/user.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-scheduling-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatSnackBarModule,
    LoadingComponent
  ],
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
  isLoading = false;

  hospitals: ReturnHospital[] = [];
  medics: ReturnUser[] = [];
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
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;
        this.isAdminGeral = user.role.name === 'AdminGeral';

        this.schedulingId = this.route.snapshot.paramMap.get('schedulingId');
        this.isEditMode = !!this.schedulingId;

        this.schedulingForm = this.fb.group({
          hospitalId: ['', this.isAdminGeral ? [Validators.required] : []],
          providerId: ['', [Validators.required]],
          patientId: ['', [Validators.required]],
          observation: ['', [Validators.minLength(3), Validators.maxLength(100)]],
          startDate: ['', [Validators.required]],
          endDate: ['', [Validators.required]],
        });

        if (this.isAdminGeral) {
          this.loadHospitals();

          this.schedulingForm.get('hospitalId')?.valueChanges.subscribe((hospitalId) => {
            if (hospitalId) {
              this.loadUsersByRole(hospitalId, [Role.Medico], 'medics');
              this.loadPatients(hospitalId);
            } else {
              this.medics = [];
              this.patients = [];
            }

            this.schedulingForm.patchValue({
              providerId: '',
              patientId: ''
            });
          });
        } else {
          this.loadUsersByRole(this.user.hospitalId, [Role.Medico], 'medics');
          this.loadPatients(this.user.hospitalId);
        }

        if (this.isEditMode) {
          this.loadScheduling(this.schedulingId!);
        }
      }
    });
  }


  loadHospitals() {
    this.isLoading = true;
    this.hospitalService.findAllHospitals({}).subscribe({
      next: (response: ReturnPaginated<ReturnHospital>) => {
        this.hospitals = response.data;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.showError(err);
      }
    })
  }

  loadUsersByRole(
    hospitalId: string,
    roles: string[],
    target: 'medics'
  ) {
    this.isLoading = true;
    this.userService.findUsersByHospital(hospitalId, { roles: roles }).subscribe({
      next: (response: ReturnPaginated<ReturnUser>) => {
        this[target] = response.data;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.showError(err);
      }
    });
  }

  loadPatients(hospitalId: string) {
    this.isLoading = true;
    this.patientService.findPatientsByHospital(hospitalId, {}).subscribe({
      next: (response: ReturnPaginated<ReturnPatient>) => {
        this.patients = response.data;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.showError(err);
      }
    })
  }

  loadScheduling(id: string): void {
    this.isLoading = true;
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
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.showError(err)
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

    this.isLoading = true;

    if (this.isEditMode && this.schedulingId) {
      let updateDto = formValue;

      if (!this.isAdminGeral) {
        const { hospitalId, ...rest } = formValue;
        updateDto = rest;
      }

      this.schedulingService.updateScheduling(this.schedulingId, updateDto).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/schedulings']);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.showError(err);
        }
      });
    } else {
      this.schedulingService.createScheduling(formValue).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/schedulings']);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.showError(err);
        }
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
    this.router.navigate(['/schedulings']);
  }
}
