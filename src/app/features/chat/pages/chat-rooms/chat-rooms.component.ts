import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { ReturnRoom } from '../../../../core/models/room/return-room.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { SocketService } from '../../../../core/services/socket/socket.service';
import { ChatMessagesComponent } from '../../components/chat-messages/chat-messages.component';
import { NewRoomModalComponent } from '../../components/new-room-modal/new-room-modal.component';

@Component({
  selector: 'app-chat-rooms',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    NgClass,
    ChatMessagesComponent,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './chat-rooms.component.html',
  styleUrl: './chat-rooms.component.css'
})
export class ChatRoomsComponent {
  rooms: ReturnRoom[] = [];
  filteredRooms: ReturnRoom[] = [];
  currentRoom!: ReturnRoom;
  filterTerm: string = '';

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  isMinimized: boolean = false;

  toggleSidebar(): void {
    this.isMinimized = !this.isMinimized;
  }

  ngOnInit() {
    this.socketService.roomsUser$.subscribe(rooms => {
      this.rooms = rooms;
      this.applyFilter();
    });
  }

  applyFilter() {
    const term = this.filterTerm.toLowerCase();
    this.filteredRooms = this.rooms.filter(room =>
      room.name.toLowerCase().includes(term) ||
      (room.description && room.description.toLowerCase().includes(term))
    );
  }

  connectRoom(room: ReturnRoom) {
    if (this.currentRoom && this.currentRoom.id !== room.id) {
      this.disconnectRoom(this.currentRoom.id);
    }

    if (!this.currentRoom || this.currentRoom.id !== room.id) {
      this.socketService.connectRoom(room.id);
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

  openNewRoom(): void {
    this.dialog.open(NewRoomModalComponent, { width: '60%' });
  }
}

