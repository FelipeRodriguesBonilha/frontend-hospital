import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ReturnPaginated } from '../../../../core/models/pagination/return-paginated.model';
import { ReturnChatReport } from '../../../../core/models/report/return-chat-report.model';
import { ReportService } from '../../../../core/services/report/report.service';

@Component({
  selector: 'app-chat-messages-report',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './chat-messages-report.component.html',
  styleUrls: ['./chat-messages-report.component.css']
})
export class ChatMessagesReportComponent {
  reports: ReturnChatReport[] = [];
  filteredReports: ReturnChatReport[] = [];
  startDateControl = new FormControl('');
  endDateControl = new FormControl('');

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private reportService: ReportService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadReports();

    this.startDateControl.valueChanges.pipe(debounceTime(300)).subscribe(() => this.loadReports());
    this.endDateControl.valueChanges.pipe(debounceTime(300)).subscribe(() => this.loadReports());
  }

  loadReports() {
    this.loadReportsObservable().subscribe({
      next: (response: ReturnPaginated<ReturnChatReport>) => this.updateReports(response),
      error: (err: HttpErrorResponse) => this.showError(err)
    });
  }

  loadReportsObservable() {
    const startDate = this.startDateControl.value ? new Date(this.startDateControl.value).toISOString() : undefined;
    const endDate = this.endDateControl.value ? new Date(this.endDateControl.value).toISOString() : undefined;

    return this.reportService.getChatMessagesReport({
      page: this.pageIndex + 1,
      limit: this.pageSize,
      startDate: startDate,
      endDate: endDate
    });
  }

  updateReports(response: ReturnPaginated<ReturnChatReport>) {
    this.reports = response.data;
    this.filteredReports = response.data;
    this.totalItems = response.total;
    this.pageIndex = response.page - 1;
    this.pageSize = response.limit;
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadReports();
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

  clearFilters() {
    this.startDateControl.setValue('');
    this.endDateControl.setValue('');
    this.loadReports();
  }
}