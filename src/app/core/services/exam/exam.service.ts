import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReturnExam } from '../../models/exam/return-exam.model';
import { ReturnPaginated } from '../../models/pagination/return-paginated.model';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private readonly apiUrl = `${environment.apiUrl}/exam`;

  constructor(
    private http: HttpClient,
  ) { }

  findAllExams(
    filters: {
      description?: string,
      page?: number,
      limit?: number
    }
  ) {
    let params = new HttpParams();

    if (filters?.description) params = params.set('description', filters.description);
    if (filters?.page !== undefined) params = params.set('page', filters.page);
    if (filters?.limit !== undefined) params = params.set('limit', filters.limit);

    return this.http.get<ReturnPaginated<ReturnExam>>(`${this.apiUrl}`, { params });
  }

  findExamsByHospital(hospitalId: string,
    filters: {
      description?: string,
      page?: number,
      limit?: number
    }
  ) {
    let params = new HttpParams();

    if (filters?.description) params = params.set('description', filters.description);
    if (filters?.page !== undefined) params = params.set('page', filters.page);
    if (filters?.limit !== undefined) params = params.set('limit', filters.limit);

    return this.http.get<ReturnPaginated<ReturnExam>>(`${this.apiUrl}/hospital/${hospitalId}`, { params });
  }

  findExamById(examId: string) {
    return this.http.get<ReturnExam>(`${this.apiUrl}/${examId}`);
  }

  createExam(data: FormData): Observable<ReturnExam> {
    return this.http.post<ReturnExam>(`${this.apiUrl}`, data);
  }

  updateExam(examId: string, data: FormData): Observable<ReturnExam> {
    return this.http.patch<ReturnExam>(`${this.apiUrl}/${examId}`, data);
  }

  deleteExam(examId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${examId}`);
  }
}
