import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { SocketService } from '../../../core/services/socket/socket.service';
import { NgClass, NgIf, NgFor, NgStyle, DatePipe } from '@angular/common';
import { ReturnMessage } from '../../../core/models/message/return-message.model';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ReturnUser } from '../../../core/models/user/return-user.model';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [
    NgClass,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    NgStyle,
    DatePipe
  ],
  templateUrl: './chat-messages.component.html',
  styleUrl: './chat-messages.component.css'
})
export class ChatMessagesComponent implements OnInit, AfterViewChecked {
  @Input() roomId!: string;
  user!: ReturnUser;
  messages: ReturnMessage[] = [];
  newMessage = '';
  
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(
    private socketService: SocketService,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe((user) => {
      if (user) this.user = user;
    });
  }

  ngOnInit() {
    this.socketService.onRoomMessages((messages) => {
      this.messages = messages;
      this.scrollToBottom();

      this.markMessagesAsRead();
    });

    this.socketService.onNewMessage((message) => {
      this.messages.push(message);
      this.scrollToBottom();

      this.markMessagesAsRead();
    });

    this.socketService.onMessageSeenByAll((message) => {
      const messageIndex = this.messages.findIndex((msg) => msg.id === message.messageId);

      if (messageIndex !== -1) this.messages[messageIndex].seenByAll = message.seenByAll;
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  sendMessage(): void {
    const createMessageDto: any = {
      content: this.newMessage,
      roomId: this.roomId,
    };

    if (this.newMessage.trim()) {
      this.socketService.sendMessage(createMessageDto);
      this.newMessage = '';
    }
  }

  markMessagesAsRead(): void {
    if (this.roomId) {
      this.socketService.markMessagesAsRead(this.roomId);
    }
  }

  isMyMessage(message: ReturnMessage): boolean {
    return message.sender.id === this.user.id;
  }
}