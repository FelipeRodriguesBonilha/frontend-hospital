import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { HospitalService } from '../../../../core/services/hospital/hospital.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-hospital-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatSnackBarModule,
    NgxMaskDirective,
    LoadingComponent
  ],
  templateUrl: './hospital-form.component.html',
  styleUrls: ['./hospital-form.component.css'],
  providers: [provideNgxMask({ dropSpecialCharacters: true })],
})
export class HospitalFormComponent implements OnInit {
  hospitalForm!: FormGroup;
  hospitalId: string | null = null;
  isEditMode = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private hospitalService: HospitalService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.hospitalId = this.route.snapshot.paramMap.get('hospitalId');
    this.isEditMode = !!this.hospitalId;

    this.hospitalForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      cnpj: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      phone: ['', [Validators.minLength(10), Validators.maxLength(11)]],
    });

    if (this.isEditMode) {
      this.loadHospital(this.hospitalId!);
    }
  }

  private loadHospital(id: string): void {
    this.isLoading = true;
    this.hospitalService.findHospitalById(id).subscribe({
      next: hospital => {
        this.hospitalForm.patchValue({
          companyName: hospital.companyName,
          cnpj: hospital.cnpj,
          phone: hospital.phone,
        });
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.showError(err)
        this.router.navigate(['/hospitals']);
      }
    });
  }

  onSubmit(): void {
    if (this.hospitalForm.invalid) {
      this.hospitalForm.markAllAsTouched();
      return;
    }

    const formValue = this.hospitalForm.value;

    this.isLoading = true;

    if (this.isEditMode && this.hospitalId) {
      this.hospitalService.updateHospital(this.hospitalId, formValue).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/hospitals']);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.showError(err);
        }
      });
    } else {
      this.hospitalService.createHospital(formValue).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/hospitals']);
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
    this.router.navigate(['/hospitals']);
  }
}
