import { Component } from '@angular/core';
import { ChatRoomsComponent } from "../chat-rooms/chat-rooms.component";
import { ChatMessagesComponent } from "../chat-messages/chat-messages.component";
import { InfoRoomComponent } from '../info-room/info-room.component';
import { ReturnRoomUser } from '../../../core/models/room-user/return-room-user.model';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ChatRoomsComponent, ChatMessagesComponent, InfoRoomComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  selectedRoom!: ReturnRoomUser;

  handleRoomSelected(room: ReturnRoomUser) {
    this.selectedRoom = room;
  }
}
