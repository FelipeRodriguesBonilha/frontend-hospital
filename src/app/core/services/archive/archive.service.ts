import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReturnArchive } from '../../models/archive/return-archive.model';

@Injectable({
  providedIn: 'root'
})
export class ArchiveService {
  private readonly apiUrl = `${environment.apiUrl}/archive`;

  constructor(private http: HttpClient) { }

  uploadFiles(messageId: string, files: File[]): Observable<ReturnArchive> {
    const formData = new FormData();
  
    files.forEach(file => formData.append('arquivos', file));
    formData.append('messageId', messageId);
  
    return this.http.post<ReturnArchive>(`${this.apiUrl}/upload-to-message`, formData);
  }  

  getImage(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/file/${filename}`, { responseType: 'blob' });
  }
}
