import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  newPassword = '';
  confirmPassword = '';
  token = '';
  isValidToken = true;
  isSubmitted = false;
  isLoading = false;
  errorMessage = '';
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get token from URL query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';

      if (!this.token) {
        this.isValidToken = false;
      } else {
        // In production: Validate token with backend
        this.validateToken();
      }
    });
  }

  validateToken(): void {
    // Simulate token validation
    // In production: Call backend API to validate token
    setTimeout(() => {
      // For demo, accept any token
      this.isValidToken = true;
    }, 500);
  }

  onSubmit(): void {
    this.errorMessage = '';

    // Validate passwords
    if (!this.newPassword || this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;

    // Simulate API call to reset password
    setTimeout(() => {
      this.isLoading = false;
      this.isSubmitted = true;

      // In production: Send new password to backend with token
      console.log('Password reset successful for token:', this.token);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 3000);
    }, 1500);
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
