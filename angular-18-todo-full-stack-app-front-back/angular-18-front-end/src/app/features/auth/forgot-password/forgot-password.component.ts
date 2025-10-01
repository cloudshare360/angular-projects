import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  isSubmitted = false;
  isLoading = false;
  errorMessage = '';

  constructor(private router: Router) {}

  onSubmit(): void {
    // Validate email
    if (!this.email || !this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simulate API call to send reset email
    setTimeout(() => {
      this.isLoading = false;
      this.isSubmitted = true;

      // In production: Send reset email via backend
      console.log('Password reset email sent to:', this.email);
    }, 1500);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  resendEmail(): void {
    this.isSubmitted = false;
    this.email = '';
  }
}
