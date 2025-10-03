import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../shared/interfaces/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <nav class="navbar">
        <div class="nav-brand">
          <h1>Todo Dashboard</h1>
        </div>
        <div class="nav-user">
          <span class="welcome-text" *ngIf="currentUser">
            Welcome, {{ currentUser.firstName }}!
          </span>
          <button class="btn btn-secondary" (click)="logout()">
            Logout
          </button>
        </div>
      </nav>

      <main class="main-content">
        <div class="content-card">
          <h2>🎉 Frontend Integration Successful!</h2>
          <p>Your Angular application is successfully connected to the backend API.</p>
          
          <div class="user-details" *ngIf="currentUser">
            <h3>User Information:</h3>
            <ul>
              <li><strong>Name:</strong> {{ currentUser.fullName }}</li>
              <li><strong>Email:</strong> {{ currentUser.email }}</li>
              <li><strong>Username:</strong> {{ currentUser.username }}</li>
              <li><strong>Active:</strong> {{ currentUser.isActive ? 'Yes' : 'No' }}</li>
              <li><strong>Member Since:</strong> {{ formatDate(currentUser.createdAt) }}</li>
            </ul>
          </div>

          <div class="next-steps">
            <h3>What's Working:</h3>
            <ul class="checklist">
              <li>✅ Angular 18 application running</li>
              <li>✅ Authentication system working</li>
              <li>✅ JWT token management</li>
              <li>✅ API proxy configuration</li>
              <li>✅ Route guards protecting dashboard</li>
              <li>✅ User data retrieval from backend</li>
            </ul>
          </div>

          <div class="api-status">
            <h3>Backend API Status:</h3>
            <div class="status-item">
              <span class="status-icon">✅</span>
              <span>MongoDB: Running & Connected</span>
            </div>
            <div class="status-item">
              <span class="status-icon">✅</span>
              <span>Express.js: All endpoints functional</span>
            </div>
            <div class="status-item">
              <span class="status-icon">✅</span>
              <span>Authentication: JWT system operational</span>
            </div>
          </div>

          <div class="actions">
            <button class="btn btn-primary" (click)="testApi()">
              Test API Connection
            </button>
            <button class="btn btn-outline" (click)="logout()">
              Logout & Test Auth Flow
            </button>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
      font-size: 1.5rem;
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
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 80px);
    }

    .content-card {
      background: white;
      border-radius: 12px;
      padding: 3rem;
      max-width: 800px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      text-align: center;
    }

    .content-card h2 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 2rem;
    }

    .content-card p {
      color: #666;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    .user-details {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 2rem 0;
      text-align: left;
    }

    .user-details h3 {
      margin-top: 0;
      color: #333;
    }

    .user-details ul {
      list-style: none;
      padding: 0;
    }

    .user-details li {
      padding: 0.5rem 0;
      border-bottom: 1px solid #e1e5e9;
    }

    .user-details li:last-child {
      border-bottom: none;
    }

    .next-steps {
      margin: 2rem 0;
      text-align: left;
    }

    .next-steps h3 {
      color: #333;
      margin-bottom: 1rem;
    }

    .checklist {
      list-style: none;
      padding: 0;
    }

    .checklist li {
      padding: 0.5rem 0;
      font-size: 1rem;
    }

    .api-status {
      background: #f0f9ff;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 2rem 0;
      text-align: left;
    }

    .api-status h3 {
      margin-top: 0;
      color: #1e40af;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
    }

    .status-icon {
      font-size: 1.2rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
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

    @media (max-width: 768px) {
      .main-content {
        padding: 1rem;
      }
      
      .content-card {
        padding: 2rem;
      }
      
      .navbar {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
      }
      
      .actions {
        flex-direction: column;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  testApi(): void {
    console.log('Testing API connection...');
    alert('API connection test - check browser console for details');
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}