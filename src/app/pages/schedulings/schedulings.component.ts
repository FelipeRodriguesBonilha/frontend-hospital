import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ReturnScheduling } from '../../core/models/scheduling/return-scheduling';
import { SchedulingService } from '../../core/services/scheduling/scheduling.service';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth.service';
import { ReturnUser } from '../../core/models/user/return-user.model';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ReturnPatient } from '../../core/models/patient/return-patient';

@Component({
  selector: 'app-schedulings',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    MatMenuModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    DatePipe
  ],
  templateUrl: './schedulings.component.html',
  styleUrl: './schedulings.component.css'
})
export class SchedulingsComponent {
  user!: ReturnUser;
  schedulings: ReturnScheduling[] = [];
  filteredSchedulings: ReturnScheduling[] = [];
  searchControl = new FormControl('');

  rolesLoadSchedulings = ["AdminGeral"];
  rolesLoadSchedulingsByHospital = ["AdminHospital", "Recepcionista"];

  constructor(
    private schedulingService: SchedulingService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;

        if (this.rolesLoadSchedulings.includes(user.role.name)) this.loadSchedulings();
        else if (this.rolesLoadSchedulingsByHospital.includes(user.role.name)) this.loadSchedulingsByHospital();
        else {
          this.schedulings = [];
          this.filteredSchedulings = [];
        }
      }
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        if (this.rolesLoadSchedulings.includes(this.user.role.name)) {
          return this.schedulingService.findAllSchedulings();
        } else if (this.rolesLoadSchedulingsByHospital.includes(this.user.role.name)) {
          return this.schedulingService.findSchedulingsByHospital(this.user.hospitalId);
        } else {
          return [];
        }
      })
    ).subscribe({
      next: (schedulings: ReturnScheduling[]) => {
        this.schedulings = schedulings;
        this.filteredSchedulings = schedulings;
      },
      error: (err) => console.error('Erro na busca de usuários:', err)
    });
  }

  loadSchedulings(term: string = '') {
    this.schedulingService.findAllSchedulings().subscribe({
      next: (schedulings: ReturnScheduling[]) => {
        this.schedulings = schedulings;
        this.filteredSchedulings = schedulings;
      }
    });
  }

  loadSchedulingsByHospital(term: string = '') {
    this.schedulingService.findSchedulingsByHospital(this.user.hospitalId!).subscribe({
      next: (schedulings: ReturnScheduling[]) => {
        this.schedulings = schedulings;
        this.filteredSchedulings = schedulings;
      }
    });
  }

  deleteSchedulings(scheduling: ReturnScheduling, event: Event) {

  }

  selectScheduling(scheduling: ReturnScheduling) {

  }
}
