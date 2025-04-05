import { NgClass } from '@angular/common';
import { SocketService } from './socket/socket.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Chat'

  messages: any[] = [];
  rooms: any[] = []
  newMessage: string = '';
  roomId!: string;
  userId = 'a85c7ac3-2533-43a3-8c12-015e0daaa5bf';

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.socketService.onPreviousMessages((messages) => {
      this.messages = messages;
    });

    this.socketService.onMessage((message) => {
      this.messages.push(message);
    });

    this.socketService.onRooms((rooms) => {
      console.log(rooms)

      this.rooms = rooms;
    });
  }

  connectRoom(roomId: string) {
    this.roomId = roomId;

    console.log(this.userId)

    this.socketService.connectRoom(this.userId, roomId);
  }

  sendMessage(): void {
    const createMessageDto: any = {
      content: this.newMessage,
      senderId: this.userId,
      roomId: this.roomId
    }

    console.log(this.roomId)

    if (this.newMessage.trim()) {
      this.socketService.sendMessage(createMessageDto);
      this.newMessage = '';
    }
  }
}
