import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { CreateMessage } from '../../models/message/create-message.model';
import { ReturnMessage } from '../../models/message/return-message.model';
import { JoinRoom } from '../../models/room-user/join-room.model';
import { LeaveRoom } from '../../models/room-user/leave-room.model';
import { CreateRoom } from '../../models/room/create-room.model';
import { ReturnRoom } from '../../models/room/return-room.model';
import { UpdateRoom } from '../../models/room/update-room.dto';
import { CreateUser } from '../../models/user/create-user.model';
import { ReturnUser } from '../../models/user/return-user.model';
import { UpdateProfile } from '../../models/user/update-profile.model';
import { UpdateUser } from '../../models/user/update-user.model';
import { AuthService } from '../auth/auth.service';
import { RemoveUser } from '../../models/room-user/remove-user.model';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;
  private readonly socketUrl = 'http://localhost:3000';

  private roomsUserSubject = new BehaviorSubject<ReturnRoom[]>([]);
  public roomsUser$ = this.roomsUserSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private snackBar: MatSnackBar
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

      this.onRoomsUser((rooms: ReturnRoom[]) => {
        this.roomsUserSubject.next(rooms);
      });
      this.requestRooms();

      this.onError((error) => {
        this.snackBar.open(error.message || 'Erro no servidor.', 'Fechar', { duration: 5000 });
      })
    }
  }

  connectRoom(roomId: string): void {
    this.socket.emit('connect-room', { roomId: roomId });
  }

  createRoom(createRoom: CreateRoom): void {
    this.socket.emit('create-room', createRoom);
  }

  createUser(createUser: CreateUser) {
    this.socket.emit('create-user', createUser);
  }

  updateUser(id: string, updateUser: UpdateUser) {
    this.socket.emit('update-user', { id, updateUserDto: updateUser });
  }

  deleteUser(id: string) {
    this.socket.emit('delete-user', id);
  }

  updateProfile(updateProfile: UpdateProfile) {
    this.socket.emit('update-profile', updateProfile);
  }

  updateRoom(id: string, updateRoom: UpdateRoom) {
    this.socket.emit('update-room', { id, updateRoomDto: updateRoom });
  }

  joinRoom(joinRoom: JoinRoom) {
    this.socket.emit('join-room', joinRoom);
  }

  leaveRoom(leaveRoom: LeaveRoom) {
    this.socket.emit('leave-room', leaveRoom);
  }

  removeUserFromRoom(removeUser: RemoveUser) {
    this.socket.emit('remove-user', removeUser);
  }

  disconnectRoom(roomId: string): void {
    this.socket.emit('disconnect-room', { roomId: roomId });
  }

  sendMessage(createMessage: CreateMessage): void {
    this.socket.emit('send-message', createMessage);
  }

  markMessagesAsRead(roomId: string): void {
    this.socket.emit('read-messages', { roomId });
  }

  requestRooms(): void {
    this.socket.emit('get-rooms');
  }

  requestRoomMessages(roomId: string): void {
    this.socket.emit('get-room-messages', { roomId });
  }

  requestUsersInRoom(roomId: string): void {
    this.socket.emit('get-users-in-room', { roomId });
  }

  requestUsersNotInRoom(roomId: string): void {
    this.socket.emit('get-users-not-in-room', { roomId });
  }

  onNewMessage(callback: (message: ReturnMessage) => void): void {
    this.socket.off('new-message');
    this.socket.on('new-message', (message) => {
      callback(message);
    });
  }

  onRoomsUser(callback: (rooms: ReturnRoom[]) => void): void {
    this.socket.off('rooms');
    this.socket.on('rooms', (rooms) => {
      callback(rooms);
    });
  }

  onRoomMessages(callback: (messages: ReturnMessage[]) => void): void {
    this.socket.off('room-messages');
    this.socket.on('room-messages', (messages) => {
      callback(messages);
    });
  }

  onMessageSeenByAll(callback: (data: { messageId: string; seenByAll: boolean }) => void): void {
    this.socket.off('message-seen-by-all');
    this.socket.on('message-seen-by-all', (data) => {
      callback(data);
    });
  }

  onUsersInRoom(callback: (users: ReturnUser[]) => void): void {
    this.socket.off('users-in-room');
    this.socket.on('users-in-room', (users) => {
      callback(users);
    });
  }

  onUsersNotInRoom(callback: (users: ReturnUser[]) => void): void {
    this.socket.off('users-not-in-room');
    this.socket.on('users-not-in-room', (users) => {
      callback(users);
    });
  }

  onUserUpdated(callback: (user: ReturnUser) => void): void {
    this.socket.off('user-updated');
    this.socket.on('user-updated', (user) => {
      callback(user);
    });
  }

  onUserCreated(callback: (user: ReturnUser) => void): void {
    this.socket.off('user-created');
    this.socket.on('user-created', (user) => {
      callback(user);
    });
  }

  onUserDeleted(callback: (user: ReturnUser) => void): void {
    this.socket.off('user-deleted');
    this.socket.on('user-deleted', (user) => {
      callback(user);
    });
  }

  onRoomUpdated(callback: (room: ReturnRoom) => void): void {
    this.socket.off('room-updated');
    this.socket.on('room-updated', (user) => {
      callback(user);
    });
  }

  onMessageCreated(callback: (message: ReturnMessage) => void): void {
    this.socket.off('message-created');
    this.socket.on('message-created', (message) => {
      callback(message);
    });
  }

  onMessageUpdated(callback: (message: ReturnMessage) => void): void {
    this.socket.off('message-updated');
    this.socket.on('message-updated', (message) => {
      callback(message);
    });
  }

  onError(callback: (error: { message: string }) => void): void {
    this.socket.off('error');
    this.socket.on('error', (error) => {
      callback(error);
    });
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }
}