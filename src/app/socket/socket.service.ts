import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.socket = io('http://localhost:3000', {
        query: { userId: 'a85c7ac3-2533-43a3-8c12-015e0daaa5bf' }
      });
    }
  }

  connectRoom(userId: string, roomId: string): void {
    this.socket.emit('connect-room', {roomId: roomId, userId: userId });
  }

  sendMessage(createMessageDto: any): void {
    this.socket.emit('send-message', createMessageDto);
  }

  onMessage(callback: (message: any) => void): void {
    this.socket.on('new-message', (message) => {
      callback(message);
    });
  }

  onRooms(callback: (rooms: any[]) => void): void {
    this.socket.on('rooms', (rooms) => {
      callback(rooms);
    });
  }

  onPreviousMessages(callback: (messages: any[]) => void): void {
    this.socket.on('room-messages', (messages) => {
      callback(messages);
    });
  }
}