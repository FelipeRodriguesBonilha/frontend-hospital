import { Component, Input } from '@angular/core';
import { ReturnRoom } from '../../../core/models/room/return-room.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { RoomDetailsModalComponent } from '../../room-details-modal/room-details-modal.component';

@Component({
  selector: 'app-info-room',
  standalone: true,
  imports: [],
  templateUrl: './info-room.component.html',
  styleUrl: './info-room.component.css'
})
export class InfoRoomComponent {
  @Input() room!: ReturnRoom;

  constructor(private router: Router, private dialog: MatDialog) { }

  detailsRoom() {
    this.dialog.open(RoomDetailsModalComponent, {
      width: '500px',
      data: { 
        room: this.room,
      }
    });
  }
}
