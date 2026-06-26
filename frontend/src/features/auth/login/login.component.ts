import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 bg-brand-bg min-h-screen text-brand-text font-sans selection:bg-brand-surface selection:text-brand-text">
      <!-- Glow background accents -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-brand-primary/5 blur-[120px]"></div>
        <div class="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-brand-surface/20 blur-[120px]"></div>
      </div>

      <div class="w-full max-w-md space-y-8 z-10">
        <!-- Logo Header -->
        <div class="flex flex-col items-center animate-fade-in">
          <div class="w-14 h-14 rounded-2xl bg-brand-primary flex items-center justify-center font-black text-white text-3xl shadow-medium mb-4 hover:scale-105 transition duration-300">
            D
          </div>
          <h2 class="text-3xl font-extrabold tracking-tight text-brand-text">
            @if (mode === 'login') {
              Sign in to DevMind AI
            } @else if (mode === 'request-reset') {
              Reset your password
            } @else {
              Confirm password reset
            }
          </h2>
          <p class="mt-2 text-sm text-brand-text/70">
            @if (mode === 'login') {
              Or
              <a routerLink="/register" class="font-semibold text-brand-primary hover:text-brand-primaryHover transition duration-150">
                create a new account
              </a>
            } @else {
              <button (click)="switchMode('login')" class="font-semibold text-brand-primary hover:text-brand-primaryHover transition duration-150 bg-transparent border-0 p-0 cursor-pointer">
                Return to sign in
              </button>
            }
          </p>
        </div>

        <!-- Form Card -->
        <div class="bg-brand-surface border border-brand-border rounded-[18px] p-8 shadow-medium transition duration-300 animate-slide-up">
          
          <!-- LOGIN MODE -->
          @if (mode === 'login') {
            <form [formGroup]="loginForm" (ngSubmit)="onLoginSubmit()" class="space-y-6">
              <div>
                <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-brand-text/80">Email Address</label>
                <div class="mt-1.5">
                  <input id="email" type="email" formControlName="email" required
                         class="w-full bg-brand-editorBg border border-brand-border rounded-xl px-4 py-3 text-brand-text placeholder-brand-text/40 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition duration-200"
                         placeholder="developer@devmind.ai">
                  @if (loginForm.get('email')?.touched && loginForm.get('email')?.invalid) {
                    <p class="mt-1.5 text-xs text-brand-danger font-medium">Please enter a valid email address.</p>
                  }
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between">
                  <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-brand-text/80">Password</label>
                  <button type="button" (click)="switchMode('request-reset')" class="text-xs font-semibold text-brand-primary hover:text-brand-primaryHover transition duration-150">
                    Forgot password?
                  </button>
                </div>
                <div class="mt-1.5">
                  <input id="password" type="password" formControlName="password" required
                         class="w-full bg-brand-editorBg border border-brand-border rounded-xl px-4 py-3 text-brand-text placeholder-brand-text/40 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition duration-200"
                         placeholder="••••••••">
                  @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
                    <p class="mt-1.5 text-xs text-brand-danger font-medium">Password is required.</p>
                  }
                </div>
              </div>

              <button type="submit" [disabled]="loginForm.invalid || isLoading()"
                      class="w-full py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary focus:ring-offset-brand-surface disabled:opacity-50 transition duration-200 shadow-low hover:shadow-medium hover-lift">
                {{ isLoading() ? 'Signing in...' : 'Sign In' }}
              </button>
            </form>

            <!-- Social Logins -->
            <div class="mt-8">
              <div class="relative">
                <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-brand-border"></div></div>
                <div class="relative flex justify-center text-xs uppercase"><span class="bg-brand-surface px-3 text-brand-text/60 font-semibold tracking-wider">Or continue with</span></div>
              </div>

              <div class="mt-6">
                <button (click)="onGoogleSignIn()"
                        class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-brand-border hover:border-brand-primary/30 bg-brand-bg/40 hover:bg-brand-bg/70 rounded-xl text-sm font-semibold text-brand-text transition duration-200 shadow-low hover:shadow-medium hover-lift">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </div>
          }

          <!-- REQUEST RESET MODE -->
          @if (mode === 'request-reset') {
            <form [formGroup]="requestResetForm" (ngSubmit)="onRequestResetSubmit()" class="space-y-6">
              <p class="text-sm text-brand-text/75 leading-relaxed">
                Enter your email address and we'll fetch a password reset code. In local development, the code will be returned instantly in the notification box!
              </p>
              <div>
                <label for="reset-email" class="block text-xs font-semibold uppercase tracking-wider text-brand-text/80">Email Address</label>
                <div class="mt-1.5">
                  <input id="reset-email" type="email" formControlName="email" required
                         class="w-full bg-brand-editorBg border border-brand-border rounded-xl px-4 py-3 text-brand-text placeholder-brand-text/40 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition duration-200"
                         placeholder="developer@devmind.ai">
                  @if (requestResetForm.get('email')?.touched && requestResetForm.get('email')?.invalid) {
                    <p class="mt-1.5 text-xs text-brand-danger font-medium">Please enter a valid email address.</p>
                  }
                </div>
              </div>

              <button type="submit" [disabled]="requestResetForm.invalid || isLoading()"
                      class="w-full py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary focus:ring-offset-brand-surface disabled:opacity-50 transition duration-200 shadow-low hover:shadow-medium hover-lift">
                {{ isLoading() ? 'Processing...' : 'Request Reset Token' }}
              </button>
            </form>
          }

          <!-- CONFIRM RESET MODE -->
          @if (mode === 'confirm-reset') {
            <form [formGroup]="confirmResetForm" (ngSubmit)="onConfirmResetSubmit()" class="space-y-6">
              <div>
                <label for="reset-token" class="block text-xs font-semibold uppercase tracking-wider text-brand-text/80">Reset Token</label>
                <div class="mt-1.5">
                  <input id="reset-token" type="text" formControlName="token" required
                         class="w-full bg-brand-editorBg border border-brand-border rounded-xl px-4 py-3 text-brand-text placeholder-brand-text/40 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition duration-200"
                         placeholder="Enter the UUID reset token">
                  @if (confirmResetForm.get('token')?.touched && confirmResetForm.get('token')?.invalid) {
                    <p class="mt-1.5 text-xs text-brand-danger font-medium">Reset token is required.</p>
                  }
                </div>
              </div>

              <div>
                <label for="new-password" class="block text-xs font-semibold uppercase tracking-wider text-brand-text/80">New Password</label>
                <div class="mt-1.5">
                  <input id="new-password" type="password" formControlName="newPassword" required
                         class="w-full bg-brand-editorBg border border-brand-border rounded-xl px-4 py-3 text-brand-text placeholder-brand-text/40 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition duration-200"
                         placeholder="Min 8 chars, 1 upper, 1 lower, 1 digit, 1 special">
                  @if (confirmResetForm.get('newPassword')?.touched && confirmResetForm.get('newPassword')?.invalid) {
                    <p class="mt-1.5 text-xs text-brand-danger font-medium">Password must meet all complexity requirements.</p>
                  }
                </div>
              </div>

              <button type="submit" [disabled]="confirmResetForm.invalid || isLoading()"
                      class="w-full py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary focus:ring-offset-brand-surface disabled:opacity-50 transition duration-200 shadow-low hover:shadow-medium hover-lift">
                {{ isLoading() ? 'Saving...' : 'Confirm Reset Password' }}
              </button>
            </form>
          }

        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  mode: 'login' | 'request-reset' | 'confirm-reset' = 'login';
  isLoading = this.authService.isLoadingSignal;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  requestResetForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  confirmResetForm: FormGroup = this.fb.group({
    token: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  switchMode(newMode: 'login' | 'request-reset' | 'confirm-reset') {
    this.mode = newMode;
  }

  onLoginSubmit() {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.toastr.success(res.message, 'Welcome Back!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Login failed. Please check your credentials.';
        this.toastr.error(errorMsg, 'Error');
      }
    });
  }

  onRequestResetSubmit() {
    if (this.requestResetForm.invalid) return;

    this.authService.requestPasswordReset(this.requestResetForm.value.email).subscribe({
      next: (res) => {
        if (res.data) {
          this.toastr.success('Token generated successfully!', 'Development Mode');
          this.confirmResetForm.patchValue({ token: res.data });
          this.switchMode('confirm-reset');
        } else {
          this.toastr.info(res.message, 'Password Reset Link');
          this.switchMode('confirm-reset');
        }
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Could not initiate reset flow.';
        this.toastr.error(errorMsg, 'Error');
      }
    });
  }

  onConfirmResetSubmit() {
    if (this.confirmResetForm.invalid) return;

    this.authService.confirmPasswordReset(this.confirmResetForm.value).subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'Password updated successfully.', 'Success');
        this.switchMode('login');
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Could not confirm password reset. Check token validity.';
        this.toastr.error(errorMsg, 'Error');
      }
    });
  }

  onGoogleSignIn() {
    const mockGoogleIdToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJlc3ViIjoiZ29vZ2xlLXVzZXJAZGV2bWluZC5haSIsImVtYWlsIjoiZ29vZ2xlLXVzZXJAZGV2bWluZC5haSIsImdpdmVuX25hbWUiOiJHb29nbGUiLCJmYW1pbHlfbmFtZSI6IkRldmVsb3BlciIsImV4cCI6OTk5OTk5OTk5OX0.mockSignature';
    this.authService.googleLogin(mockGoogleIdToken).subscribe({
      next: (res) => {
        this.toastr.success(res.message, 'Signed in with Google');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.toastr.error('Google Sign-In failed.', 'Error');
      }
    });
  }
}
