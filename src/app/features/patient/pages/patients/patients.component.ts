import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ReturnPaginated } from '../../../../core/models/pagination/return-paginated.model';
import { ReturnPatient } from '../../../../core/models/patient/return-patient.model';
import { ReturnUser } from '../../../../core/models/user/return-user.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { PatientService } from '../../../../core/services/patient/patient.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { CpfPipe } from '../../../../shared/pipes/cpf.pipe';
import { PhonePipe } from '../../../../shared/pipes/phone.pipe';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    MatMenuModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatPaginatorModule,
    CpfPipe,
    PhonePipe
  ],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class PatientsComponent {
  user!: ReturnUser;
  patients: ReturnPatient[] = [];
  filteredPatients: ReturnPatient[] = [];
  searchControl = new FormControl('');

  rolesLoadUsers = ["AdminGeral"];
  rolesLoadUsersByHospital = ["AdminHospital", "Recepcionista"];

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;

        if (this.rolesLoadUsers.includes(user.role.name)) this.loadPatients();
        else if (this.rolesLoadUsersByHospital.includes(user.role.name)) this.loadPatientsByHospital();
        else {
          this.patients = [];
          this.filteredPatients = [];
        }
      }
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        this.pageIndex = 0;
        if (this.rolesLoadUsers.includes(this.user.role.name)) {
          return this.patientService.findAllPatients({
            name: term || '',
            page: this.pageIndex + 1,
            limit: this.pageSize
          });
        } else if (this.rolesLoadUsersByHospital.includes(this.user.role.name)) {
          return this.patientService.findPatientsByHospital(this.user.hospitalId, {
            name: term || '',
            page: this.pageIndex + 1,
            limit: this.pageSize
          });
        } else {
          return [];
        }
      })
    ).subscribe({
      next: (response: ReturnPaginated<ReturnPatient>) => {
        this.patients = response.data;
        this.filteredPatients = response.data;
        this.totalItems = response.total;
        this.pageIndex = response.page - 1;
        this.pageSize = response.limit;
      },
      error: (err: HttpErrorResponse) => this.showError(err)
    });
  }

  loadPatients() {
    this.patientService.findAllPatients({
      name: this.searchControl.value || '',
      page: this.pageIndex + 1,
      limit: this.pageSize
    }).subscribe({
      next: (response: ReturnPaginated<ReturnPatient>) => {
        this.patients = response.data;
        this.filteredPatients = response.data;
        this.totalItems = response.total;
        this.pageIndex = response.page - 1;
        this.pageSize = response.limit;
      },
      error: (err: HttpErrorResponse) => this.showError(err)
    });
  }

  loadPatientsByHospital() {
    this.patientService.findPatientsByHospital(this.user.hospitalId!, {
      name: this.searchControl.value || '',
      page: this.pageIndex + 1,
      limit: this.pageSize
    }).subscribe({
      next: (response: ReturnPaginated<ReturnPatient>) => {
        this.patients = response.data;
        this.filteredPatients = response.data;
        this.totalItems = response.total;
        this.pageIndex = response.page - 1;
        this.pageSize = response.limit;
      },
      error: (err: HttpErrorResponse) => this.showError(err)
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    if (this.rolesLoadUsers.includes(this.user.role.name)) {
      this.loadPatients();
    } else if (this.rolesLoadUsersByHospital.includes(this.user.role.name)) {
      this.loadPatientsByHospital();
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

  deletePatient(patient: ReturnPatient) {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '400px',
      data: { message: `Tem certeza que deseja excluir o paciente "${patient.name}"?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patientService.deletePatient(patient.id).subscribe({
          next: () => {
            this.snackBar.open('Paciente excluído com sucesso.', 'Fechar', {
              duration: 3000,
              verticalPosition: 'top'
            });

            if (this.rolesLoadUsers.includes(this.user.role.name)) this.loadPatients();
            else if (this.rolesLoadUsersByHospital.includes(this.user.role.name)) this.loadPatientsByHospital();
            else {
              this.patients = [];
              this.filteredPatients = [];
            }
          },
          error: (err: HttpErrorResponse) => this.showError(err)
        });
      }
    });
  }
}