import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { TodoModalComponent, TodoModalData } from '../../shared/components/todo-modal/todo-modal.component';
import { ListModalComponent, ListModalData } from '../../shared/components/list-modal/list-modal.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { User, TodoList, Todo, CreateListRequest, CreateTodoRequest } from '../../shared/interfaces/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dashboard-container">
      <nav class="navbar">
        <div class="nav-brand">
          <h1>Todo Dashboard</h1>
        </div>
        <div class="nav-user" data-testid="user-menu">
          <span class="welcome-text" *ngIf="currentUser">
            Welcome, {{ currentUser.firstName }}!
          </span>
          <button class="btn btn-secondary" data-testid="logout-btn" (click)="logout()">
            Logout
          </button>
        </div>
      </nav>

      <main class="main-content">
        <div class="dashboard-grid">
          <!-- Stats Cards -->
          <div class="stats-section">
            <div class="stat-card">
              <div class="stat-number">{{ totalTodos }}</div>
              <div class="stat-label">Total Todos</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ completedTodos }}</div>
              <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ totalLists }}</div>
              <div class="stat-label">Lists</div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="actions-section">
            <h2>Quick Actions</h2>
            <div class="action-buttons">
              <button class="btn btn-primary" data-testid="add-todo-btn" (click)="createNewTodo()">
                <i class="icon">+</i>
                Add New Todo
              </button>
              <button class="btn btn-outline" data-testid="add-list-btn" (click)="createNewList()">
                <i class="icon">📋</i>
                Create List
              </button>
              <button class="btn btn-secondary" (click)="refreshData()">
                <i class="icon">🔄</i>
                Refresh
              </button>
            </div>
          </div>

          <!-- Recent Todos -->
          <div class="recent-todos">
            <h2>Recent Todos</h2>
            <div class="todo-list" *ngIf="recentTodos.length > 0; else noTodos">
              <div 
                class="todo-item" 
                *ngFor="let todo of recentTodos"
                [class.completed]="todo.isCompleted"
              >
                <div class="todo-content">
                  <div class="todo-title">{{ todo.title }}</div>
                  <div class="todo-meta">
                    <span class="priority" [class]="'priority-' + (todo.priority || 'medium')">
                      {{ todo.priority || 'medium' }}
                    </span>
                    <span class="due-date" *ngIf="todo.dueDate">
                      Due: {{ formatDate(todo.dueDate) }}
                    </span>
                  </div>
                </div>
                <div class="todo-actions">
                  <button
                    class="btn-icon edit"
                    data-testid="edit-todo-btn"
                    (click)="editTodo(todo)"
                    title="Edit todo"
                  >
                    ✏️
                  </button>
                  <button
                    class="btn-icon delete"
                    data-testid="delete-todo-btn"
                    (click)="deleteTodo(todo)"
                    title="Delete todo"
                  >
                    🗑️
                  </button>
                  <button
                    class="btn-icon toggle"
                    data-testid="toggle-todo-btn"
                    (click)="toggleTodo(todo.id)"
                    [title]="todo.isCompleted ? 'Mark as incomplete' : 'Mark as complete'"
                  >
                    {{ todo.isCompleted ? '✓' : '○' }}
                  </button>
                </div>
              </div>
            </div>
            <ng-template #noTodos>
              <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>No todos yet. Create your first one!</p>
                <button class="btn btn-primary" (click)="createNewTodo()">
                  Create Todo
                </button>
              </div>
            </ng-template>
          </div>

          <!-- Lists Overview -->
          <div class="lists-overview">
            <h2>Your Lists</h2>
            <div class="lists-grid" *ngIf="todoLists.length > 0; else noLists">
              <div 
                class="list-card" 
                *ngFor="let list of todoLists"
              >
                <div class="list-header">
                  <div class="list-color" [style.background-color]="list.color"></div>
                  <div class="list-title" (click)="openList(list.id)">{{ list.name }}</div>
                  <div class="list-actions">
                    <button 
                      class="btn-icon edit" 
                      (click)="editList(list); $event.stopPropagation()"
                      title="Edit list"
                    >
                      ✏️
                    </button>
                    <button 
                      class="btn-icon delete" 
                      (click)="deleteList(list); $event.stopPropagation()"
                      title="Delete list"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div class="list-stats" (click)="openList(list.id)">
                  <span class="todo-count">
                    {{ list.completedTodoCount || 0 }}/{{ list.todoCount || 0 }} completed
                  </span>
                </div>
                <div class="progress-bar" (click)="openList(list.id)">
                  <div 
                    class="progress-fill" 
                    [style.width.%]="getCompletionPercentage(list)"
                  ></div>
                </div>
              </div>
            </div>
            <ng-template #noLists>
              <div class="empty-state">
                <div class="empty-icon">📋</div>
                <p>No lists yet. Create your first list!</p>
                <button class="btn btn-outline" (click)="createNewList()">
                  Create List
                </button>
              </div>
            </ng-template>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f8f9fa;
    }

    .navbar {
      background: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .nav-brand h1 {
      color: #333;
      margin: 0;
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .welcome-text {
      color: #666;
      font-weight: 500;
    }

    .main-content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    /* Responsive Design for Mobile and Tablet */
    @media (max-width: 768px) {
      .main-content {
        padding: 1rem;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .nav-user {
        flex-direction: column;
        gap: 0.5rem;
      }

      .welcome-text {
        font-size: 0.9rem;
      }

      .stat-card {
        padding: 1.5rem;
      }

      .stat-number {
        font-size: 2rem;
      }
    }

    @media (max-width: 480px) {
      .main-content {
        padding: 0.5rem;
      }

      .navbar {
        padding: 1rem;
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .nav-brand h1 {
        font-size: 1.5rem;
      }

      .stat-card {
        padding: 1rem;
      }

      .stat-number {
        font-size: 1.5rem;
      }

      .actions-section, .recent-todos, .lists-overview {
        padding: 1rem;
      }

      .btn {
        padding: 10px 16px;
        font-size: 0.9rem;
      }
    }

    .stats-section {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
    }

    .stat-number {
      font-size: 3rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #666;
      font-weight: 500;
    }

    .actions-section, .recent-todos, .lists-overview {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .actions-section h2, .recent-todos h2, .lists-overview h2 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: #333;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-outline {
      background: transparent;
      border: 2px solid #667eea;
      color: #667eea;
    }

    .btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .todo-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .todo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #e1e5e9;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .todo-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .todo-item.completed {
      opacity: 0.7;
    }

    .todo-item.completed .todo-title {
      text-decoration: line-through;
    }

    .todo-content {
      flex: 1;
    }

    .todo-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .todo-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: #666;
    }

    .priority {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .priority-high {
      background: #fee2e2;
      color: #dc2626;
    }

    .priority-medium {
      background: #fef3c7;
      color: #d97706;
    }

    .priority-low {
      background: #dcfce7;
      color: #16a34a;
    }

    .btn-icon {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .btn-icon:hover {
      background: #f8f9fa;
    }

    .lists-grid {
      display: grid;
      gap: 1rem;
    }

    .list-card {
      border: 1px solid #e1e5e9;
      border-radius: 8px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .list-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .list-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .list-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .list-title {
      font-weight: 600;
      color: #333;
    }

    .list-stats {
      color: #666;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .progress-bar {
      height: 4px;
      background: #e1e5e9;
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .btn-icon {
      background: none;
      border: none;
      padding: 0.25rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
      margin-left: 0.25rem;
    }

    .btn-icon:hover {
      background: #f5f5f5;
      transform: scale(1.1);
    }

    .btn-icon.edit:hover {
      background: #e3f2fd;
    }

    .btn-icon.delete:hover {
      background: #ffebee;
    }

    .btn-icon.toggle:hover {
      background: #e8f5e8;
    }

    .todo-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .list-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-left: auto;
    }

    .list-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .list-title {
      font-weight: 600;
      color: #333;
      cursor: pointer;
      flex: 1;
    }

    .list-title:hover {
      color: #1976d2;
    }

    .priority-low {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .priority-medium {
      background: #fff3e0;
      color: #f57c00;
    }

    .priority-high {
      background: #ffebee;
      color: #d32f2f;
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
      
      .main-content {
        padding: 1rem;
      }
      
      .navbar {
        padding: 1rem;
      }
      
      .nav-user {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  todoLists: TodoList[] = [];
  recentTodos: Todo[] = [];

  totalTodos = 0;
  completedTodos = 0;
  totalLists = 0;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    console.log('🚀 Dashboard component initializing...');

    this.authService.currentUser$.subscribe(user => {
      console.log('👤 Current user updated:', user);
      this.currentUser = user;

      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      console.log('🔐 Auth token present:', !!token);

      if (user && token) {
        console.log('✅ User authenticated, loading dashboard data...');
        this.loadDashboardData();
      } else {
        console.warn('❌ User not authenticated or token missing');
      }
    });
  }

  private loadDashboardData(): void {
    console.log('🔄 Loading dashboard data...');

    // Load lists
    this.apiService.getLists().subscribe({
      next: (response) => {
        console.log('📋 Lists API response:', response);
        if (response.success && response.data) {
          this.todoLists = response.data;
          this.totalLists = this.todoLists.length;
          console.log(`✅ Loaded ${this.totalLists} lists:`, this.todoLists);
        } else {
          console.warn('⚠️ Lists API returned unsuccessful response:', response);
          this.todoLists = [];
          this.totalLists = 0;
        }
      },
      error: (error) => {
        console.error('❌ Error loading lists:', error);
        this.showSnackBar('Error loading lists. Please check your connection.');
        this.todoLists = [];
        this.totalLists = 0;
      }
    });

    // Load recent todos
    this.apiService.getTodos().subscribe({
      next: (response) => {
        console.log('📝 Todos API response:', response);
        if (response.success && response.data) {
          this.recentTodos = response.data
            .sort((a, b) => {
              const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
              const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
              return dateB - dateA;
            })
            .slice(0, 5);

          this.totalTodos = response.data.length;
          this.completedTodos = response.data.filter(todo => todo.isCompleted).length;
          console.log(`✅ Loaded ${this.totalTodos} todos (${this.completedTodos} completed):`, this.recentTodos);
        } else {
          console.warn('⚠️ Todos API returned unsuccessful response:', response);
          this.recentTodos = [];
          this.totalTodos = 0;
          this.completedTodos = 0;
        }
      },
      error: (error) => {
        console.error('❌ Error loading todos:', error);
        this.showSnackBar('Error loading todos. Please check your connection.');
        this.recentTodos = [];
        this.totalTodos = 0;
        this.completedTodos = 0;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  refreshData(): void {
    this.loadDashboardData();
    this.showSnackBar('Data refreshed successfully');
  }

  createNewTodo(): void {
    const dialogData: TodoModalData = {
      mode: 'create',
      listId: this.todoLists.length > 0 ? this.todoLists[0].id : undefined
    };

    const dialogRef = this.dialog.open(TodoModalComponent, {
      width: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'create') {
        this.apiService.createTodo(result.data).subscribe({
          next: (response) => {
            if (response.success) {
              this.showSnackBar('Todo created successfully');
              this.loadDashboardData();
            }
          },
          error: (error) => {
            console.error('Error creating todo:', error);
            this.showSnackBar('Error creating todo');
          }
        });
      }
    });
  }

  createNewList(): void {
    console.log('🆕 Creating new list...');
    const dialogData: ListModalData = {
      mode: 'create'
    };

    const dialogRef = this.dialog.open(ListModalComponent, {
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: dialogData,
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('📋 List modal closed with result:', result);
      if (result && result.action === 'create') {
        console.log('💾 Creating list with data:', result.data);
        this.apiService.createList(result.data).subscribe({
          next: (response) => {
            console.log('✅ List creation response:', response);
            if (response.success) {
              this.showSnackBar('List created successfully');
              console.log('🔄 Reloading dashboard data after list creation...');
              this.loadDashboardData();
            } else {
              console.error('❌ List creation failed:', response);
              this.showSnackBar('Failed to create list. Please try again.');
            }
          },
          error: (error) => {
            console.error('❌ Error creating list:', error);
            this.showSnackBar('Error creating list. Please check your connection.');
          }
        });
      }
    });
  }

  editTodo(todo: Todo): void {
    const dialogData: TodoModalData = {
      mode: 'edit',
      todo: todo,
      listId: todo.listId
    };

    const dialogRef = this.dialog.open(TodoModalComponent, {
      width: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'edit') {
        this.apiService.updateTodo(result.todoId, result.data).subscribe({
          next: (response) => {
            if (response.success) {
              this.showSnackBar('Todo updated successfully');
              this.loadDashboardData();
            }
          },
          error: (error) => {
            console.error('Error updating todo:', error);
            this.showSnackBar('Error updating todo');
          }
        });
      }
    });
  }

  deleteTodo(todo: Todo): void {
    const dialogData: ConfirmDialogData = {
      title: 'Delete Todo',
      message: `Are you sure you want to delete "${todo.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      icon: 'delete',
      color: 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.apiService.deleteTodo(todo.id).subscribe({
          next: (response) => {
            if (response.success) {
              this.showSnackBar('Todo deleted successfully');
              this.loadDashboardData();
            }
          },
          error: (error) => {
            console.error('Error deleting todo:', error);
            this.showSnackBar('Error deleting todo');
          }
        });
      }
    });
  }

  editList(list: TodoList): void {
    const dialogData: ListModalData = {
      mode: 'edit',
      list: list
    };

    const dialogRef = this.dialog.open(ListModalComponent, {
      width: '450px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'edit') {
        this.apiService.updateList(result.listId, result.data).subscribe({
          next: (response) => {
            if (response.success) {
              this.showSnackBar('List updated successfully');
              this.loadDashboardData();
            }
          },
          error: (error) => {
            console.error('Error updating list:', error);
            this.showSnackBar('Error updating list');
          }
        });
      }
    });
  }

  deleteList(list: TodoList): void {
    const todoCount = list.todoCount || 0;
    const dialogData: ConfirmDialogData = {
      title: 'Delete List',
      message: `Are you sure you want to delete "${list.name}"? This will also delete ${todoCount} todo(s) in this list. This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      icon: 'delete',
      color: 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.apiService.deleteList(list.id).subscribe({
          next: (response) => {
            if (response.success) {
              this.showSnackBar('List deleted successfully');
              this.loadDashboardData();
            }
          },
          error: (error) => {
            console.error('Error deleting list:', error);
            this.showSnackBar('Error deleting list');
          }
        });
      }
    });
  }

  openList(listId: string): void {
    // Navigate to detailed list view
    this.router.navigate(['/dashboard/list', listId]);
  }

  toggleTodo(todoId: string): void {
    this.apiService.toggleTodo(todoId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadDashboardData(); // Refresh data
          this.showSnackBar('Todo status updated');
        }
      },
      error: (error) => {
        console.error('Error toggling todo:', error);
        this.showSnackBar('Error updating todo status');
      }
    });
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  getCompletionPercentage(list: TodoList): number {
    if (!list.todoCount || list.todoCount === 0) return 0;
    const completed = list.completedTodoCount || 0;
    return (completed / list.todoCount) * 100;
  }
}