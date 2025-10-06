import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { ReturnRoom } from '../../../../core/models/room/return-room.model';
import { UpdateRoom } from '../../../../core/models/room/update-room.dto';
import { ReturnUser } from '../../../../core/models/user/return-user.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { SocketService } from '../../../../core/services/socket/socket.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-room-details-modal',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatIconModule,
    MatSelectModule,
    MatListModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './room-details-modal.component.html',
  styleUrl: './room-details-modal.component.css'
})
export class RoomDetailsModalComponent {
  room!: ReturnRoom;
  user!: ReturnUser;
  usersInRoom: ReturnUser[] = [];
  usersNotInRoom: ReturnUser[] = [];
  filteredUsersNotInRoom: ReturnUser[] = [];

  selectedUserIds: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private socketService: SocketService,
    public dialogRef: MatDialogRef<RoomDetailsModalComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { room: ReturnRoom },
    private snackBar: MatSnackBar
  ) { }

  isEdit = false;

  editForm!: FormGroup;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.room = this.data.room;

    this.editForm = this.formBuilder.group({
      name: [this.room.name, [Validators.required, Validators.minLength(3)]],
      description: [this.room.description, [Validators.required, Validators.minLength(5)]],
    });

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) this.user = user;
      });

    this.socketService.roomsUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rooms) => {
        const room = rooms.find(r => r.id === this.room.id);
        if (room) this.room = room;
      });

    this.onUsersInRoom();
    this.onUsersNotInRoom();
    this.socketService.requestUsersInRoom(this.room.id);
    this.socketService.requestUsersNotInRoom(this.room.id);

    this.socketService.onRoomUpdated((room) => {
      this.snackBar.open('Sala atualizada com sucesso!', 'Fechar', { duration: 3000 });
      this.room = room;
      this.isEdit = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onUsersInRoom() {
    this.socketService.onUsersInRoom((users) => {
      console.log('users in room', users);
      this.usersInRoom = users;
    });
  }

  onUsersNotInRoom() {
    this.socketService.onUsersNotInRoom((users) => {
      this.usersNotInRoom = users;
      this.filteredUsersNotInRoom = users;
    });
  }

  onEdit() {
    this.isEdit = !this.isEdit;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.editForm.invalid) return;

    const updateRoom: UpdateRoom = this.editForm.value;

    this.socketService.updateRoom(this.room.id, updateRoom);
  }


  onSearch(filterValue: string) {
    const value = filterValue.trim().toLowerCase();
    this.filteredUsersNotInRoom = this.usersNotInRoom.filter((user) =>
      user.name.toLowerCase().includes(value)
    );
  }

  addUsersToRoom() {
    if (this.selectedUserIds.length === 0) return;

    const joinRoom = {
      roomId: this.room.id,
      userIds: this.selectedUserIds,
    };

    this.socketService.joinRoom(joinRoom);
  }

  leaveRoom() {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '400px',
      data: { message: 'Tem certeza que deseja sair desta sala?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.socketService.leaveRoom({
          roomId: this.room.id
        });

        this.dialogRef.close();
      }
    });
  }

  get isRoomAdmin(): boolean {
    return this.user?.id === this.room.adminId;
  }

  confirmRemoveUser(user: ReturnUser) {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '420px',
      data: { message: `Remover ${user.name} desta sala?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.socketService.removeUserFromRoom({
          roomId: this.room.id,
          userId: user.id
        });
      }
    });
  }

  showError(err: HttpErrorResponse) {
    const errorMessage = err?.error?.message || 'Erro inesperado. Tente novamente.';
    this.snackBar.open(errorMessage, 'Fechar', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['mat-warn']
    });
  }
}
