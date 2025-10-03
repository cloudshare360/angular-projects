import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../../../shared/interfaces/models';

export interface TodoModalData {
    todo?: Todo;
    listId?: string;
    mode: 'create' | 'edit';
}

@Component({
    selector: 'app-todo-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule
    ],
    template: `
    <div class="todo-modal">
      <h2 mat-dialog-title>
        <mat-icon>{{ data.mode === 'create' ? 'add_task' : 'edit' }}</mat-icon>
        {{ data.mode === 'create' ? 'Create New Todo' : 'Edit Todo' }}
      </h2>
      
      <mat-dialog-content>
        <form [formGroup]="todoForm" class="todo-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" placeholder="Enter todo title..." required>
            <mat-error *ngIf="todoForm.get('title')?.hasError('required')">
              Title is required
            </mat-error>
            <mat-error *ngIf="todoForm.get('title')?.hasError('minlength')">
              Title must be at least 3 characters long
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" 
                     placeholder="Add detailed description..." rows="3"></textarea>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Priority</mat-label>
              <mat-select formControlName="priority">
                <mat-option value="low">
                  <mat-icon class="priority-icon low">flag</mat-icon>
                  Low
                </mat-option>
                <mat-option value="medium">
                  <mat-icon class="priority-icon medium">flag</mat-icon>
                  Medium
                </mat-option>
                <mat-option value="high">
                  <mat-icon class="priority-icon high">flag</mat-icon>
                  High
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="personal">Personal</mat-option>
                <mat-option value="work">Work</mat-option>
                <mat-option value="shopping">Shopping</mat-option>
                <mat-option value="health">Health</mat-option>
                <mat-option value="finance">Finance</mat-option>
                <mat-option value="other">Other</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Due Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="dueDate" readonly>
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Tags (comma-separated)</mat-label>
            <input matInput formControlName="tags" placeholder="urgent, important, review...">
            <mat-hint>Separate tags with commas</mat-hint>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" 
                (click)="onSave()" 
                [disabled]="todoForm.invalid || isLoading">
          <mat-icon *ngIf="isLoading">refresh</mat-icon>
          {{ data.mode === 'create' ? 'Create Todo' : 'Update Todo' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .todo-modal {
      width: 500px;
      max-width: 90vw;
    }

    .todo-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 16px 0;
    }

    .full-width {
      width: 100%;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .priority-icon {
      margin-right: 8px;
      vertical-align: middle;
    }

    .priority-icon.low {
      color: #4caf50;
    }

    .priority-icon.medium {
      color: #ff9800;
    }

    .priority-icon.high {
      color: #f44336;
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

    mat-icon[matIconSuffix] {
      cursor: pointer;
    }

    .mat-mdc-form-field-error {
      font-size: 12px;
    }

    @media (max-width: 600px) {
      .todo-modal {
        width: 100%;
        height: 100%;
      }

      .form-row {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class TodoModalComponent {
    todoForm: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<TodoModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: TodoModalData
    ) {
        this.todoForm = this.createForm();

        if (data.mode === 'edit' && data.todo) {
            this.populateForm(data.todo);
        }
    }

    private createForm(): FormGroup {
        return this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            priority: ['medium', Validators.required],
            category: ['personal', Validators.required],
            dueDate: [''],
            tags: ['']
        });
    }

    private populateForm(todo: Todo): void {
        this.todoForm.patchValue({
            title: todo.title,
            description: todo.description || '',
            priority: todo.priority || 'medium',
            category: todo.category || 'personal',
            dueDate: todo.dueDate ? new Date(todo.dueDate) : '',
            tags: todo.tags ? todo.tags.join(', ') : ''
        });
    }

    onSave(): void {
        if (this.todoForm.valid) {
            this.isLoading = true;

            const formValue = this.todoForm.value;
            const tags = formValue.tags
                ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
                : [];

            const todoData: CreateTodoRequest | UpdateTodoRequest = {
                title: formValue.title,
                description: formValue.description,
                priority: formValue.priority,
                category: formValue.category,
                dueDate: formValue.dueDate ? formValue.dueDate.toISOString() : undefined,
                tags,
                ...(this.data.listId && { listId: this.data.listId })
            };

            this.dialogRef.close({
                action: this.data.mode,
                data: todoData,
                todoId: this.data.todo?.id
            });
        }
    }

    onCancel(): void {
        this.dialogRef.close(null);
    }
}