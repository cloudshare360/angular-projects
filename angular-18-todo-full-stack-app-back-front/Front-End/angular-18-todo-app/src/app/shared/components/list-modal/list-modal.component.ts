import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TodoList, CreateListRequest, UpdateListRequest } from '../../../shared/interfaces/models';

export interface ListModalData {
    list?: TodoList;
    mode: 'create' | 'edit';
}

@Component({
    selector: 'app-list-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSlideToggleModule
    ],
    template: `
    <div class="list-modal">
      <h2 mat-dialog-title>
        <mat-icon>{{ data.mode === 'create' ? 'playlist_add' : 'edit' }}</mat-icon>
        {{ data.mode === 'create' ? 'Create New List' : 'Edit List' }}
      </h2>
      
      <mat-dialog-content>
        <form [formGroup]="listForm" class="list-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>List Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter list name..." required>
            <mat-error *ngIf="listForm.get('name')?.hasError('required')">
              List name is required
            </mat-error>
            <mat-error *ngIf="listForm.get('name')?.hasError('minlength')">
              List name must be at least 2 characters long
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" 
                     placeholder="Add list description..." rows="3"></textarea>
          </mat-form-field>

          <div class="color-section">
            <label class="color-label">List Color</label>
            <div class="color-options">
              <div class="color-option" 
                   *ngFor="let color of colorOptions"
                   [class.selected]="listForm.get('color')?.value === color.value"
                   [style.background-color]="color.value"
                   (click)="selectColor(color.value)"
                   [title]="color.name">
              </div>
            </div>
          </div>

          <div class="toggle-section">
            <mat-slide-toggle formControlName="isPublic">
              <span class="toggle-label">
                <mat-icon>{{ listForm.get('isPublic')?.value ? 'public' : 'lock' }}</mat-icon>
                Make this list public
              </span>
            </mat-slide-toggle>
            <div class="toggle-description">
              {{ listForm.get('isPublic')?.value ? 
                 'Other users can view this list' : 
                 'Only you can access this list' }}
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" 
                (click)="onSave()" 
                [disabled]="listForm.invalid || isLoading">
          <mat-icon *ngIf="isLoading">refresh</mat-icon>
          {{ data.mode === 'create' ? 'Create List' : 'Update List' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .list-modal {
      width: 450px;
      max-width: 90vw;
    }

    .list-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin: 16px 0;
    }

    .full-width {
      width: 100%;
    }

    .color-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .color-label {
      font-weight: 500;
      color: #666;
      font-size: 14px;
    }

    .color-options {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .color-option {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      border: 3px solid transparent;
      transition: all 0.2s ease;
      position: relative;
    }

    .color-option:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .color-option.selected {
      border-color: #333;
      transform: scale(1.15);
    }

    .color-option.selected::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-weight: bold;
      font-size: 12px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
    }

    .toggle-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toggle-description {
      font-size: 12px;
      color: #666;
      margin-left: 16px;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #333;
    }

    mat-dialog-actions {
      padding: 16px 24px;
    }

    button[mat-raised-button] {
      min-width: 120px;
    }

    .mat-mdc-form-field-error {
      font-size: 12px;
    }

    @media (max-width: 600px) {
      .list-modal {
        width: 100%;
        height: 100%;
      }

      .color-options {
        justify-content: center;
      }
    }
  `]
})
export class ListModalComponent {
    listForm: FormGroup;
    isLoading = false;

    colorOptions = [
        { name: 'Blue', value: '#2196F3' },
        { name: 'Green', value: '#4CAF50' },
        { name: 'Orange', value: '#FF9800' },
        { name: 'Red', value: '#F44336' },
        { name: 'Purple', value: '#9C27B0' },
        { name: 'Teal', value: '#009688' },
        { name: 'Pink', value: '#E91E63' },
        { name: 'Indigo', value: '#3F51B5' },
        { name: 'Brown', value: '#795548' },
        { name: 'Grey', value: '#607D8B' }
    ];

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<ListModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ListModalData
    ) {
        this.listForm = this.createForm();

        if (data.mode === 'edit' && data.list) {
            this.populateForm(data.list);
        }
    }

    private createForm(): FormGroup {
        return this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            description: [''],
            color: [this.colorOptions[0].value, Validators.required],
            isPublic: [false]
        });
    }

    private populateForm(list: TodoList): void {
        this.listForm.patchValue({
            name: list.name,
            description: list.description || '',
            color: list.color || this.colorOptions[0].value,
            isPublic: list.isPublic || false
        });
    }

    selectColor(color: string): void {
        this.listForm.patchValue({ color });
    }

    onSave(): void {
        if (this.listForm.valid) {
            this.isLoading = true;

            const formValue = this.listForm.value;
            const listData: CreateListRequest | UpdateListRequest = {
                name: formValue.name,
                description: formValue.description,
                color: formValue.color,
                isPublic: formValue.isPublic
            };

            this.dialogRef.close({
                action: this.data.mode,
                data: listData,
                listId: this.data.list?.id
            });
        }
    }

    onCancel(): void {
        this.dialogRef.close(null);
    }
}