import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ReturnRoom } from '../../models/room/return-room.model';
import { UpdateRoom } from '../../models/room/update-room.dto';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly apiUrl = `${environment.apiUrl}/room`;

  constructor(
    private http: HttpClient,
  ) { }

  findByHospitalUsersNotInRoom(hospitalId: string, roomId: string) {
    return this.http.get<ReturnRoom[]>(`${this.apiUrl}/hospital/${hospitalId}/not-in-room/${roomId}`);
  }
}
