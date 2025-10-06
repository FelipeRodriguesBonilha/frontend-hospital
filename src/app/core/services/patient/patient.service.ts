import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReturnPaginated } from '../../models/pagination/return-paginated.model';
import { CreatePatient } from '../../models/patient/create-patient.model';
import { ReturnPatient } from '../../models/patient/return-patient.model';
import { UpdatePatient } from '../../models/patient/update-patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly apiUrl = `${environment.apiUrl}/patient`;

  constructor(
    private http: HttpClient,
  ) { }

  findAllPatients(
    filters: {
      name?: string,
      page?: number,
      limit?: number
    }
  ) {
    let params = new HttpParams();

    if (filters?.name) params = params.set('name', filters.name);
    if (filters?.page !== undefined) params = params.set('page', filters.page);
    if (filters?.limit !== undefined) params = params.set('limit', filters.limit);

    return this.http.get<ReturnPaginated<ReturnPatient>>(`${this.apiUrl}`, { params });
  }

  findPatientsByHospital(
    hospitalId: string,
    filters: {
      name?: string,
      page?: number,
      limit?: number
    }
  ) {
    let params = new HttpParams();

    if (filters?.name) params = params.set('name', filters.name);
    if (filters?.page !== undefined) params = params.set('page', filters.page);
    if (filters?.limit !== undefined) params = params.set('limit', filters.limit);

    return this.http.get<ReturnPaginated<ReturnPatient>>(`${this.apiUrl}/hospital/${hospitalId}`, { params });
  }

  findPatientById(patientId: string) {
    return this.http.get<ReturnPatient>(`${this.apiUrl}/${patientId}`);
  }

  createPatient(createPatient: CreatePatient): Observable<ReturnPatient> {
    return this.http.post<ReturnPatient>(`${this.apiUrl}`, createPatient);
  }

  updatePatient(patientId: string, updatePatient: UpdatePatient): Observable<ReturnPatient> {
    return this.http.patch<ReturnPatient>(`${this.apiUrl}/${patientId}`, updatePatient);
  }

  deletePatient(patientId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${patientId}`);
  }
}
