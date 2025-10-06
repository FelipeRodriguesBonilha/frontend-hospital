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
import { ReturnExam } from '../../../../core/models/exam/return-exam.model';
import { ReturnPaginated } from '../../../../core/models/pagination/return-paginated.model';
import { ReturnUser } from '../../../../core/models/user/return-user.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { ExamService } from '../../../../core/services/exam/exam.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-exams',
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
    MatPaginatorModule
  ],
  templateUrl: './exams.component.html',
  styleUrl: './exams.component.css'
})
export class ExamsComponent {
  user!: ReturnUser;
  exams: ReturnExam[] = [];
  filteredExams: ReturnExam[] = [];
  searchControl = new FormControl('');

  rolesLoadExams = ["AdminGeral"];
  rolesLoadExamsByHospital = ["AdminHospital", "Recepcionista", "Medico"];

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private examService: ExamService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;

        if (this.rolesLoadExams.includes(user.role.name)) this.loadExams();
        else if (this.rolesLoadExamsByHospital.includes(user.role.name)) this.loadExamsByHospital();
        else {
          this.exams = [];
          this.filteredExams = [];
        }
      }
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        if (this.rolesLoadExams.includes(this.user.role.name)) {
          return this.examService.findAllExams({
            description: term || '',
            page: this.pageIndex + 1,
            limit: this.pageSize
          });
        } else if (this.rolesLoadExamsByHospital.includes(this.user.role.name)) {
          return this.examService.findExamsByHospital(this.user.hospitalId, {
            description: term || '',
            page: this.pageIndex + 1,
            limit: this.pageSize
          });
        } else {
          return [];
        }
      })
    ).subscribe({
      next: (response: ReturnPaginated<ReturnExam>) => {
        this.exams = response.data;
        this.filteredExams = response.data;
        this.totalItems = response.total;
        this.pageIndex = response.page - 1;
        this.pageSize = response.limit;
      },
      error: (err: HttpErrorResponse) => this.showError(err)
    });
  }

  loadExams() {
    this.examService.findAllExams({
      description: this.searchControl.value || '',
      page: this.pageIndex + 1,
      limit: this.pageSize
    }).subscribe({
      next: (response: ReturnPaginated<ReturnExam>) => {
        this.exams = response.data;
        this.filteredExams = response.data;
        this.totalItems = response.total;
        this.pageIndex = response.page - 1;
        this.pageSize = response.limit;
      },
      error: (err: HttpErrorResponse) => this.showError(err)
    });
  }

  loadExamsByHospital() {
    this.examService.findExamsByHospital(this.user.hospitalId!, {
      description: this.searchControl.value || '',
      page: this.pageIndex + 1,
      limit: this.pageSize
    }).subscribe({
      next: (response: ReturnPaginated<ReturnExam>) => {
        this.exams = response.data;
        this.filteredExams = response.data;
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

    if (this.rolesLoadExams.includes(this.user.role.name)) {
      this.loadExams();
    } else if (this.rolesLoadExamsByHospital.includes(this.user.role.name)) {
      this.loadExamsByHospital();
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

  deleteExam(exam: ReturnExam) {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '400px',
      data: { message: `Tem certeza que deseja excluir o exame "${exam.description}"?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.examService.deleteExam(exam.id).subscribe({
          next: () => {
            this.snackBar.open('Exame excluído com sucesso.', 'Fechar', {
              duration: 3000,
              verticalPosition: 'top'
            });

            if (this.rolesLoadExams.includes(this.user.role.name)) this.loadExams();
            else if (this.rolesLoadExamsByHospital.includes(this.user.role.name)) this.loadExamsByHospital();
            else {
              this.exams = [];
              this.filteredExams = [];
            }
          },
          error: (err: HttpErrorResponse) => this.showError(err)
        });
      }
    });
  }
}
