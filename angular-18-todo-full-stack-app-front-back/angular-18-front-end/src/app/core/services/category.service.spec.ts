import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService } from './category.service';
import { AuthService } from './auth.service';
import { Category } from '../models/category.model';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'user' as const,
    isActive: true,
    emailVerified: true,
    createdAt: '2024-01-01',
    lastLoginAt: '2024-01-01',
    profileImage: '',
    settings: {
      theme: 'light' as const,
      notifications: true,
      language: 'en'
    }
  };

  const mockCategories: Category[] = [
    {
      id: '1',
      userId: '1',
      name: 'Work',
      color: '#007bff',
      icon: '💼',
      createdAt: '2024-01-01',
      todoCount: 5
    },
    {
      id: '2',
      userId: '1',
      name: 'Personal',
      color: '#28a745',
      icon: '🏠',
      createdAt: '2024-01-02',
      todoCount: 3
    }
  ];

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CategoryService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    authService.getCurrentUser.and.returnValue(mockUser);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadCategories', () => {
    it('should load categories for current user', (done) => {
      service.loadCategories().subscribe(categories => {
        expect(categories).toEqual(mockCategories);
        expect(categories.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/categories?userId=1');
      expect(req.request.method).toBe('GET');
      req.flush(mockCategories);
    });

    it('should return empty array if user not authenticated', (done) => {
      authService.getCurrentUser.and.returnValue(null);

      service.loadCategories().subscribe(categories => {
        expect(categories).toEqual([]);
        done();
      });
    });
  });

  describe('getCategories', () => {
    it('should get all categories for current user', (done) => {
      service.getCategories().subscribe(categories => {
        expect(categories).toEqual(mockCategories);
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/categories?userId=1');
      expect(req.request.method).toBe('GET');
      req.flush(mockCategories);
    });
  });

  describe('getCategoryById', () => {
    it('should get category by id', (done) => {
      const mockCategory = mockCategories[0];

      service.getCategoryById('1').subscribe(category => {
        expect(category).toEqual(mockCategory);
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/categories/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockCategory);
    });
  });

  describe('createCategory', () => {
    it('should create a new category', (done) => {
      const newCategoryRequest = {
        name: 'Health',
        color: '#dc3545',
        icon: '❤️'
      };

      const expectedCategory: Category = {
        id: '3',
        userId: '1',
        name: 'Health',
        color: '#dc3545',
        icon: '❤️',
        createdAt: '2024-01-03',
        todoCount: 0
      };

      service.createCategory(newCategoryRequest).subscribe(category => {
        expect(category.name).toBe(expectedCategory.name);
        expect(category.color).toBe(expectedCategory.color);
        expect(category.icon).toBe(expectedCategory.icon);
        expect(category.userId).toBe('1');
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/categories');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.name).toBe('Health');
      expect(req.request.body.userId).toBe('1');
      req.flush(expectedCategory);
    });

    it('should throw error if user not authenticated', () => {
      authService.getCurrentUser.and.returnValue(null);

      expect(() => {
        service.createCategory({ name: 'Test' }).subscribe();
      }).toThrowError('User not authenticated');
    });
  });

  describe('updateCategory', () => {
    it('should update a category', (done) => {
      const updatedCategory = { ...mockCategories[0], name: 'Updated Work' };

      service.updateCategory('1', { name: 'Updated Work' }).subscribe(category => {
        expect(category.name).toBe('Updated Work');
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/categories/1');
      expect(req.request.method).toBe('PATCH');
      req.flush(updatedCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', (done) => {
      service.deleteCategory('1').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/categories/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('getCategoryStats', () => {
    it('should calculate category statistics', (done) => {
      service.getCategoryStats().subscribe(stats => {
        expect(stats.total).toBe(2);
        expect(stats.withTodos).toBe(2);
        expect(stats.empty).toBe(0);
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/categories?userId=1');
      req.flush(mockCategories);
    });
  });

  describe('searchCategories', () => {
    it('should search categories by name', (done) => {
      service.searchCategories('work').subscribe(categories => {
        expect(categories.length).toBe(1);
        expect(categories[0].name).toBe('Work');
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/categories?userId=1');
      req.flush(mockCategories);
    });
  });

  describe('sortCategories', () => {
    it('should sort categories by name', () => {
      const sorted = service.sortCategories(mockCategories, 'name');
      expect(sorted[0].name).toBe('Personal');
      expect(sorted[1].name).toBe('Work');
    });

    it('should sort categories by todoCount', () => {
      const sorted = service.sortCategories(mockCategories, 'todoCount');
      expect(sorted[0].todoCount).toBe(5);
      expect(sorted[1].todoCount).toBe(3);
    });

    it('should sort categories by createdAt', () => {
      const sorted = service.sortCategories(mockCategories, 'createdAt');
      expect(sorted[0].createdAt).toBe('2024-01-02');
      expect(sorted[1].createdAt).toBe('2024-01-01');
    });
  });
});
