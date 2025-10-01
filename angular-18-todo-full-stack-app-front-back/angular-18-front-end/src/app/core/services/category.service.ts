import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../models/category.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/categories';
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Load all categories for the current user
   */
  loadCategories(): Observable<Category[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return new Observable(observer => observer.next([]));
    }

    return this.http.get<Category[]>(`${this.apiUrl}?userId=${currentUser.id}`)
      .pipe(
        tap(categories => {
          this.categoriesSubject.next(categories);
        })
      );
  }

  /**
   * Get all categories for the current user
   */
  getCategories(): Observable<Category[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return new Observable(observer => observer.next([]));
    }

    return this.http.get<Category[]>(`${this.apiUrl}?userId=${currentUser.id}`);
  }

  /**
   * Get a single category by ID
   */
  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new category
   */
  createCategory(request: CreateCategoryRequest): Observable<Category> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const category: Omit<Category, 'id'> = {
      userId: currentUser.id,
      name: request.name,
      color: request.color || this.getRandomColor(),
      icon: request.icon || '📁',
      createdAt: new Date().toISOString(),
      todoCount: 0
    };

    return this.http.post<Category>(this.apiUrl, category)
      .pipe(
        tap(newCategory => {
          const current = this.categoriesSubject.value;
          this.categoriesSubject.next([...current, newCategory]);
        })
      );
  }

  /**
   * Update an existing category
   */
  updateCategory(id: string, request: UpdateCategoryRequest): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/${id}`, request)
      .pipe(
        tap(updatedCategory => {
          const current = this.categoriesSubject.value;
          const index = current.findIndex(c => c.id === id);
          if (index !== -1) {
            current[index] = updatedCategory;
            this.categoriesSubject.next([...current]);
          }
        })
      );
  }

  /**
   * Delete a category
   */
  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          const current = this.categoriesSubject.value;
          this.categoriesSubject.next(current.filter(c => c.id !== id));
        })
      );
  }

  /**
   * Update category todo count
   */
  updateCategoryCount(categoryId: string, count: number): Observable<Category> {
    return this.updateCategory(categoryId, { }).pipe(
      map(category => {
        category.todoCount = count;
        return category;
      })
    );
  }

  /**
   * Get category by name
   */
  getCategoryByName(name: string): Observable<Category | undefined> {
    return this.getCategories().pipe(
      map(categories => categories.find(c => c.name.toLowerCase() === name.toLowerCase()))
    );
  }

  /**
   * Get default color for new categories
   */
  private getRandomColor(): string {
    const colors = [
      '#007bff', // Blue
      '#28a745', // Green
      '#ffc107', // Yellow
      '#dc3545', // Red
      '#6f42c1', // Purple
      '#17a2b8', // Cyan
      '#fd7e14', // Orange
      '#20c997', // Teal
      '#e83e8c', // Pink
      '#6c757d'  // Gray
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Get category statistics
   */
  getCategoryStats(): Observable<{
    total: number;
    withTodos: number;
    empty: number;
  }> {
    return this.getCategories().pipe(
      map(categories => ({
        total: categories.length,
        withTodos: categories.filter(c => c.todoCount > 0).length,
        empty: categories.filter(c => c.todoCount === 0).length
      }))
    );
  }

  /**
   * Search categories by name
   */
  searchCategories(query: string): Observable<Category[]> {
    return this.getCategories().pipe(
      map(categories =>
        categories.filter(c =>
          c.name.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }

  /**
   * Sort categories
   */
  sortCategories(categories: Category[], sortBy: 'name' | 'todoCount' | 'createdAt' = 'name'): Category[] {
    return [...categories].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'todoCount':
          return b.todoCount - a.todoCount;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }
}
