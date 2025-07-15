import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateScheduling } from '../../models/scheduling/create-scheduling';
import { ReturnScheduling } from '../../models/scheduling/return-scheduling';
import { UpdateScheduling } from '../../models/scheduling/update-scheduling';

@Injectable({
  providedIn: 'root'
})
export class SchedulingService {
  private readonly apiUrl = `${environment.apiUrl}/scheduling`;

  constructor(
    private http: HttpClient,
  ) { }

  findAllSchedulings() {
    return this.http.get<ReturnScheduling[]>(`${this.apiUrl}`);
  }

  findSchedulingsByHospital(hospitalId: string) {
    return this.http.get<ReturnScheduling[]>(`${this.apiUrl}/hospital/${hospitalId}`);
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
}
