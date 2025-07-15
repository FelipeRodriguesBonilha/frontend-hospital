import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ReturnHospital } from '../../core/models/hospital/return-hospital';
import { HospitalService } from '../../core/services/hospital/hospital.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-hospitals',
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
  templateUrl: './hospitals.component.html',
  styleUrl: './hospitals.component.css'
})
export class HospitalsComponent {
  hospitals: ReturnHospital[] = [];
  filteredHospitals: ReturnHospital[] = [];
  searchControl = new FormControl('');
  
  constructor(
    private hospitalService: HospitalService
  ) { }

  ngOnInit() {
    this.loadHospitals('');

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => this.hospitalService.findAllHospitals(term || ''))
    ).subscribe({
      next: (hospitals: ReturnHospital[]) => {
        this.hospitals = hospitals;
        this.filteredHospitals = hospitals;
      },
      error: (err) => console.error('Erro na busca de hospitais:', err)
    });
  }

  loadHospitals(term: string = '') {
    this.hospitalService.findAllHospitals(term).subscribe({
      next: (hospitals: ReturnHospital[]) => {
        this.hospitals = hospitals;
        this.filteredHospitals = hospitals;
      },
      error: (err) => console.error('Erro ao carregar hospitais:', err)
    });
  }

  deleteHospital(hospital: ReturnHospital, event: Event) {

  }

  selectHospital(hospital: ReturnHospital) {

  }
}
