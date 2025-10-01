import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface CategoryStats {
  name: string;
  total: number;
  completed: number;
  percentage: number;
  color: string;
}

interface DailyProgress {
  date: string;
  completed: number;
  created: number;
}

@Component({
  selector: 'app-progress-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-view.component.html',
  styleUrls: ['./progress-view.component.css']
})
export class ProgressViewComponent implements OnInit {
  // Overall Stats
  totalTodos = 45;
  completedTodos = 32;
  pendingTodos = 13;
  overallProgress = 71;

  // Streak
  currentStreak = 12;
  longestStreak = 18;

  // Category Stats
  categoryStats: CategoryStats[] = [
    { name: 'Work', total: 20, completed: 15, percentage: 75, color: '#4f46e5' },
    { name: 'Personal', total: 12, completed: 9, percentage: 75, color: '#10b981' },
    { name: 'Shopping', total: 8, completed: 5, percentage: 62, color: '#f59e0b' },
    { name: 'Health', total: 5, completed: 3, percentage: 60, color: '#ef4444' }
  ];

  // Priority Stats
  priorityStats = [
    { name: 'High', count: 8, color: '#ef4444' },
    { name: 'Medium', count: 15, color: '#f59e0b' },
    { name: 'Low', count: 9, color: '#10b981' }
  ];

  // Weekly Progress
  weeklyProgress: DailyProgress[] = [
    { date: 'Mon', completed: 5, created: 3 },
    { date: 'Tue', completed: 4, created: 6 },
    { date: 'Wed', completed: 6, created: 4 },
    { date: 'Thu', completed: 3, created: 5 },
    { date: 'Fri', completed: 7, created: 2 },
    { date: 'Sat', completed: 4, created: 1 },
    { date: 'Sun', completed: 3, created: 2 }
  ];

  // Time Stats
  averageCompletionTime = '2.5 days';
  mostProductiveDay = 'Friday';
  mostProductiveTime = '9:00 AM - 11:00 AM';

  // Achievements
  achievements = [
    { icon: '🎯', title: 'Task Master', description: 'Completed 30+ tasks', unlocked: true },
    { icon: '🔥', title: 'On Fire!', description: '7-day streak', unlocked: true },
    { icon: '⭐', title: 'Perfect Week', description: 'Complete all tasks in a week', unlocked: false },
    { icon: '🚀', title: 'Speed Runner', description: 'Complete 10 tasks in a day', unlocked: false },
    { icon: '💎', title: 'Diamond User', description: 'Complete 100 tasks', unlocked: false },
    { icon: '🏆', title: 'Champion', description: '30-day streak', unlocked: false }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // In production, fetch real stats from service
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getBarHeight(value: number, max: number): number {
    return (value / max) * 100;
  }

  getMaxValue(data: DailyProgress[]): number {
    const maxCompleted = Math.max(...data.map(d => d.completed));
    const maxCreated = Math.max(...data.map(d => d.created));
    return Math.max(maxCompleted, maxCreated);
  }
}
