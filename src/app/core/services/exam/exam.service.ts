import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateExam } from '../../models/exam/create-exam';
import { ReturnExam } from '../../models/exam/return-exam';
import { UpdateExam } from '../../models/exam/update-exam';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private readonly apiUrl = `${environment.apiUrl}/exam`;

  constructor(
    private http: HttpClient,
  ) { }

  findAllExams(description?: string) {
    let params = new HttpParams();

    if(description) params = params.set('description', description);

    return this.http.get<ReturnExam[]>(`${this.apiUrl}`, { params });
  }

  findExamsByHospital(hospitalId: string, description?: string) {
    let params = new HttpParams();

    if(description) params = params.set('description', description);
    
    return this.http.get<ReturnExam[]>(`${this.apiUrl}/hospital/${hospitalId}`, { params });
  }

  findExamById(examId: string) {
    return this.http.get<ReturnExam>(`${this.apiUrl}/${examId}`);
  }

  createExam(createExam: CreateExam): Observable<ReturnExam> {
    return this.http.post<ReturnExam>(`${this.apiUrl}`, createExam);
  }

  updateExam(examId: string, updateExam: UpdateExam): Observable<ReturnExam> {
    return this.http.patch<ReturnExam>(`${this.apiUrl}/${examId}`, updateExam);
  }
}
