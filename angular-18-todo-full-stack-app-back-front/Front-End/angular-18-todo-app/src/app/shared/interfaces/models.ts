// Shared interfaces between Angular frontend and Express backend

export interface User {
  id: string; // API returns 'id' not '_id'
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string; // API includes fullName
  avatar?: string | null; // API includes avatar field
  isActive: boolean; // API includes isActive
  createdAt: string; // API returns ISO string
  lastLogin?: string; // API includes lastLogin
}

export interface TodoList {
  id: string; // API returns 'id' not '_id'
  name: string; // API uses 'name' not 'title'
  description?: string;
  color?: string;
  isPublic?: boolean; // API uses 'isPublic' not 'isShared'
  userId: string; // API uses 'userId' not 'owner'
  todoCount?: number;
  completedTodoCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Todo {
  id: string; // API returns 'id' not '_id'
  title: string;
  description?: string;
  isCompleted?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string; // API returns ISO string
  tags?: string[];
  listId: string; // API uses 'listId' not 'list'
  userId: string; // API uses 'userId' not 'owner'
  order?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  refreshToken?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  listId: string; // API expects 'listId' not 'list'
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  isCompleted?: boolean;
}

export interface CreateListRequest {
  name: string; // API expects 'name' not 'title'
  description?: string;
  color?: string;
  isPublic?: boolean; // API uses 'isPublic'
}

export interface UpdateListRequest {
  name?: string; // API expects 'name' not 'title'
  description?: string;
  color?: string;
  isPublic?: boolean;
}