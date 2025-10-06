import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ReturnHospital } from '../../../../core/models/hospital/return-hospital.model';
import { ReturnPaginated } from '../../../../core/models/pagination/return-paginated.model';
import { HospitalService } from '../../../../core/services/hospital/hospital.service';
import { CnpjPipe } from '../../../../shared/pipes/cnpj.pipe';
import { PhonePipe } from '../../../../shared/pipes/phone.pipe';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';

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
    MatButtonModule,
    MatSnackBarModule,
    MatPaginatorModule,
    CnpjPipe,
    PhonePipe
  ],
  templateUrl: './hospitals.component.html',
  styleUrl: './hospitals.component.css'
})
export class HospitalsComponent {
  hospitals: ReturnHospital[] = [];
  filteredHospitals: ReturnHospital[] = [];
  searchControl = new FormControl('');

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private hospitalService: HospitalService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadHospitals();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) =>
        this.hospitalService.findAllHospitals({
          companyName: term || '',
          page: this.pageIndex + 1,
          limit: this.pageSize
        })
      )
    ).subscribe({
      next: (response: ReturnPaginated<ReturnHospital>) => {
        this.hospitals = response.data;
        this.filteredHospitals = response.data;
        this.totalItems = response.total;
        this.pageIndex = response.page - 1;
        this.pageSize = response.limit;
      },
      error: (err: HttpErrorResponse) => this.showError(err)
    });
  }

  loadHospitals() {
    this.hospitalService.findAllHospitals({
      companyName: this.searchControl.value || '',
      page: this.pageIndex + 1,
      limit: this.pageSize
    }).subscribe({
      next: (response: ReturnPaginated<ReturnHospital>) => {
        this.hospitals = response.data;
        this.filteredHospitals = response.data;
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
    this.loadHospitals();
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

  deleteHospital(hospital: ReturnHospital) {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '400px',
      data: { message: `Tem certeza que deseja excluir o hospital "${hospital.companyName}"?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.hospitalService.deleteHospital(hospital.id).subscribe({
          next: () => {
            this.snackBar.open('Hospital excluído com sucesso.', 'Fechar', {
              duration: 3000,
              verticalPosition: 'top'
            });

            this.loadHospitals()
          },
          error: (err: HttpErrorResponse) => this.showError(err)
        });
      }
    });
  }
}
