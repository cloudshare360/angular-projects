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
      
      <mat-dialog-content class="dialog-content">
        <form [formGroup]="listForm" class="list-form">
          <div class="form-field-container">
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
          </div>

          <div class="form-field-container">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" 
                       placeholder="Add list description..." rows="3"></textarea>
            </mat-form-field>
          </div>

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

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="button"
                (click)="onSave()" 
                [disabled]="listForm.invalid || isLoading">
          <mat-icon *ngIf="isLoading" class="loading-icon">refresh</mat-icon>
          {{ data.mode === 'create' ? 'Create List' : 'Update List' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .list-modal {
      width: 500px;
      max-width: 95vw;
      min-height: 450px;
      padding: 20px;
      box-sizing: border-box;
    }

    .dialog-content {
      padding: 20px !important;
      margin: 0;
      overflow: visible;
      min-height: 350px;
    }

    .list-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 0;
      margin: 0;
    }

    .form-field-container {
      width: 100%;
      margin-bottom: 16px;
      position: relative;
    }

    .full-width {
      width: 100%;
    }

    /* Fix Material form field overlapping and spacing */
    ::ng-deep .mat-mdc-form-field {
      width: 100%;
      margin-bottom: 20px;
      display: block;
    }

    ::ng-deep .mat-mdc-form-field-wrapper {
      width: 100%;
      padding-bottom: 1.5em;
    }

    ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      position: relative;
      top: 0;
      padding-top: 8px;
      min-height: 20px;
    }

    ::ng-deep .mat-mdc-form-field-error-wrapper {
      padding-top: 8px;
      position: relative;
    }

    ::ng-deep .mat-mdc-form-field-outline {
      top: 0;
    }

    ::ng-deep .mat-mdc-form-field-infix {
      padding-top: 16px;
      padding-bottom: 16px;
    }    ::ng-deep .mat-mdc-form-field-outline {
      top: 0;
    }

    ::ng-deep .mat-mdc-form-field-infix {
      padding-top: 16px;
      padding-bottom: 16px;
    }

    .color-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px 0;
    }

    .color-label {
      font-weight: 500;
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .color-options {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    .color-option {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      border: 3px solid transparent;
      transition: all 0.3s ease;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .color-option:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .color-option.selected {
      border-color: #1976d2;
      transform: scale(1.2);
      box-shadow: 0 4px 16px rgba(25, 118, 210, 0.4);
    }

    .color-option.selected::after {
      content: '✓';
      position: absolute;
      color: white;
      font-weight: bold;
      font-size: 14px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
    }

    .toggle-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 0;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .toggle-description {
      font-size: 12px;
      color: #666;
      margin-left: 24px;
      margin-top: 4px;
    }

    ::ng-deep .mat-mdc-slide-toggle {
      margin: 8px 0;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #333;
      margin-bottom: 16px;
      font-size: 20px;
      font-weight: 500;
    }

    .dialog-actions {
      padding: 16px 0 8px 0 !important;
      margin-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    button[mat-raised-button] {
      min-width: 120px;
      height: 40px;
    }

    button[mat-button] {
      min-width: 80px;
      height: 40px;
    }

    .loading-icon {
      animation: spin 1s linear infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    ::ng-deep .mat-mdc-form-field-error {
      font-size: 12px;
      line-height: 1.2;
      margin-top: 4px;
    }

    /* Responsive design */
    @media (max-width: 600px) {
      .list-modal {
        width: 100%;
        max-width: 100vw;
        height: 100%;
        max-height: 100vh;
      }

      .dialog-content {
        padding: 16px !important;
      }

      .color-options {
        justify-content: center;
        gap: 8px;
      }

      .color-option {
        width: 32px;
        height: 32px;
      }

      .list-form {
        gap: 20px;
      }
    }

    /* Prevent dialog backdrop issues */
    ::ng-deep .cdk-overlay-container {
      z-index: 1000;
    }

    ::ng-deep .cdk-overlay-backdrop {
      background: rgba(0, 0, 0, 0.32);
    }

    ::ng-deep .custom-backdrop {
      background: rgba(0, 0, 0, 0.4);
    }

    ::ng-deep .custom-dialog-container {
      position: relative;
      overflow: visible;
    }

    /* Fix any Material theme conflicts */
    ::ng-deep .mat-mdc-dialog-container {
      --mdc-dialog-container-color: white;
      --mdc-dialog-supporting-text-color: #333;
      padding: 0;
      overflow: visible;
    }

    ::ng-deep .mat-mdc-dialog-surface {
      overflow: visible;
      padding: 0;
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