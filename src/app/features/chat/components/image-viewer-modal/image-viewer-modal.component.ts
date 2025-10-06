import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-image-viewer-modal',
  standalone: true,
  imports: [
    MatIconModule,
  ],
  templateUrl: './image-viewer-modal.component.html',
  styleUrl: './image-viewer-modal.component.css'
})
export class ImageViewerModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: SafeUrl },
    private dialogRef: MatDialogRef<ImageViewerModalComponent>
  ) { }

  close(): void {
    this.dialogRef.close();
  }
}
