import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ReturnPatient } from '../../core/models/patient/return-patient';
import { ReturnUser } from '../../core/models/user/return-user.model';
import { AuthService } from '../../core/services/auth/auth.service';
import { PatientService } from '../../core/services/patient/patient.service';

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
    MatButtonModule
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

  constructor(
    private patientService: PatientService,
    private authService: AuthService
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
        if (this.rolesLoadUsers.includes(this.user.role.name)) {
          return this.patientService.findAllPatients(term || '');
        } else if (this.rolesLoadUsersByHospital.includes(this.user.role.name)) {
          return this.patientService.findPatientsByHospital(this.user.hospitalId, term || '');
        } else {
          return [];
        }
      })
    ).subscribe({
      next: (patients: ReturnPatient[]) => {
        this.patients = patients;
        this.filteredPatients = patients;
      },
      error: (err) => console.error('Erro na busca de usuários:', err)
    });
  }

  loadPatients(term: string = '') {
    this.patientService.findAllPatients(term).subscribe({
      next: (patients: ReturnPatient[]) => {
        this.patients = patients;
        this.filteredPatients = patients;
      }
    });
  }

  loadPatientsByHospital(term: string = '') {
    this.patientService.findPatientsByHospital(this.user.hospitalId!, term).subscribe({
      next: (patients: ReturnPatient[]) => {
        this.patients = patients;
        this.filteredPatients = patients;
      }
    });
  }

  deletePatient(user: ReturnPatient, event: Event) {

  }

  selectPatient(user: ReturnPatient) {

  }
}
