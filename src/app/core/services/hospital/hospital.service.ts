import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ReturnHospital } from '../../models/hospital/return-hospital';
import { Observable } from 'rxjs';
import { CreateHospital } from '../../models/hospital/create-hospital';
import { UpdateHospital } from '../../models/hospital/update-hospital';

@Injectable({
  providedIn: 'root'
})
export class HospitalService {
  private readonly apiUrl = `${environment.apiUrl}/hospital`;

  constructor(
    private http: HttpClient,
  ) {}

  findAllHospitals(companyName?: string) {
    let params = new HttpParams();

    if(companyName) params = params.set('companyName', companyName);
      
    return this.http.get<ReturnHospital[]>(`${this.apiUrl}`, { params });
  }

  findHospitalById(hospitalId: string){
    return this.http.get<ReturnHospital>(`${this.apiUrl}/${hospitalId}`);
  }

  createHospital(createHospital: CreateHospital): Observable<ReturnHospital> {
    return this.http.post<ReturnHospital>(`${this.apiUrl}`, createHospital);
  }

  updateHospital(hospitalId: string, updateHospital: UpdateHospital): Observable<ReturnHospital> {
    return this.http.patch<ReturnHospital>(`${this.apiUrl}/${hospitalId}`, updateHospital);
  }
}
