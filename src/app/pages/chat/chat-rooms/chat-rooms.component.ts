import { Component, EventEmitter, Output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReturnRoomUser } from '../../../core/models/room-user/return-room-user.model';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { SocketService } from '../../../core/services/socket/socket.service';

@Component({
  selector: 'app-chat-rooms',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './chat-rooms.component.html',
  styleUrl: './chat-rooms.component.css'
})
export class ChatRoomsComponent {
  @Output() roomSelected = new EventEmitter<ReturnRoomUser>();
  roomsUser: ReturnRoomUser[] = [];

  currentRoom!: ReturnRoomUser;

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.token$.subscribe((token) => {
      if (!token) this.roomsUser = [];
    });

    this.socketService.onRoomsUser((roomsUser) => {
      this.roomsUser = roomsUser;
    });
  }

  connectRoom(room: ReturnRoomUser) {
    if (this.currentRoom && this.currentRoom.room && (this.currentRoom.room.id !== room.room.id)) {
      this.disconnectRoom(this.currentRoom.room.id);
    }

    if (!this.currentRoom || !this.currentRoom.room || (this.currentRoom.room.id !== room.room.id)) {
      this.socketService.connectRoom(room.room.id);
      this.currentRoom = room;

      this.roomSelected.emit(this.currentRoom);
    }
  }

  disconnectRoom(roomId: string) {
    this.socketService.disconnectRoom(roomId);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }
}
