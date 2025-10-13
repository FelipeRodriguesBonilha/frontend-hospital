import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Role } from '../../../../core/enums/role.enum';
import { ReturnExam } from '../../../../core/models/exam/return-exam.model';
import { ReturnHospital } from '../../../../core/models/hospital/return-hospital.model';
import { ReturnPaginated } from '../../../../core/models/pagination/return-paginated.model';
import { ReturnPatient } from '../../../../core/models/patient/return-patient.model';
import { ReturnUser } from '../../../../core/models/user/return-user.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { ExamService } from '../../../../core/services/exam/exam.service';
import { HospitalService } from '../../../../core/services/hospital/hospital.service';
import { PatientService } from '../../../../core/services/patient/patient.service';
import { UserService } from '../../../../core/services/user/user.service';
import { ArchiveService } from '../../../../core/services/archive/archive.service';
import { ReturnArchive } from '../../../../core/models/archive/return-archive.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-exam-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatSnackBarModule,
    LoadingComponent
  ],
  templateUrl: './exam-form.component.html',
  styleUrls: ['./exam-form.component.css']
})
export class ExamFormComponent implements OnInit, OnDestroy {
  user!: ReturnUser;
  examForm!: FormGroup;
  examId: string | null = null;
  isEditMode = false;
  isAdminGeral = false;

  hospitals: ReturnHospital[] = [];
  medics: ReturnUser[] = [];
  patients: ReturnPatient[] = [];

  previewUrl: string | null = null;
  selectedFile: File | null = null;
  archive!: ReturnArchive | null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private userService: UserService,
    private hospitalService: HospitalService,
    private patientService: PatientService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private archiveService: ArchiveService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (!user) return;

      this.user = user;
      this.isAdminGeral = user.role.name === 'AdminGeral';

      this.examId = this.route.snapshot.paramMap.get('examId');
      this.isEditMode = !!this.examId;

      this.examForm = this.fb.group({
        hospitalId: ['', this.isAdminGeral ? [Validators.required] : []],
        providerId: ['', [Validators.required]],
        patientId: ['', [Validators.required]],
        description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]]
      });

      if (this.isAdminGeral) {
        this.loadHospitals();
        this.examForm.get('hospitalId')?.valueChanges.subscribe((hospitalId) => {
          if (hospitalId) {
            this.loadUsersByRole(hospitalId, [Role.Medico], 'medics');
            this.loadPatients(hospitalId);
          } else {
            this.medics = [];
            this.patients = [];
          }

          this.examForm.patchValue({
            providerId: '',
            patientId: ''
          });
        });
      } else {
        this.loadUsersByRole(this.user.hospitalId, [Role.Medico], 'medics');
        this.loadPatients(this.user.hospitalId);
      }

      if (this.isEditMode) {
        this.loadExam(this.examId!);
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
      error: (err) => {
        this.isLoading = false;
        this.showError(err);
      }
    });
  }

  loadUsersByRole(hospitalId: string, roles: string[], target: 'medics') {
    this.isLoading = true;
    this.userService.findUsersByHospital(hospitalId, { roles }).subscribe({
      next: (response: ReturnPaginated<ReturnUser>) => {
        this[target] = response.data;
        this.isLoading = false;
      },
      error: (err) => {
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
      error: (err) => {
        this.isLoading = false;
        this.showError(err);
      }
    });
  }

  loadExam(id: string): void {
    this.isLoading = true;
    this.examService.findExamById(id).subscribe({
      next: (exam: ReturnExam) => {
        this.examForm.patchValue({
          hospitalId: exam.hospitalId,
          providerId: exam.providerId,
          patientId: exam.patientId,
          description: exam.description
        });

        this.archive = exam?.archive || null;

        if (exam.archiveId && exam.archive?.name) {
          this.archiveService.getImage(exam.archive.name).subscribe({
            next: (blob) => {
              if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(this.previewUrl);
              }
              const url = URL.createObjectURL(blob);
              this.previewUrl = url;
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Erro ao carregar imagem/PDF:', err);
              this.isLoading = false;
            }
          });
        } else {
          this.previewUrl = null;
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(err);
        this.router.navigate(['/exams']);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.previewUrl);
      }

      this.selectedFile = input.files[0];

      this.archive = null;

      const url = URL.createObjectURL(this.selectedFile);
      this.previewUrl = url;
    }
  }

  get fileRequiredError(): boolean {
    return !this.selectedFile && !this.isEditMode;
  }

  onSubmit(): void {
    if (this.examForm.invalid) {
      this.examForm.markAllAsTouched();
      return;
    }

    const formValue = {
      ...this.examForm.value,
      hospitalId: this.isAdminGeral ? this.examForm.get('hospitalId')?.value : this.user.hospitalId
    };

    const formData = new FormData();
    Object.keys(formValue).forEach((key) => {
      const value = (formValue as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });

    if (this.selectedFile) formData.append('arquivo', this.selectedFile);

    this.isLoading = true;

    if (this.isEditMode && this.examId) {
      if (!this.isAdminGeral) {
        formData.delete('hospitalId');
      }

      this.examService.updateExam(this.examId, formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/exams']);
        },
        error: (err) => {
          this.isLoading = false;
          this.showError(err);
        }
      });
    } else {
      this.examService.createExam(formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/exams']);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.showError(err);
        }
      });
    }
  }

  typeArchive(type: string | undefined): 'image' | 'pdf' | 'other' {
    if (!type) return 'other';
    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf' || type.toLowerCase().includes('pdf')) return 'pdf';
    return 'other';
  }

  typeFromPreviewUrl(url: string): 'image' | 'pdf' | 'other' {
    if (!url) return 'other';
    if (url.startsWith('data:')) {
      const mime = url.slice(5).split(';', 1)[0];
      return this.typeArchive(mime);
    }
    if (url.endsWith('.pdf')) return 'pdf';
    return 'other';
  }

  getPreviewType(): 'image' | 'pdf' | 'other' {
    if (this.selectedFile?.type) return this.typeArchive(this.selectedFile.type);
    if (this.archive?.type) return this.typeArchive(this.archive.type);
    if (this.previewUrl) return this.typeFromPreviewUrl(this.previewUrl);
    return 'other';
  }

  ngOnDestroy(): void {
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }

  showError(err: HttpErrorResponse) {
    const errorMessage = (err?.error as any)?.message || 'Erro inesperado. Tente novamente.';
    this.snackBar.open(errorMessage, 'Fechar', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['mat-warn']
    });
  }

  onCancel(): void {
    this.router.navigate(['/exams']);
  }
}