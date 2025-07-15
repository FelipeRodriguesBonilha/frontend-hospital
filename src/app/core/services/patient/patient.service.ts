import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreatePatient } from '../../models/patient/create-patient';
import { ReturnPatient } from '../../models/patient/return-patient';
import { UpdatePatient } from '../../models/patient/update-patient';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly apiUrl = `${environment.apiUrl}/patient`;

  constructor(
    private http: HttpClient,
  ) { }

  findAllPatients(name?: string) {
    let params = new HttpParams();

    if(name) params = params.set('name', name);

    return this.http.get<ReturnPatient[]>(`${this.apiUrl}`, { params });
  }

  findPatientsByHospital(hospitalId: string, name?: string) {
    let params = new HttpParams();

    if(name) params = params.set('name', name);
    
    return this.http.get<ReturnPatient[]>(`${this.apiUrl}/hospital/${hospitalId}`, { params });
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
}
