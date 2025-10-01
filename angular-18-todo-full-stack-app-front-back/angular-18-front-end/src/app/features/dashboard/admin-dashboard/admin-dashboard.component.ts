import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';
import { SystemMetrics, ActivityLog } from '../../../core/models/admin.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  metrics: SystemMetrics | null = null;
  recentActivity: ActivityLog[] = [];
  loading = true;
  error: string | null = null;
  private subscription = new Subscription();

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.subscription.add(
      this.adminService.getSystemMetrics().subscribe({
        next: (metrics) => {
          this.metrics = metrics;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load system metrics';
          this.loading = false;
          console.error('Error loading metrics:', err);
        }
      })
    );

    this.subscription.add(
      this.adminService.getRecentActivity(10).subscribe({
        next: (activities) => {
          this.recentActivity = activities;
        },
        error: (err) => {
          console.error('Error loading activity logs:', err);
        }
      })
    );
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  getActivityIcon(action: string): string {
    const iconMap: { [key: string]: string } = {
      'created_todo': '✨',
      'updated_todo': '✏️',
      'completed_todo': '✅',
      'deleted_todo': '🗑️',
      'created_category': '📁',
      'login': '🔐',
      'logout': '🚪',
      'registered': '👤',
      'updated_profile': '⚙️',
      'completed_subtask': '☑️',
      'updated_progress': '📊'
    };
    return iconMap[action] || '📌';
  }

  formatActivityAction(activity: ActivityLog): string {
    const actionMap: { [key: string]: string } = {
      'created_todo': 'Created a new todo',
      'updated_todo': 'Updated todo',
      'completed_todo': 'Completed todo',
      'deleted_todo': 'Deleted todo',
      'created_category': 'Created category',
      'login': 'User logged in',
      'logout': 'User logged out',
      'registered': 'New user registered',
      'updated_profile': 'Updated profile',
      'completed_subtask': 'Completed subtask',
      'updated_progress': 'Updated task progress'
    };
    return actionMap[activity.action] || activity.action.replace('_', ' ');
  }

  formatRelativeTime(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'N/A';
    }
  }

  viewSystemLogs(): void {
    console.log('Viewing system logs');
  }

  viewAnalytics(): void {
    console.log('Viewing analytics');
  }
}