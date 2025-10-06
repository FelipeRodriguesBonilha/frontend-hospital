import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReturnPaginated } from '../../models/pagination/return-paginated.model';
import { ReturnChatReport } from '../../models/report/return-chat-report.model';
import { ReturnExamsReport } from '../../models/report/return-exams-report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly apiUrl = `${environment.apiUrl}/report`;

  constructor(
    private http: HttpClient,
  ) { }

  getChatMessagesReport(filters: { hospitalId?: string, startDate?: string; endDate?: string; page?: number; limit?: number; }): Observable<ReturnPaginated<ReturnChatReport>> {
    let params = new HttpParams()

    if (filters?.hospitalId) params = params.set('hospitalId', filters.hospitalId);
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);
    if (filters?.page !== undefined) params = params.set('page', filters.page);
    if (filters?.limit !== undefined) params = params.set('limit', filters.limit);

    return this.http.get<ReturnPaginated<ReturnChatReport>>(`${this.apiUrl}/chat`, { params });
  }

  getExamsReport(filters: { hospitalId?: string, startDate?: string; endDate?: string; page?: number; limit?: number; }): Observable<ReturnPaginated<ReturnExamsReport>> {
    let params = new HttpParams()

    if (filters?.hospitalId) params = params.set('hospitalId', filters.hospitalId);
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);
    if (filters?.page !== undefined) params = params.set('page', filters.page);
    if (filters?.limit !== undefined) params = params.set('limit', filters.limit);

    return this.http.get<ReturnPaginated<ReturnExamsReport>>(`${this.apiUrl}/exams`, { params });
  }
}
