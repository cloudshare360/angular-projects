import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    icon?: string;
    color?: 'primary' | 'accent' | 'warn';
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    template: `
    <div class="confirm-dialog">
      <h2 mat-dialog-title>
        <mat-icon *ngIf="data.icon" [class]="'icon-' + (data.color || 'primary')">
          {{ data.icon }}
        </mat-icon>
        {{ data.title }}
      </h2>
      
      <mat-dialog-content>
        <p class="message">{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-raised-button 
                [color]="data.color || 'primary'"
                (click)="onConfirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .confirm-dialog {
      min-width: 300px;
      max-width: 400px;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .icon-primary {
      color: #1976d2;
    }

    .icon-accent {
      color: #ff4081;
    }

    .icon-warn {
      color: #f44336;
    }

    .message {
      margin: 16px 0;
      line-height: 1.5;
      color: #666;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      gap: 8px;
    }

    button[mat-raised-button] {
      min-width: 80px;
    }
  `]
})
export class ConfirmDialogComponent {
    constructor(
        private dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
    ) { }

    onConfirm(): void {
        this.dialogRef.close(true);
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }
}