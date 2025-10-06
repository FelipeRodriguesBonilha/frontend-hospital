import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ReturnRole } from '../../models/role/return-role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly apiUrl = `${environment.apiUrl}/role`;

  constructor(
    private http: HttpClient,
  ) { }

  findAllRoles() {
    return this.http.get<ReturnRole[]>(`${this.apiUrl}`);
  }
}
