import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReturnPaginated } from '../../models/pagination/return-paginated.model';
import { CreateScheduling } from '../../models/scheduling/create-scheduling.model';
import { ReturnScheduling } from '../../models/scheduling/return-scheduling.model';
import { UpdateScheduling } from '../../models/scheduling/update-scheduling.model';

@Injectable({
  providedIn: 'root'
})
export class SchedulingService {
  private readonly apiUrl = `${environment.apiUrl}/scheduling`;

  constructor(
    private http: HttpClient,
  ) { }

  findAllSchedulings(
    filters: {
      namePatient?: string,
      page?: number,
      limit?: number
    }
  ) {
    let params = new HttpParams();

    if (filters?.namePatient) params = params.set('namePatient', filters.namePatient);
    if (filters?.page !== undefined) params = params.set('page', filters.page);
    if (filters?.limit !== undefined) params = params.set('limit', filters.limit);

    return this.http.get<ReturnPaginated<ReturnScheduling>>(`${this.apiUrl}`, { params });
  }

  findSchedulingsByHospital(
    hospitalId: string,
    filters: {
      namePatient?: string,
      page?: number,
      limit?: number
    }
  ) {
    let params = new HttpParams();

    if (filters?.namePatient) params = params.set('namePatient', filters.namePatient);
    if (filters?.page !== undefined) params = params.set('page', filters.page);
    if (filters?.limit !== undefined) params = params.set('limit', filters.limit);

    return this.http.get<ReturnPaginated<ReturnScheduling>>(`${this.apiUrl}/hospital/${hospitalId}`, { params });
  }

  findSchedulingById(schedulingId: string) {
    return this.http.get<ReturnScheduling>(`${this.apiUrl}/${schedulingId}`);
  }

  createScheduling(createScheduling: CreateScheduling): Observable<ReturnScheduling> {
    return this.http.post<ReturnScheduling>(`${this.apiUrl}`, createScheduling);
  }

  updateScheduling(schedulingId: string, updateScheduling: UpdateScheduling): Observable<ReturnScheduling> {
    return this.http.patch<ReturnScheduling>(`${this.apiUrl}/${schedulingId}`, updateScheduling);
  }

  deleteScheduling(schedulingId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${schedulingId}`);
  }
}
