import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { ReturnRoomUser } from '../../../core/models/room-user/return-room-user.model';
import { AuthService } from '../../../core/services/auth/auth.service';
import { SocketService } from '../../../core/services/socket/socket.service';
import { ChatMessagesComponent } from "../chat-messages/chat-messages.component";

@Component({
  selector: 'app-chat-rooms',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, NgClass, ChatMessagesComponent],
  templateUrl: './chat-rooms.component.html',
  styleUrl: './chat-rooms.component.css'
})
export class ChatRoomsComponent {
  roomsUser: ReturnRoomUser[] = [];
  currentRoom!: ReturnRoomUser;

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private router: Router
  ) { }

  isMinimized: boolean = false;

  toggleSidebar(): void {
    this.isMinimized = !this.isMinimized;
  }

  ngOnInit() {
    this.authService.token$.subscribe((token) => {
      if (!token) this.roomsUser = [];
    });

    this.socketService.onRoomsUser((roomsUser) => {
      this.roomsUser = roomsUser;
    });
  }

  connectRoom(room: ReturnRoomUser) {
    if (
      this.currentRoom && 
      this.currentRoom.room && 
      (this.currentRoom.room.id !== room.room.id)
    ) this.disconnectRoom(this.currentRoom.room.id);

    if (
      !this.currentRoom || 
      !this.currentRoom.room || 
      (this.currentRoom.room.id !== room.room.id)
    ) {
      this.socketService.connectRoom(room.room.id);
      this.currentRoom = room;
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
