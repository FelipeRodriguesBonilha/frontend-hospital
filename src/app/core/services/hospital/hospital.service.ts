import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateHospital } from '../../models/hospital/create-hospital.model';
import { ReturnHospital } from '../../models/hospital/return-hospital.model';
import { UpdateHospital } from '../../models/hospital/update-hospital.model';
import { ReturnPaginated } from '../../models/pagination/return-paginated.model';

@Injectable({
  providedIn: 'root'
})
export class HospitalService {
  private readonly apiUrl = `${environment.apiUrl}/hospital`;

  constructor(
    private http: HttpClient,
  ) { }

  findAllHospitals(
    filters: {
      companyName?: string,
      page?: number,
      limit?: number
    }
  ) {
    let params = new HttpParams();

    if (filters?.companyName) params = params.set('companyName', filters.companyName);
    if (filters?.page !== undefined) params = params.set('page', filters.page);
    if (filters?.limit !== undefined) params = params.set('limit', filters.limit);

    return this.http.get<ReturnPaginated<ReturnHospital>>(`${this.apiUrl}`, { params });
  }

  findHospitalById(hospitalId: string) {
    return this.http.get<ReturnHospital>(`${this.apiUrl}/${hospitalId}`);
  }

  createHospital(createHospital: CreateHospital): Observable<ReturnHospital> {
    return this.http.post<ReturnHospital>(`${this.apiUrl}`, createHospital);
  }

  updateHospital(hospitalId: string, updateHospital: UpdateHospital): Observable<ReturnHospital> {
    return this.http.patch<ReturnHospital>(`${this.apiUrl}/${hospitalId}`, updateHospital);
  }

  deleteHospital(hospitalId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${hospitalId}`);
  }
}
