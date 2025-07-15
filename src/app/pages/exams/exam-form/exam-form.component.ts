import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReturnExam } from '../../../core/models/exam/return-exam';
import { ReturnHospital } from '../../../core/models/hospital/return-hospital';
import { ReturnPatient } from '../../../core/models/patient/return-patient';
import { ReturnUser } from '../../../core/models/user/return-user.model';
import { ExamService } from '../../../core/services/exam/exam.service';
import { HospitalService } from '../../../core/services/hospital/hospital.service';
import { PatientService } from '../../../core/services/patient/patient.service';
import { UserService } from '../../../core/services/user/user.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-exam-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './exam-form.component.html',
  styleUrl: './exam-form.component.css'
})
export class ExamFormComponent {
  user!: ReturnUser;
  examForm!: FormGroup;
  examId: string | null = null;
  isEditMode = false;
  isAdminGeral = false;

  hospitals: ReturnHospital[] = [];
  users: ReturnUser[] = [];
  patients: ReturnPatient[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private userService: UserService,
    private hospitalService: HospitalService,
    private patientService: PatientService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('examId');
    this.isEditMode = !!this.examId;

    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;
        this.isAdminGeral = user.role.name === 'AdminGeral';
      }
    });

    this.examForm = this.fb.group({
      hospitalId: ['', this.isAdminGeral ? [Validators.required] : []],
      createdById: ['', Validators.required],
      providerId: ['', Validators.required],
      patientId: ['', Validators.required],
      description: ['', Validators.required],
    });

    if(this.isAdminGeral) this.loadHospitals();
    this.loadUsers(this.user.hospitalId);
    this.loadPatients(this.user.hospitalId);

    if (this.isEditMode) {
      this.loadExam(this.examId!);
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

  loadUsers(hospitalId: string) {
    this.userService.findUsersByHospital(hospitalId).subscribe({
      next: (users: ReturnUser[]) => {
        this.users = users;
      },
      error: () => {

      }
    })
  }

  loadPatients(hospitalId: string) {
    this.patientService.findPatientsByHospital(hospitalId).subscribe({
      next: (patients: ReturnPatient[]) => {
        this.patients = patients;
      },
      error: () => {

      }
    })
  }

  loadExam(id: string): void {
    this.examService.findExamById(id).subscribe({
      next: (exam: ReturnExam) => {
        this.examForm.patchValue({
          hospitalId: exam.hospitalId,
          createdById: exam.createdById,
          providerId: exam.providerId,
          patientId: exam.patientId,
          description: exam.description
        });
      },
      error: (err) => {
        console.error('Erro ao carregar exame:', err);
        alert('Exame não encontrado!');
        this.router.navigate(['/exams']);
      }
    });
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

    if (this.isEditMode && this.examId) {
      this.examService.updateExam(this.examId, formValue).subscribe({
        next: () => this.router.navigate(['/exams']),
        error: (err) => console.error('Erro ao atualizar:', err)
      });
    } else {
      this.examService.createExam(formValue).subscribe({
        next: () => this.router.navigate(['/exams']),
        error: (err) => console.error('Erro ao criar:', err)
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/exams']);
  }
}
