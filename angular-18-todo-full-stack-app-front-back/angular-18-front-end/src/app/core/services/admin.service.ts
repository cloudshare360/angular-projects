import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { SystemMetrics, ActivityLog, UserManagement } from '../models/admin.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  /**
   * Get system metrics and statistics
   */
  getSystemMetrics(): Observable<SystemMetrics> {
    return this.http.get<SystemMetrics>(`${this.apiUrl}/systemMetrics`);
  }

  /**
   * Get all activity logs
   */
  getActivityLogs(limit?: number): Observable<ActivityLog[]> {
    const url = limit
      ? `${this.apiUrl}/activityLogs?_limit=${limit}&_sort=timestamp&_order=desc`
      : `${this.apiUrl}/activityLogs?_sort=timestamp&_order=desc`;
    return this.http.get<ActivityLog[]>(url);
  }

  /**
   * Get recent activity logs
   */
  getRecentActivity(count: number = 10): Observable<ActivityLog[]> {
    return this.getActivityLogs(count);
  }

  /**
   * Get all users for admin management
   */
  getAllUsers(): Observable<UserManagement[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      map(users => users.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      })))
    );
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  /**
   * Update user status (activate/deactivate)
   */
  updateUserStatus(userId: string, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, { isActive });
  }

  /**
   * Update user role
   */
  updateUserRole(userId: string, role: 'user' | 'admin'): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, { role });
  }

  /**
   * Delete user (admin only)
   */
  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
  }

  /**
   * Get user statistics
   */
  getUserStats(): Observable<{
    total: number;
    active: number;
    inactive: number;
    admins: number;
    regularUsers: number;
    verified: number;
    unverified: number;
  }> {
    return this.getAllUsers().pipe(
      map(users => ({
        total: users.length,
        active: users.filter(u => u.isActive).length,
        inactive: users.filter(u => !u.isActive).length,
        admins: users.filter(u => u.role === 'admin').length,
        regularUsers: users.filter(u => u.role === 'user').length,
        verified: users.filter(u => u.emailVerified).length,
        unverified: users.filter(u => !u.emailVerified).length
      }))
    );
  }

  /**
   * Get system health status
   */
  getSystemHealth(): Observable<SystemMetrics['systemHealth']> {
    return this.getSystemMetrics().pipe(
      map(metrics => metrics.systemHealth)
    );
  }

  /**
   * Search users
   */
  searchUsers(query: string): Observable<UserManagement[]> {
    return this.getAllUsers().pipe(
      map(users => users.filter(user =>
        user.fullName.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      ))
    );
  }

  /**
   * Get activity logs by user
   */
  getActivityLogsByUser(userId: string): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.apiUrl}/activityLogs?userId=${userId}&_sort=timestamp&_order=desc`);
  }

  /**
   * Get activity logs by entity type
   */
  getActivityLogsByType(entityType: 'todo' | 'user' | 'category'): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.apiUrl}/activityLogs?entityType=${entityType}&_sort=timestamp&_order=desc`);
  }

  /**
   * Get activity logs for date range
   */
  getActivityLogsForDateRange(startDate: string, endDate: string): Observable<ActivityLog[]> {
    return this.getActivityLogs().pipe(
      map(logs => logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= new Date(startDate) && logDate <= new Date(endDate);
      }))
    );
  }
}
