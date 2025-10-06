import { DatePipe } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ReturnMessage } from '../../../../core/models/message/return-message.model';
import { ReturnRoom } from '../../../../core/models/room/return-room.model';
import { ReturnUser } from '../../../../core/models/user/return-user.model';
import { ArchiveService } from '../../../../core/services/archive/archive.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { SocketService } from '../../../../core/services/socket/socket.service';
import { ImageViewerModalComponent } from '../image-viewer-modal/image-viewer-modal.component';
import { RoomDetailsModalComponent } from '../room-details-modal/room-details-modal.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    DatePipe
  ],
  templateUrl: './chat-messages.component.html',
  styleUrl: './chat-messages.component.css'
})
export class ChatMessagesComponent implements OnInit, AfterViewChecked {
  @Input() room!: ReturnRoom;
  user!: ReturnUser;
  messages: ReturnMessage[] = [];
  newMessage = '';
  files: File[] = [];

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  imageUrls = new Map<string, SafeUrl>();

  private destroy$ = new Subject<void>();

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private archiveService: ArchiveService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog
  ) {
    this.authService.currentUser$.subscribe(user => {
      if (user) this.user = user;
    });
  }

  ngOnInit() {
    this.onRoomMessages();
    this.socketService.requestRoomMessages(this.room.id);
    this.onNewMessage();
    this.onMessageSeenByAll();

    this.socketService.roomsUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(rooms => {
        const updated = rooms.find(r => r.id === this.room.id);
        if (updated) this.room = updated;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['room'] && changes['room'].currentValue) {
      this.socketService.requestRoomMessages(this.room.id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRoomMessages() {
    this.socketService.onRoomMessages((messages) => {
      this.messages = messages;
      this.preloadImages(messages);
      this.scrollToBottom();
      this.markMessagesAsRead();
    });
  }

  onNewMessage() {
    this.socketService.onNewMessage(message => {
      this.messages.push(message);
      if (message.archives?.length) this.preloadImages([message]);
      this.scrollToBottom();
      this.markMessagesAsRead();
    });
  }

  onMessageSeenByAll() {
    this.socketService.onMessageSeenByAll((update) => {

      const idx = this.messages.findIndex((msg) => msg.id === update.messageId);
      if (idx !== -1) this.messages[idx].seenByAll = update.seenByAll;
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch { }
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.files = Array.from(input.files);
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result as string;
        resolve(data.split(',')[1]);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() && this.files.length === 0) return;

    const filesPayload = await Promise.all(
      this.files.map(async (f) => ({
        name: f.name,
        type: f.type,
        content: await this.fileToBase64(f)
      }))
    );

    const createMessage = {
      content: this.newMessage,
      roomId: this.room.id,
      files: filesPayload.length ? filesPayload : undefined
    };

    this.socketService.sendMessage(createMessage);

    this.newMessage = '';
    this.files = [];
  }

  markMessagesAsRead(): void {
    if (this.room.id) this.socketService.markMessagesAsRead(this.room.id);
  }

  isMyMessage(msg: ReturnMessage): boolean {
    return msg.sender.id === this.user.id;
  }

  preloadImages(messages: ReturnMessage[]): void {
    const filenames = messages.flatMap((m) => m.archives?.map((a) => a.name) ?? []);
    this.loadImage(filenames);
  }

  loadImage(filenames: string[]): void {
    filenames.forEach((name) => {
      if (!this.imageUrls.has(name)) {
        this.archiveService.getImage(name).subscribe({
          next: blob => {
            const url = URL.createObjectURL(blob);
            this.imageUrls.set(name, this.sanitizer.bypassSecurityTrustUrl(url));
          },
          error: err => console.error('Erro ao carregar imagem', err)
        });
      }
    });
  }

  typeArchive(type: string): 'image' | 'pdf' | 'other' {
    if (type.startsWith('image/')) {
      return 'image';
    } else if (type === 'application/pdf') {
      return 'pdf';
    } else {
      return 'other';
    }
  }

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  clearFiles(): void {
    this.files = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  openImageViewer(imageUrl: SafeUrl): void {
    this.dialog.open(ImageViewerModalComponent, {
      data: { imageUrl },
      panelClass: 'fullscreen-modal',
      backdropClass: 'dark-backdrop'
    });
  }

  openDetailsRoom(room: ReturnRoom): void {
    this.dialog.open(RoomDetailsModalComponent, {
      data: { room },
      width: '60%'
    });
  }
}