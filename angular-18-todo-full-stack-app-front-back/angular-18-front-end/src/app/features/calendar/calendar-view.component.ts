import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  todos: any[];
}

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})
export class CalendarViewComponent implements OnInit {
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();

  calendarDays: CalendarDay[] = [];
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Mock todos data - in production, fetch from service
  allTodos = [
    { id: 1, title: 'Team Meeting', dueDate: new Date(2025, 9, 5), priority: 'high', completed: false },
    { id: 2, title: 'Project Review', dueDate: new Date(2025, 9, 10), priority: 'medium', completed: false },
    { id: 3, title: 'Client Call', dueDate: new Date(2025, 9, 15), priority: 'high', completed: false },
    { id: 4, title: 'Code Review', dueDate: new Date(2025, 9, 18), priority: 'medium', completed: true },
    { id: 5, title: 'Deploy to Production', dueDate: new Date(2025, 9, 22), priority: 'high', completed: false },
    { id: 6, title: 'Documentation Update', dueDate: new Date(2025, 9, 25), priority: 'low', completed: false },
    { id: 7, title: 'Sprint Planning', dueDate: new Date(2025, 9, 28), priority: 'medium', completed: false },
    { id: 8, title: 'Write Blog Post', dueDate: new Date(2025, 9, 1), priority: 'low', completed: true },
  ];

  selectedDate: Date | null = null;
  selectedDayTodos: any[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const prevLastDay = new Date(this.currentYear, this.currentMonth, 0);

    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = lastDay.getDay();
    const lastDayDate = lastDay.getDate();
    const prevLastDayDate = prevLastDay.getDate();

    this.calendarDays = [];

    // Previous month days
    for (let i = firstDayIndex; i > 0; i--) {
      const date = new Date(this.currentYear, this.currentMonth - 1, prevLastDayDate - i + 1);
      this.calendarDays.push({
        date,
        day: prevLastDayDate - i + 1,
        isCurrentMonth: false,
        isToday: false,
        todos: this.getTodosForDate(date)
      });
    }

    // Current month days
    for (let i = 1; i <= lastDayDate; i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      const isToday = this.isToday(date);
      this.calendarDays.push({
        date,
        day: i,
        isCurrentMonth: true,
        isToday,
        todos: this.getTodosForDate(date)
      });
    }

    // Next month days
    const remainingDays = 42 - this.calendarDays.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, i);
      this.calendarDays.push({
        date,
        day: i,
        isCurrentMonth: false,
        isToday: false,
        todos: this.getTodosForDate(date)
      });
    }
  }

  getTodosForDate(date: Date): any[] {
    return this.allTodos.filter(todo => {
      const todoDate = new Date(todo.dueDate);
      return todoDate.getDate() === date.getDate() &&
             todoDate.getMonth() === date.getMonth() &&
             todoDate.getFullYear() === date.getFullYear();
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  previousMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.generateCalendar();
  }

  selectDay(day: CalendarDay): void {
    if (day.isCurrentMonth) {
      this.selectedDate = day.date;
      this.selectedDayTodos = day.todos;
    }
  }

  closeModal(): void {
    this.selectedDate = null;
    this.selectedDayTodos = [];
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getTodoCountForDay(day: CalendarDay): number {
    return day.todos.length;
  }

  getCompletedCountForDay(day: CalendarDay): number {
    return day.todos.filter(t => t.completed).length;
  }
}
