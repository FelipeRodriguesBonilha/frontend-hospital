import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReturnPaginated } from '../../models/pagination/return-paginated.model';
import { CreateUser } from '../../models/user/create-user.model';
import { ReturnUser } from '../../models/user/return-user.model';
import { UpdateUser } from '../../models/user/update-user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/user`;

  constructor(
    private http: HttpClient,
  ) { }

  findAllUsers(
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

    return this.http.get<ReturnPaginated<ReturnUser>>(`${this.apiUrl}`, { params });
  }

  findUsersByHospital(
    hospitalId: string,
    filters: {
      name?: string,
      roles?: string[],
      page?: number,
      limit?: number
    }
  ) {
    let params = new HttpParams();

    if (filters?.name) params = params.set('name', filters.name);
    if (filters.roles && filters.roles.length > 0) {
      filters.roles.forEach((r) => {
        params = params.append('roles', r);
      });
    }
    if (filters?.page !== undefined) params = params.set('page', filters.page);
    if (filters?.limit !== undefined) params = params.set('limit', filters.limit);

    return this.http.get<ReturnPaginated<ReturnUser>>(`${this.apiUrl}/hospital/${hospitalId}`, { params });
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

  findByHospitalUsersNotInRoom(hospitalId: string, roomId: string) {
    return this.http.get<ReturnUser[]>(`${this.apiUrl}/hospital/${hospitalId}/not-in-room/${roomId}`);
  }

  findAllUsersInRoom(roomId: string) {
    return this.http.get<ReturnUser[]>(`${this.apiUrl}/room/${roomId}`);
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }
}
