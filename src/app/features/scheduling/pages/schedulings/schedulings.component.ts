import { DatePipe } from '@angular/common';
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
import { ReturnScheduling } from '../../../../core/models/scheduling/return-scheduling.model';
import { ReturnUser } from '../../../../core/models/user/return-user.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { SchedulingService } from '../../../../core/services/scheduling/scheduling.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';

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
    DatePipe,
    MatSnackBarModule,
    MatPaginatorModule
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

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private schedulingService: SchedulingService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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
          return this.schedulingService.findAllSchedulings({
            namePatient: term || '',
            page: this.pageIndex + 1,
            limit: this.pageSize
          });
        } else if (this.rolesLoadSchedulingsByHospital.includes(this.user.role.name)) {
          return this.schedulingService.findSchedulingsByHospital(this.user.hospitalId, {
            namePatient: term || '',
            page: this.pageIndex + 1,
            limit: this.pageSize
          });
        } else {
          return [];
        }
      })
    ).subscribe({
      next: (response: ReturnPaginated<ReturnScheduling>) => {
        this.schedulings = response.data;
        this.filteredSchedulings = response.data;
        this.totalItems = response.total;
        this.pageIndex = response.page - 1;
        this.pageSize = response.limit;
      },
      error: (err: HttpErrorResponse) => this.showError(err)
    });
  }

  loadSchedulings() {
    this.schedulingService.findAllSchedulings({
      page: this.pageIndex + 1,
      limit: this.pageSize
    }).subscribe({
      next: (response: ReturnPaginated<ReturnScheduling>) => {
        this.schedulings = response.data;
        this.filteredSchedulings = response.data;
        this.totalItems = response.total;
        this.pageIndex = response.page - 1;
        this.pageSize = response.limit;
      },
      error: (err: HttpErrorResponse) => this.showError(err)
    });
  }

  loadSchedulingsByHospital() {
    this.schedulingService.findSchedulingsByHospital(this.user.hospitalId!, {
      page: this.pageIndex + 1,
      limit: this.pageSize
    }).subscribe({
      next: (response: ReturnPaginated<ReturnScheduling>) => {
        this.schedulings = response.data;
        this.filteredSchedulings = response.data;
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

    if (this.rolesLoadSchedulings.includes(this.user.role.name)) {
      this.loadSchedulings();
    } else if (this.rolesLoadSchedulingsByHospital.includes(this.user.role.name)) {
      this.loadSchedulingsByHospital();
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

  deleteScheduling(scheduling: ReturnScheduling) {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '400px',
      data: { message: `Tem certeza que deseja excluir o agendamento do paciente "${scheduling.patient?.name}"?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.schedulingService.deleteScheduling(scheduling.id).subscribe({
          next: () => {
            this.snackBar.open('Agendamento excluído com sucesso.', 'Fechar', {
              duration: 3000,
              verticalPosition: 'top'
            });

            if (this.rolesLoadSchedulings.includes(this.user.role.name)) this.loadSchedulings();
            else if (this.rolesLoadSchedulingsByHospital.includes(this.user.role.name)) this.loadSchedulingsByHospital();
            else {
              this.schedulings = [];
              this.filteredSchedulings = [];
            }
          },
          error: (err: HttpErrorResponse) => this.showError(err)
        });
      }
    });
  }
}