import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TodoService } from '../../../core/services/todo.service';
import { AuthService } from '../../../core/services/auth.service';
import { Todo } from '../../../core/models/todo.model';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="dashboard">
      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">Total Tasks</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.pending }}</div>
            <div class="stat-label">Pending</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.completed }}</div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.overdue }}</div>
            <div class="stat-label">Overdue</div>
          </div>
        </div>
      </div>

      <!-- Todo Section -->
      <div class="todo-section">
        <div class="section-header">
          <h2>My Todo List</h2>
          <div class="header-actions">
            <button class="btn btn-primary" (click)="showCreateModal = true">+ Add Todo</button>
            <button class="btn btn-secondary">⚙️ Settings</button>
          </div>
        </div>

        <!-- Quick Add -->
        <div class="quick-add" *ngIf="!showCreateModal">
          <form [formGroup]="quickAddForm" (ngSubmit)="quickAddTodo()" class="quick-add-form">
            <input 
              type="text" 
              formControlName="title"
              placeholder="Quick add a new todo..."
              class="quick-input">
            <select formControlName="priority" class="quick-select">
              <option value="medium">Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select formControlName="category" class="quick-select">
              <option value="general">Category</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="shopping">Shopping</option>
            </select>
            <button type="submit" class="btn btn-primary" [disabled]="!quickAddForm.get('title')?.value">Add</button>
          </form>
        </div>

        <!-- Filters -->
        <div class="filters">
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'all'"
            (click)="setFilter('all')">All</button>
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'pending'"
            (click)="setFilter('pending')">Pending</button>
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'completed'"
            (click)="setFilter('completed')">Completed</button>
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'high'"
            (click)="setFilter('high')">High Priority</button>
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'today'"
            (click)="setFilter('today')">Due Today</button>
          <button 
            class="filter-btn"
            [class.active]="activeFilter === 'overdue'"
            (click)="setFilter('overdue')">Overdue</button>
        </div>

        <!-- Todo List -->
        <div class="todo-list">
          <div 
            class="todo-item"
            [class.priority-high]="todo.priority === 'high'"
            [class.priority-medium]="todo.priority === 'medium'"
            [class.priority-low]="todo.priority === 'low'"
            [class.completed]="todo.status === 'completed'"
            *ngFor="let todo of filteredTodos">
            
            <input 
              type="checkbox" 
              class="todo-checkbox"
              [checked]="todo.status === 'completed'"
              (change)="toggleComplete(todo)">
            
            <div class="todo-content">
              <div class="todo-title" [class.strike]="todo.status === 'completed'">
                {{ todo.title }}
                <span class="subtask-badge" *ngIf="todo.subtasks && todo.subtasks.length > 0">
                  📋 {{ todo.subtasks.filter(st => st.completed).length }}/{{ todo.subtasks.length }}
                </span>
              </div>
              <div class="todo-meta">
                <span class="category-tag">{{ todo.category }}</span>
                <span class="due-date" *ngIf="todo.dueDate">
                  Due: {{ formatDate(todo.dueDate) }}
                </span>
                <span class="priority">Priority: {{ todo.priority }}</span>
              </div>
              <div class="todo-tags" *ngIf="todo.tags && todo.tags.length > 0">
                <span class="tag-pill" *ngFor="let tag of todo.tags">🏷️ {{ tag }}</span>
              </div>
              <div class="todo-attachments" *ngIf="todo.attachments && todo.attachments.length > 0">
                <span class="attachment-count">📎 {{ todo.attachments.length }} file(s)</span>
              </div>
            </div>

            <div class="todo-actions">
              <button class="action-btn" (click)="editTodo(todo)" title="Edit">✏️</button>
              <button class="action-btn" (click)="deleteTodo(todo)" title="Delete">🗑️</button>
              <button class="action-btn" (click)="toggleImportant(todo)" title="Important">⭐</button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="filteredTodos.length > 0">
          <button class="btn btn-secondary">← Previous</button>
          <span class="page-info">Page 1 of {{ Math.ceil(filteredTodos.length / 10) }} ({{ filteredTodos.length }} items)</span>
          <button class="btn btn-secondary">Next →</button>
        </div>
      </div>

      <!-- Create Todo Modal -->
      <div class="modal-overlay" *ngIf="showCreateModal" (click)="showCreateModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Create New Todo</h3>
            <button class="close-btn" (click)="showCreateModal = false">✕</button>
          </div>
          <form [formGroup]="createForm" (ngSubmit)="createTodo()">
            <div class="form-group">
              <label>Title *</label>
              <input type="text" formControlName="title" placeholder="Enter todo title...">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea formControlName="description" placeholder="Add detailed description..."></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Category</label>
                <select formControlName="category">
                  <option value="general">General</option>
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="shopping">Shopping</option>
                </select>
              </div>
              <div class="form-group">
                <label>Due Date</label>
                <input type="datetime-local" formControlName="dueDate">
              </div>
            </div>
            <div class="form-group">
              <label>Priority</label>
              <div class="priority-selector">
                <button type="button"
                  class="priority-btn"
                  [class.selected]="createForm.get('priority')?.value === 'high'"
                  (click)="setPriority('high')">High</button>
                <button type="button"
                  class="priority-btn"
                  [class.selected]="createForm.get('priority')?.value === 'medium'"
                  (click)="setPriority('medium')">Medium</button>
                <button type="button"
                  class="priority-btn"
                  [class.selected]="createForm.get('priority')?.value === 'low'"
                  (click)="setPriority('low')">Low</button>
              </div>
            </div>

            <!-- Tags Section -->
            <div class="form-group tags-section">
              <div class="tags-header">
                <label>Tags</label>
              </div>
              <div class="tag-input-container">
                <input
                  type="text"
                  [(ngModel)]="newTag"
                  [ngModelOptions]="{standalone: true}"
                  (keyup.enter)="addTag(newTag, 'create')"
                  placeholder="Type tag and press Enter..."
                  class="tag-input">
                <button type="button" class="btn-icon" (click)="addTag(newTag, 'create')">+ Add</button>
              </div>
              <div class="tags-list" *ngIf="createTags.length > 0">
                <span class="tag-badge" *ngFor="let tag of createTags; let i = index">
                  {{ tag }}
                  <button type="button" class="tag-remove" (click)="removeTag(i, 'create')">×</button>
                </span>
              </div>
              <div class="tags-empty" *ngIf="createTags.length === 0">
                <small class="empty-message">No tags added yet</small>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="showCreateModal = false">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="!createForm.get('title')?.value">Create Todo</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Todo Modal -->
      <div class="modal-overlay" *ngIf="showEditModal" (click)="closeEditModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Edit Todo</h3>
            <button class="close-btn" (click)="closeEditModal()">✕</button>
          </div>
          <form [formGroup]="editForm" (ngSubmit)="saveEditedTodo()">
            <div class="form-group">
              <label>Title *</label>
              <input type="text" formControlName="title" placeholder="Enter todo title...">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea formControlName="description" placeholder="Add detailed description..."></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Category</label>
                <select formControlName="category">
                  <option value="general">General</option>
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="shopping">Shopping</option>
                </select>
              </div>
              <div class="form-group">
                <label>Due Date</label>
                <input type="date" formControlName="dueDate">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Status</label>
                <div class="status-selector">
                  <button type="button"
                    class="status-btn"
                    [class.selected]="editForm.get('status')?.value === 'pending'"
                    (click)="setEditStatus('pending')">Pending</button>
                  <button type="button"
                    class="status-btn"
                    [class.selected]="editForm.get('status')?.value === 'in-progress'"
                    (click)="setEditStatus('in-progress')">In Progress</button>
                  <button type="button"
                    class="status-btn"
                    [class.selected]="editForm.get('status')?.value === 'completed'"
                    (click)="setEditStatus('completed')">Completed</button>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Priority</label>
              <div class="priority-selector">
                <button type="button"
                  class="priority-btn"
                  [class.selected]="editForm.get('priority')?.value === 'high'"
                  (click)="setEditPriority('high')">High</button>
                <button type="button"
                  class="priority-btn"
                  [class.selected]="editForm.get('priority')?.value === 'medium'"
                  (click)="setEditPriority('medium')">Medium</button>
                <button type="button"
                  class="priority-btn"
                  [class.selected]="editForm.get('priority')?.value === 'low'"
                  (click)="setEditPriority('low')">Low</button>
              </div>
            </div>
            <div class="form-group">
              <label>Progress: {{ editForm.get('progress')?.value }}%</label>
              <input type="range" formControlName="progress" min="0" max="100" step="5" class="progress-slider">
            </div>

            <!-- Subtasks Section -->
            <div class="form-group subtasks-section">
              <div class="subtasks-header">
                <label>Subtasks</label>
                <button type="button" class="btn-icon" (click)="addSubtask()" title="Add subtask">+ Add</button>
              </div>
              <div class="subtasks-list" *ngIf="editingTodo?.subtasks && editingTodo.subtasks.length > 0">
                <div class="subtask-item" *ngFor="let subtask of editingTodo.subtasks; let i = index">
                  <input
                    type="checkbox"
                    [checked]="subtask.completed"
                    (change)="toggleSubtask(i)"
                    class="subtask-checkbox">
                  <input
                    type="text"
                    [(ngModel)]="subtask.title"
                    [ngModelOptions]="{standalone: true}"
                    [class.completed]="subtask.completed"
                    class="subtask-input"
                    placeholder="Subtask title...">
                  <button type="button" class="btn-icon-small" (click)="removeSubtask(i)" title="Delete">🗑️</button>
                </div>
              </div>
              <div class="subtasks-empty" *ngIf="!editingTodo?.subtasks || editingTodo.subtasks.length === 0">
                <p class="empty-message">No subtasks yet. Click "+ Add" to create one.</p>
              </div>
              <div class="subtasks-progress" *ngIf="editingTodo?.subtasks && editingTodo.subtasks.length > 0">
                <small>{{ getCompletedSubtasksCount() }} of {{ editingTodo.subtasks.length }} completed</small>
              </div>
            </div>

            <!-- Tags Section -->
            <div class="form-group tags-section">
              <div class="tags-header">
                <label>Tags</label>
              </div>
              <div class="tag-input-container">
                <input
                  type="text"
                  [(ngModel)]="newTag"
                  [ngModelOptions]="{standalone: true}"
                  (keyup.enter)="addTag(newTag, 'edit')"
                  placeholder="Type tag and press Enter..."
                  class="tag-input">
                <button type="button" class="btn-icon" (click)="addTag(newTag, 'edit')">+ Add</button>
              </div>
              <div class="tags-list" *ngIf="editingTodo?.tags && editingTodo.tags.length > 0">
                <span class="tag-badge" *ngFor="let tag of editingTodo.tags; let i = index">
                  {{ tag }}
                  <button type="button" class="tag-remove" (click)="removeTag(i, 'edit')">×</button>
                </span>
              </div>
              <div class="tags-empty" *ngIf="!editingTodo?.tags || editingTodo.tags.length === 0">
                <small class="empty-message">No tags added yet</small>
              </div>
            </div>

            <!-- Attachments Section -->
            <div class="form-group attachments-section">
              <div class="attachments-header">
                <label>Attachments</label>
                <input
                  type="file"
                  #fileInput
                  (change)="onFileSelected($event)"
                  style="display: none"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt">
                <button type="button" class="btn-icon" (click)="fileInput.click()">📎 Upload</button>
              </div>
              <div class="attachments-list" *ngIf="editingTodo?.attachments && editingTodo.attachments.length > 0">
                <div class="attachment-item" *ngFor="let attachment of editingTodo.attachments; let i = index">
                  <div class="attachment-icon">
                    <span *ngIf="isImage(attachment.type)">🖼️</span>
                    <span *ngIf="isPdf(attachment.type)">📄</span>
                    <span *ngIf="!isImage(attachment.type) && !isPdf(attachment.type)">📎</span>
                  </div>
                  <div class="attachment-info">
                    <div class="attachment-name">{{ attachment.filename }}</div>
                    <div class="attachment-size">{{ formatFileSize(attachment.size) }}</div>
                  </div>
                  <button type="button" class="btn-icon-small" (click)="removeAttachment(i)" title="Remove">🗑️</button>
                </div>
              </div>
              <div class="attachments-empty" *ngIf="!editingTodo?.attachments || editingTodo.attachments.length === 0">
                <small class="empty-message">No attachments. Click "Upload" to add files.</small>
              </div>
              <div class="attachments-info">
                <small>Max file size: 5MB. Supported: Images, PDF, DOC, TXT</small>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="closeEditModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="!editForm.get('title')?.value">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .stats-section {
      margin-bottom: 32px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: white;
      padding: 24px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-number {
      font-size: 32px;
      font-weight: bold;
      color: #007bff;
      margin-bottom: 8px;
    }

    .stat-label {
      color: #666;
      font-size: 14px;
    }

    .todo-section {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #f0f0f0;
    }

    .section-header h2 {
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #333;
      border: 1px solid #ddd;
    }

    .btn-secondary:hover {
      background: #e9ecef;
    }

    .quick-add {
      margin-bottom: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .quick-add-form {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .quick-input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .quick-select {
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .filters {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 6px 12px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 16px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s ease;
    }

    .filter-btn:hover {
      border-color: #007bff;
    }

    .filter-btn.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .todo-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .todo-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      transition: all 0.2s ease;
      border-left: 4px solid #ddd;
    }

    .todo-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .todo-item.priority-high {
      border-left-color: #dc3545;
    }

    .todo-item.priority-medium {
      border-left-color: #ffc107;
    }

    .todo-item.priority-low {
      border-left-color: #28a745;
    }

    .todo-item.completed {
      opacity: 0.6;
      background: #f8f9fa;
    }

    .todo-checkbox {
      width: 18px;
      height: 18px;
    }

    .todo-content {
      flex: 1;
    }

    .todo-title {
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .todo-title.strike {
      text-decoration: line-through;
    }

    .subtask-badge {
      font-size: 11px;
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    .todo-meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #666;
    }

    .category-tag {
      background: #e9ecef;
      padding: 2px 6px;
      border-radius: 10px;
    }

    .todo-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.2s ease;
    }

    .action-btn:hover {
      background: #f0f0f0;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }

    .page-info {
      color: #666;
      font-size: 14px;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 6px;
      color: #333;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-group textarea {
      height: 80px;
      resize: vertical;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-row .form-group {
      flex: 1;
    }

    .priority-selector {
      display: flex;
      gap: 8px;
    }

    .priority-btn {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .priority-btn.selected {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .status-selector {
      display: flex;
      gap: 8px;
    }

    .status-btn {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
    }

    .status-btn.selected {
      background: #28a745;
      color: white;
      border-color: #28a745;
    }

    .progress-slider {
      width: 100%;
      height: 8px;
      border-radius: 4px;
      outline: none;
      -webkit-appearance: none;
      appearance: none;
      background: linear-gradient(to right, #007bff 0%, #007bff var(--value), #e9ecef var(--value), #e9ecef 100%);
    }

    .progress-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #007bff;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .progress-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #007bff;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }

    @media (max-width: 768px) {
      .dashboard {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .header-actions {
        flex-direction: column;
        gap: 8px;
      }

      .quick-add-form {
        flex-direction: column;
        align-items: stretch;
      }

      .filters {
        justify-content: flex-start;
        overflow-x: auto;
        padding-bottom: 8px;
      }

      .form-row {
        flex-direction: column;
        gap: 16px;
      }

      .priority-selector {
        flex-direction: column;
      }
    }

    /* Subtasks Styles */
    .subtasks-section {
      margin-top: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .subtasks-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .subtasks-header label {
      margin: 0;
      font-weight: 600;
      color: #333;
    }

    .btn-icon {
      background: #007bff;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: background 0.2s;
    }

    .btn-icon:hover {
      background: #0056b3;
    }

    .btn-icon-small {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      font-size: 14px;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .btn-icon-small:hover {
      opacity: 1;
    }

    .subtasks-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .subtask-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: white;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
    }

    .subtask-checkbox {
      cursor: pointer;
      width: 18px;
      height: 18px;
    }

    .subtask-input {
      flex: 1;
      padding: 6px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .subtask-input.completed {
      text-decoration: line-through;
      color: #999;
    }

    .subtasks-empty {
      text-align: center;
      padding: 20px;
    }

    .empty-message {
      color: #999;
      font-size: 14px;
      margin: 0;
    }

    .subtasks-progress {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #e0e0e0;
      text-align: right;
    }

    .subtasks-progress small {
      color: #666;
      font-size: 12px;
    }

    /* Tags Styles */
    .tags-section {
      margin-top: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .tags-header {
      margin-bottom: 12px;
    }

    .tags-header label {
      margin: 0;
      font-weight: 600;
      color: #333;
    }

    .tag-input-container {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .tag-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }

    .tag-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 500;
    }

    .tag-remove {
      background: rgba(255,255,255,0.3);
      border: none;
      color: white;
      cursor: pointer;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      line-height: 1;
      transition: background 0.2s;
    }

    .tag-remove:hover {
      background: rgba(255,255,255,0.5);
    }

    .todo-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }

    .tag-pill {
      display: inline-block;
      padding: 3px 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .tags-empty {
      text-align: center;
      padding: 12px;
    }

    .tags-empty .empty-message {
      color: #999;
      font-size: 13px;
    }

    .todo-attachments {
      display: flex;
      margin-top: 6px;
    }

    .attachment-count {
      display: inline-block;
      padding: 3px 10px;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    /* Attachments Styles */
    .attachments-section {
      margin-top: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .attachments-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .attachments-header label {
      margin: 0;
      font-weight: 600;
      color: #333;
    }

    .attachments-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .attachment-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      background: white;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
      transition: background 0.2s;
    }

    .attachment-item:hover {
      background: #f9f9f9;
    }

    .attachment-icon {
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: #f0f0f0;
      border-radius: 6px;
    }

    .attachment-info {
      flex: 1;
    }

    .attachment-name {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }

    .attachment-size {
      font-size: 12px;
      color: #999;
    }

    .attachments-empty {
      text-align: center;
      padding: 20px;
      background: white;
      border-radius: 6px;
      border: 2px dashed #ddd;
    }

    .attachments-info {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #e0e0e0;
    }

    .attachments-info small {
      color: #666;
      font-size: 12px;
    }
  `]
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  todos: Todo[] = [];
  filteredTodos: Todo[] = [];
  stats = { total: 0, pending: 0, completed: 0, overdue: 0 };
  activeFilter = 'all';
  showCreateModal = false;
  showEditModal = false;
  editingTodo: Todo | null = null;
  Math = Math;

  // Tags management
  newTag = '';
  createTags: string[] = [];

  quickAddForm: FormGroup;
  createForm: FormGroup;
  editForm: FormGroup;

  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private todoService: TodoService,
    private authService: AuthService
  ) {
    this.quickAddForm = this.fb.group({
      title: [''],
      priority: ['medium'],
      category: ['general']
    });

    this.createForm = this.fb.group({
      title: [''],
      description: [''],
      category: ['general'],
      dueDate: [''],
      priority: ['medium']
    });

    this.editForm = this.fb.group({
      title: [''],
      description: [''],
      category: ['general'],
      dueDate: [''],
      priority: ['medium'],
      status: ['pending'],
      progress: [0],
      subtasks: [[]]
    });
  }

  ngOnInit(): void {
    this.loadTodos();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadTodos(): void {
    this.subscription.add(
      this.todoService.getTodos().subscribe({
        next: (todos) => {
          this.todos = todos;
          this.applyFilter();
        },
        error: (error) => {
          console.error('Error loading todos:', error);
        }
      })
    );
  }

  loadStats(): void {
    this.subscription.add(
      this.todoService.getTodoStats().subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Error loading stats:', error);
        }
      })
    );
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    const now = new Date();
    
    switch (this.activeFilter) {
      case 'pending':
        this.filteredTodos = this.todos.filter(todo => todo.status === 'pending');
        break;
      case 'completed':
        this.filteredTodos = this.todos.filter(todo => todo.status === 'completed');
        break;
      case 'high':
        this.filteredTodos = this.todos.filter(todo => todo.priority === 'high');
        break;
      case 'today':
        this.filteredTodos = this.todos.filter(todo => {
          if (!todo.dueDate) return false;
          const dueDate = new Date(todo.dueDate);
          return dueDate.toDateString() === now.toDateString();
        });
        break;
      case 'overdue':
        this.filteredTodos = this.todos.filter(todo => {
          if (!todo.dueDate || todo.status === 'completed') return false;
          return new Date(todo.dueDate) < now;
        });
        break;
      default:
        this.filteredTodos = this.todos;
    }
  }

  quickAddTodo(): void {
    if (this.quickAddForm.get('title')?.value) {
      const todoData = this.quickAddForm.value;
      
      this.subscription.add(
        this.todoService.createTodo(todoData).subscribe({
          next: () => {
            this.quickAddForm.reset({ priority: 'medium', category: 'general' });
            this.loadTodos();
            this.loadStats();
          },
          error: (error) => {
            console.error('Error creating todo:', error);
          }
        })
      );
    }
  }

  createTodo(): void {
    if (this.createForm.get('title')?.value) {
      const todoData = {
        ...this.createForm.value,
        tags: this.createTags
      };

      this.subscription.add(
        this.todoService.createTodo(todoData).subscribe({
          next: () => {
            this.createForm.reset({ priority: 'medium', category: 'general' });
            this.createTags = [];
            this.newTag = '';
            this.showCreateModal = false;
            this.loadTodos();
            this.loadStats();
          },
          error: (error) => {
            console.error('Error creating todo:', error);
          }
        })
      );
    }
  }

  setPriority(priority: string): void {
    this.createForm.patchValue({ priority });
  }

  toggleComplete(todo: Todo): void {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    const progress = newStatus === 'completed' ? 100 : 0;
    
    this.subscription.add(
      this.todoService.updateTodo(todo.id, { status: newStatus, progress }).subscribe({
        next: () => {
          this.loadTodos();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error updating todo:', error);
        }
      })
    );
  }

  editTodo(todo: Todo): void {
    this.editingTodo = {
      ...todo,
      subtasks: todo.subtasks || [],
      tags: todo.tags || [],
      attachments: todo.attachments || []
    };
    this.editForm.patchValue({
      title: todo.title,
      description: todo.description,
      category: todo.category,
      dueDate: todo.dueDate ? this.formatDateForInput(todo.dueDate) : '',
      priority: todo.priority,
      status: todo.status,
      progress: todo.progress || 0,
      subtasks: this.editingTodo.subtasks
    });
    this.newTag = '';
    this.showEditModal = true;
  }

  saveEditedTodo(): void {
    if (!this.editForm.get('title')?.value || !this.editingTodo) {
      return;
    }

    const updateData = {
      title: this.editForm.get('title')?.value,
      description: this.editForm.get('description')?.value,
      category: this.editForm.get('category')?.value,
      dueDate: this.editForm.get('dueDate')?.value || null,
      priority: this.editForm.get('priority')?.value,
      status: this.editForm.get('status')?.value,
      progress: this.editForm.get('progress')?.value,
      subtasks: this.editingTodo.subtasks || [],
      tags: this.editingTodo.tags || [],
      attachments: this.editingTodo.attachments || []
    };

    this.subscription.add(
      this.todoService.updateTodo(this.editingTodo.id, updateData).subscribe({
        next: () => {
          this.showEditModal = false;
          this.editingTodo = null;
          this.editForm.reset();
          this.newTag = '';
          this.loadTodos();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error updating todo:', error);
        }
      })
    );
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingTodo = null;
    this.editForm.reset();
  }

  setEditPriority(priority: string): void {
    this.editForm.patchValue({ priority });
  }

  setEditStatus(status: string): void {
    this.editForm.patchValue({ status });
  }

  formatDateForInput(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  deleteTodo(todo: Todo): void {
    if (confirm('Are you sure you want to delete this todo?')) {
      this.subscription.add(
        this.todoService.deleteTodo(todo.id).subscribe({
          next: () => {
            this.loadTodos();
            this.loadStats();
          },
          error: (error) => {
            console.error('Error deleting todo:', error);
          }
        })
      );
    }
  }

  toggleImportant(todo: Todo): void {
    this.subscription.add(
      this.todoService.updateTodo(todo.id, { isImportant: !todo.isImportant }).subscribe({
        next: () => {
          this.loadTodos();
        },
        error: (error) => {
          console.error('Error updating todo:', error);
        }
      })
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  // Subtask Management Methods
  addSubtask(): void {
    if (!this.editingTodo) return;

    if (!this.editingTodo.subtasks) {
      this.editingTodo.subtasks = [];
    }

    const newSubtask = {
      id: this.generateSubtaskId(),
      title: '',
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.editingTodo.subtasks.push(newSubtask);
  }

  removeSubtask(index: number): void {
    if (!this.editingTodo || !this.editingTodo.subtasks) return;
    this.editingTodo.subtasks.splice(index, 1);
  }

  toggleSubtask(index: number): void {
    if (!this.editingTodo || !this.editingTodo.subtasks) return;
    this.editingTodo.subtasks[index].completed = !this.editingTodo.subtasks[index].completed;

    // Auto-update progress based on subtask completion
    this.updateProgressFromSubtasks();
  }

  getCompletedSubtasksCount(): number {
    if (!this.editingTodo || !this.editingTodo.subtasks) return 0;
    return this.editingTodo.subtasks.filter(st => st.completed).length;
  }

  updateProgressFromSubtasks(): void {
    if (!this.editingTodo || !this.editingTodo.subtasks || this.editingTodo.subtasks.length === 0) return;

    const completedCount = this.getCompletedSubtasksCount();
    const totalCount = this.editingTodo.subtasks.length;
    const progress = Math.round((completedCount / totalCount) * 100);

    this.editForm.patchValue({ progress });
  }

  generateSubtaskId(): string {
    return 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Tag Management Methods
  addTag(tag: string, mode: 'create' | 'edit'): void {
    const trimmedTag = tag?.trim().toLowerCase();

    if (!trimmedTag) return;

    if (mode === 'create') {
      // Check for duplicates
      if (!this.createTags.includes(trimmedTag)) {
        this.createTags.push(trimmedTag);
      }
    } else if (mode === 'edit' && this.editingTodo) {
      if (!this.editingTodo.tags) {
        this.editingTodo.tags = [];
      }
      // Check for duplicates
      if (!this.editingTodo.tags.includes(trimmedTag)) {
        this.editingTodo.tags.push(trimmedTag);
      }
    }

    this.newTag = '';
  }

  removeTag(index: number, mode: 'create' | 'edit'): void {
    if (mode === 'create') {
      this.createTags.splice(index, 1);
    } else if (mode === 'edit' && this.editingTodo?.tags) {
      this.editingTodo.tags.splice(index, 1);
    }
  }

  filterByTag(tag: string): void {
    this.filteredTodos = this.todos.filter(todo =>
      todo.tags && todo.tags.includes(tag)
    );
  }

  // Attachment Management Methods
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0 || !this.editingTodo) return;

    const maxSize = 5 * 1024 * 1024; // 5MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file size
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }

      // Create attachment object (simulate upload)
      const attachment = {
        id: this.generateAttachmentId(),
        filename: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file) // In real app, this would be a server URL
      };

      if (!this.editingTodo.attachments) {
        this.editingTodo.attachments = [];
      }

      this.editingTodo.attachments.push(attachment);
    }

    // Reset file input
    event.target.value = '';
  }

  removeAttachment(index: number): void {
    if (!this.editingTodo?.attachments) return;
    this.editingTodo.attachments.splice(index, 1);
  }

  isImage(type: string): boolean {
    return type.startsWith('image/');
  }

  isPdf(type: string): boolean {
    return type === 'application/pdf';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  generateAttachmentId(): string {
    return 'attachment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}