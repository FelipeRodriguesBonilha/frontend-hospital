import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HospitalService } from '../../../core/services/hospital/hospital.service';

@Component({
  selector: 'app-hospital-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './hospital-form.component.html',
  styleUrls: ['./hospital-form.component.css']
})
export class HospitalFormComponent implements OnInit {
  hospitalForm!: FormGroup;
  hospitalId: string | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private hospitalService: HospitalService
  ) { }

  ngOnInit(): void {
    this.hospitalId = this.route.snapshot.paramMap.get('hospitalId');
    this.isEditMode = !!this.hospitalId;

    this.hospitalForm = this.fb.group({
      companyName: ['', Validators.required],
      cnpj: ['', Validators.required],
      phone: ['', Validators.required],
    });

    if (this.isEditMode) {
      this.loadHospital(this.hospitalId!);
    }
  }

  private loadHospital(id: string): void {
    this.hospitalService.findHospitalById(id).subscribe({
      next: hospital => {
        this.hospitalForm.patchValue({
          companyName: hospital.companyName,
          cnpj: hospital.cnpj,
          phone: hospital.phone,
        });
      },
      error: (err) => {
        console.error('Erro ao carregar hospital:', err);
        alert('Hospital não encontrado!');
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

    if (this.isEditMode && this.hospitalId) {
      this.hospitalService.updateHospital(this.hospitalId, formValue).subscribe({
        next: () => this.router.navigate(['/hospitals']),
        error: (err) => console.error('Erro ao atualizar:', err)
      });
    } else {
      this.hospitalService.createHospital(formValue).subscribe({
        next: () => this.router.navigate(['/hospitals']),
        error: (err) => console.error('Erro ao criar:', err)
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/hospitals']);
  }
}
