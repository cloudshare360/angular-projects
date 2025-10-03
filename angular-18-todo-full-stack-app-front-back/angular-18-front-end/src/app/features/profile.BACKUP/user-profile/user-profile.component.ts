import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  bio: string;
  phone: string;
  location: string;
  website: string;
  profilePicture: string;
  joinedDate: string;
  lastActive: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: UserProfile | null = null;
  isEditing = false;
  editedUser: Partial<UserProfile> = {};
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // Password change
  showPasswordChange = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Stats
  stats = {
    totalTodos: 0,
    completedTodos: 0,
    activeDays: 0,
    completionRate: 0
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadUserStats();
  }

  loadUserProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Fetch full profile from backend (mock for now)
      const username = currentUser.email.split('@')[0]; // Extract username from email
      this.user = {
        id: parseInt(currentUser.id) || 1,
        username: username,
        email: currentUser.email,
        fullName: currentUser.fullName || 'User',
        role: currentUser.role,
        bio: 'Todo enthusiast and productivity lover',
        phone: '+1 (555) 123-4567',
        location: 'New York, USA',
        website: 'https://example.com',
        profilePicture: 'https://ui-avatars.com/api/?name=' + currentUser.fullName + '&background=4f46e5&color=fff&size=200',
        joinedDate: currentUser.createdAt || '2025-09-24',
        lastActive: currentUser.lastLoginAt || new Date().toISOString()
      };

      this.editedUser = { ...this.user };
    }
  }

  loadUserStats(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Mock stats - in production, fetch from backend
      this.stats = {
        totalTodos: 12,
        completedTodos: 8,
        activeDays: 45,
        completionRate: 67
      };
    }
  }

  toggleEdit(): void {
    if (this.isEditing) {
      // Cancel editing
      this.editedUser = { ...this.user };
      this.isEditing = false;
      this.selectedFile = null;
      this.previewUrl = null;
    } else {
      this.isEditing = true;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    if (!this.user) return;

    // Validate required fields
    if (!this.editedUser.fullName?.trim()) {
      alert('Full name is required');
      return;
    }

    if (!this.editedUser.email?.trim()) {
      alert('Email is required');
      return;
    }

    // Update user profile
    this.user = { ...this.user, ...this.editedUser };

    // If profile picture was changed
    if (this.previewUrl) {
      this.user.profilePicture = this.previewUrl;
    }

    // In production: send to backend
    console.log('Saving profile:', this.user);

    this.isEditing = false;
    this.selectedFile = null;
    this.previewUrl = null;

    alert('Profile updated successfully!');
  }

  togglePasswordChange(): void {
    this.showPasswordChange = !this.showPasswordChange;
    if (!this.showPasswordChange) {
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    }
  }

  changePassword(): void {
    // Validate
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      alert('All password fields are required');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (this.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    // In production: send to backend
    console.log('Changing password...');

    alert('Password changed successfully!');
    this.togglePasswordChange();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
