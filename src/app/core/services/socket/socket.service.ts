import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { ReturnMessage } from '../../models/message/return-message.model';
import { ReturnRoomUser } from '../../models/room-user/return-room-user.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;
  private readonly socketUrl = 'http://localhost:3000';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
  ) {
    this.authService.token$.subscribe((token) => {
      if (token) this.handshake();
      else this.disconnect();
    });
  }

  handshake() {
    if (isPlatformBrowser(this.platformId)) {
      this.socket = io(this.socketUrl, {
        auth: { authorization: this.authService.getToken() }
      });
    }
  }

  connectRoom(roomId: string): void {
    this.socket.emit('connect-room', { roomId: roomId });
  }

  disconnectRoom(roomId: string): void {
    this.socket.emit('disconnect-room', { roomId: roomId });
  }

  sendMessage(createMessageDto: any): void {
    this.socket.emit('send-message', createMessageDto);
  }

  markMessagesAsRead(roomId: string): void {
    this.socket.emit('read-messages', { roomId });
  }

  onNewMessage(callback: (message: ReturnMessage) => void): void {
    this.socket.on('new-message', (message) => {
      callback(message);
    });
  }

  onRoomsUser(callback: (rooms: ReturnRoomUser[]) => void): void {
    this.socket.on('rooms', (rooms) => {
      callback(rooms);
    });
  }

  onRoomMessages(callback: (messages: ReturnMessage[]) => void): void {
    this.socket.on('room-messages', (messages) => {
      callback(messages);
    });
  }

  onMessageSeenByAll(callback: (data: { messageId: string, seenByAll: boolean }) => void): void {
    this.socket.on('message-seen-by-all', (data) => {
      callback(data);
    });
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }

  getMessageReadStatus(messageId: string, roomId: string): void {
    this.socket.emit('get-message-read-status', { messageId, roomId });
  }
}