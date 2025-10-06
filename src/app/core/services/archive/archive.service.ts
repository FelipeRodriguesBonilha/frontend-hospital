import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArchiveService {
  private readonly apiUrl = `${environment.apiUrl}/archive`;

  constructor(private http: HttpClient) { }

  getImage(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/file/${filename}`, { responseType: 'blob' });
  }
}
