import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReturnUser } from '../../../../core/models/user/return-user.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { SocketService } from '../../../../core/services/socket/socket.service';

@Component({
  selector: 'app-new-room-modal',
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
    MatSelectModule
  ],
  templateUrl: './new-room-modal.component.html',
  styleUrl: './new-room-modal.component.css'
})
export class NewRoomModalComponent {
  user!: ReturnUser;
  roomForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private socketService: SocketService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<NewRoomModalComponent>
  ) { }

  ngOnInit() {
    this.roomForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
    });

    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });
  }

  onSubmit(): void {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }

    const createRoom = {
      ...this.roomForm.value,
      hospitalId: this.user.hospitalId,
    };

    this.socketService.createRoom(createRoom);

    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
