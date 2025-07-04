import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReturnRoom } from '../../core/models/room/return-room.model';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-room-details-modal',
  standalone: true,
  imports: [MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatIconModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  templateUrl: './room-details-modal.component.html',
  styleUrl: './room-details-modal.component.css'
})
export class RoomDetailsModalComponent {
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<RoomDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { room: ReturnRoom }
  ) { }

  isEdit = false;

  editForm!: FormGroup;

  ngOnInit(): void {
    this.editForm = this.formBuilder.group({
      name: [this.data.room.name, Validators.required],
      description: [this.data.room.description, Validators.required]
    });

    this.getAllParticipantsRoom();
  }

  onEdit() {
    this.isEdit = !this.isEdit;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    console.log(this.editForm.value);
  }

  getAllParticipantsRoom() {

  }

  options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
    { value: '4', label: 'Another Option 4' },
  ];
  filteredOptions = [...this.options];

  onSearch(filterValue: string): void {
    const value = filterValue.trim().toLowerCase();
    this.filteredOptions = this.options.filter((option) =>
      option.label.toLowerCase().includes(value)
    );
  }
}
