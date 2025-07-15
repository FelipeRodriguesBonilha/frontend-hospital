import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateUser } from '../../models/user/create-user';
import { ReturnUser } from '../../models/user/return-user.model';
import { UpdateUser } from '../../models/user/update-user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/user`;

  constructor(
    private http: HttpClient,
  ) { }

  findAllUsers(name?: string) {
    let params = new HttpParams();

    if(name) params = params.set('name', name);

    return this.http.get<ReturnUser[]>(`${this.apiUrl}`, { params });
  }

  findUsersByHospital(hospitalId: string, name?: string) {
    let params = new HttpParams();

    if(name) params = params.set('name', name);
    
    return this.http.get<ReturnUser[]>(`${this.apiUrl}/hospital/${hospitalId}`, { params });
  }

  findUserById(userId: string) {
    return this.http.get<ReturnUser>(`${this.apiUrl}/${userId}`);
  }

  createUser(createUser: CreateUser): Observable<ReturnUser> {
    return this.http.post<ReturnUser>(`${this.apiUrl}`, createUser);
  }

  updateUser(userId: string, updateUser: UpdateUser): Observable<ReturnUser> {
    return this.http.patch<ReturnUser>(`${this.apiUrl}/${userId}`, updateUser);
  }
}
