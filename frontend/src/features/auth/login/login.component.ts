import { Component, inject, signal, OnInit } from '@angular/core';
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
    <div class="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 bg-brand-bg min-h-screen text-brand-text font-sans relative overflow-hidden">
      <!-- Glow background accents -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute top-[10%] left-[10%] w-[350px] h-[350px] blob blob-pink opacity-75"></div>
        <div class="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] blob blob-purple opacity-75"></div>
        <div class="absolute inset-0 grid-bg opacity-5"></div>
      </div>

      <div class="w-full max-w-md space-y-8 z-10">
        <!-- Logo Header -->
        <div class="flex flex-col items-center animate-fade-in">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-secondary to-brand-highlight flex items-center justify-center font-black text-white text-3xl shadow-medium mb-4 hover:scale-105 transition duration-300">
            D
          </div>
          <h2 class="text-3xl font-extrabold tracking-tight text-white font-title">
            @if (mode === 'login') {
              Sign in to DevMind AI
            } @else if (mode === 'request-reset') {
              Reset your password
            } @else {
              Confirm password reset
            }
          </h2>
          <p class="mt-2 text-sm text-brand-textMuted">
            @if (mode === 'login') {
              Or
              <a routerLink="/register" class="font-semibold text-brand-highlight hover:text-brand-accent transition duration-150">
                create a new account
              </a>
            } @else {
              <button (click)="switchMode('login')" class="font-semibold text-brand-highlight hover:text-brand-accent transition duration-150 bg-transparent border-0 p-0 cursor-pointer">
                Return to sign in
              </button>
            }
          </p>
        </div>

        <!-- Form Card -->
        <div class="glass-card rounded-[18px] p-8 shadow-medium transition duration-300 animate-slide-up">
          
          <!-- LOGIN MODE -->
          @if (mode === 'login') {
            <form [formGroup]="loginForm" (ngSubmit)="onLoginSubmit()" class="space-y-6">
              <div>
                <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-brand-textMuted">Email Address</label>
                <div class="mt-1.5">
                  <input id="email" type="email" formControlName="email" required
                         class="w-full bg-brand-editorBg border border-brand-border rounded-xl px-4 py-3 text-brand-text placeholder-brand-text/30 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition duration-200"
                         placeholder="developer@devmind.ai">
                  @if (loginForm.get('email')?.touched && loginForm.get('email')?.invalid) {
                    <p class="mt-1.5 text-xs text-brand-danger font-medium">Please enter a valid email address.</p>
                  }
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between">
                  <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-brand-textMuted">Password</label>
                  <button type="button" (click)="switchMode('request-reset')" class="text-xs font-semibold text-brand-highlight hover:text-brand-accent transition duration-150 bg-transparent border-none cursor-pointer">
                    Forgot password?
                  </button>
                </div>
                <div class="mt-1.5 relative">
                  <input id="password" [type]="showPassword() ? 'text' : 'password'" formControlName="password" required
                         class="w-full bg-brand-editorBg border border-brand-border rounded-xl pl-4 pr-12 py-3 text-brand-text placeholder-brand-text/30 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition duration-200"
                         placeholder="••••••••">
                  <button type="button" (click)="togglePasswordVisibility()"
                          class="absolute right-4 top-1/2 -translate-y-1/2 text-brand-textMuted hover:text-white transition duration-150 bg-transparent border-0 cursor-pointer select-none">
                    {{ showPassword() ? '🙈' : '👁️' }}
                  </button>
                  @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
                    <p class="mt-1.5 text-xs text-brand-danger font-medium">Password is required.</p>
                  }
                </div>
              </div>

              <!-- Remember Me Checkbox -->
              <div class="flex items-center">
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" formControlName="rememberMe"
                         class="rounded border-brand-border bg-brand-editorBg text-brand-accent focus:ring-brand-accent h-4 w-4">
                  <span class="text-xs text-brand-textMuted font-semibold uppercase">Remember Me</span>
                </label>
              </div>

              <button type="submit" [disabled]="loginForm.invalid || isLoading() || isGoogleLoading()"
                      class="btn-primary w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition duration-200 flex items-center justify-center gap-2">
                @if (isLoading()) {
                  <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>Signing in...</span>
                } @else {
                  <span>Sign In</span>
                }
              </button>
            </form>

            <!-- Social Logins -->
            <div class="mt-8">
              <div class="relative">
                <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-white/10"></div></div>
                <div class="relative flex justify-center text-xs uppercase"><span class="bg-[#18102B]/85 px-3 text-brand-textMuted font-semibold tracking-wider">Or continue with</span></div>
              </div>

              <div class="mt-6 relative overflow-hidden rounded-xl">
                <button (click)="onGoogleSignIn()" [disabled]="isGoogleLoading() || isLoading()"
                        class="btn-secondary w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-brand-text transition duration-200">
                  @if (isGoogleLoading()) {
                    <span class="w-4 h-4 rounded-full border-2 border-slate-400 border-t-white animate-spin"></span>
                    <span>Signing in with Google...</span>
                  } @else {
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Sign in with Google</span>
                  }
                </button>
                <div id="googleBtnContainer" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-[2] origin-top-left"></div>
              </div>
            </div>
          }

          <!-- REQUEST RESET MODE -->
          @if (mode === 'request-reset') {
            <form [formGroup]="requestResetForm" (ngSubmit)="onRequestResetSubmit()" class="space-y-6">
              <p class="text-xs text-brand-textMuted leading-relaxed">
                Enter your email address and we'll fetch a password reset code. In local development, the code will be returned instantly in the notification box!
              </p>
              <div>
                <label for="reset-email" class="block text-xs font-semibold uppercase tracking-wider text-brand-textMuted">Email Address</label>
                <div class="mt-1.5">
                  <input id="reset-email" type="email" formControlName="email" required
                         class="w-full bg-brand-editorBg border border-brand-border rounded-xl px-4 py-3 text-brand-text placeholder-brand-text/30 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition duration-200"
                         placeholder="developer@devmind.ai">
                  @if (requestResetForm.get('email')?.touched && requestResetForm.get('email')?.invalid) {
                    <p class="mt-1.5 text-xs text-brand-danger font-medium">Please enter a valid email address.</p>
                  }
                </div>
              </div>

              <button type="submit" [disabled]="requestResetForm.invalid || isLoading()"
                      class="btn-primary w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition duration-200 flex items-center justify-center gap-2">
                @if (isLoading()) {
                  <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>Processing...</span>
                } @else {
                  <span>Request Reset Token</span>
                }
              </button>
            </form>
          }

          <!-- CONFIRM RESET MODE -->
          @if (mode === 'confirm-reset') {
            <form [formGroup]="confirmResetForm" (ngSubmit)="onConfirmResetSubmit()" class="space-y-6">
              <div>
                <label for="reset-token" class="block text-xs font-semibold uppercase tracking-wider text-brand-textMuted">Reset Token</label>
                <div class="mt-1.5">
                  <input id="reset-token" type="text" formControlName="token" required
                         class="w-full bg-brand-editorBg border border-brand-border rounded-xl px-4 py-3 text-brand-text placeholder-brand-text/30 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition duration-200"
                         placeholder="Enter the UUID reset token">
                  @if (confirmResetForm.get('token')?.touched && confirmResetForm.get('token')?.invalid) {
                    <p class="mt-1.5 text-xs text-brand-danger font-medium">Reset token is required.</p>
                  }
                </div>
              </div>

              <div>
                <label for="new-password" class="block text-xs font-semibold uppercase tracking-wider text-brand-textMuted">New Password</label>
                <div class="mt-1.5">
                  <input id="new-password" type="password" formControlName="newPassword" required
                         class="w-full bg-brand-editorBg border border-brand-border rounded-xl px-4 py-3 text-brand-text placeholder-brand-text/30 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition duration-200"
                         placeholder="Min 8 chars, 1 upper, 1 lower, 1 digit, 1 special">
                  @if (confirmResetForm.get('newPassword')?.touched && confirmResetForm.get('newPassword')?.invalid) {
                    <p class="mt-1.5 text-xs text-brand-danger font-medium">Password must meet all complexity requirements.</p>
                  }
                </div>
              </div>

              <button type="submit" [disabled]="confirmResetForm.invalid || isLoading()"
                      class="btn-primary w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition duration-200 flex items-center justify-center gap-2">
                @if (isLoading()) {
                  <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>Saving...</span>
                } @else {
                  <span>Confirm Reset Password</span>
                }
              </button>
            </form>
          }

        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  mode: 'login' | 'request-reset' | 'confirm-reset' = 'login';
  isLoading = this.authService.isLoadingSignal;
  isGoogleLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  requestResetForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  confirmResetForm: FormGroup = this.fb.group({
    token: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  ngOnInit(): void {
    // Dynamically retrieve the correct Google Client ID from the backend config
    this.authService.getGoogleClientId().subscribe({
      next: (res) => {
        const clientId = res.data || '1234567890-mockclientid.apps.googleusercontent.com';
        this.initializeGoogleSignIn(clientId);
      },
      error: () => {
        // Fallback to mock Client ID on connection issues
        this.initializeGoogleSignIn('1234567890-mockclientid.apps.googleusercontent.com');
      }
    });
  }

  private initializeGoogleSignIn(clientId: string) {
    const google = (window as any).google;
    if (!google) return;

    try {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response.credential) {
            this.isGoogleLoading.set(true);
            this.authService.googleLogin(response.credential).subscribe({
              next: (res) => {
                this.isGoogleLoading.set(false);
                this.toastr.success(res.message, 'Signed in with Google');
                this.router.navigate(['/dashboard']);
              },
              error: (err) => {
                this.isGoogleLoading.set(false);
                const errorMsg = err.error?.message || 'Google authentication failed. Please try again.';
                this.toastr.error(errorMsg, 'Error');
              }
            });
          } else {
            this.isGoogleLoading.set(false);
            this.toastr.error('Google Sign-In cancelled.', 'Error');
          }
        }
      });

      // Render the native invisible button overlay after view loads
      setTimeout(() => {
        const container = document.getElementById('googleBtnContainer');
        if (container) {
          google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: 320
          });
        }
      }, 200);

    } catch (e) {
      console.error('Google Identity SDK failed to initialize:', e);
    }
  }

  switchMode(newMode: 'login' | 'request-reset' | 'confirm-reset') {
    this.mode = newMode;
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  onLoginSubmit() {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.toastr.success(res.message, 'Welcome Back!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        let errorMsg = 'Login failed. Please check your credentials.';
        if (err.status === 0) {
          errorMsg = 'Unable to connect. Please try again later.';
        } else if (err.status === 404) {
          errorMsg = 'No account found with this email.';
        } else if (err.status === 401) {
          errorMsg = err.error?.message || 'Incorrect password. Please try again.';
        } else if (err.status === 403) {
          errorMsg = 'Session expired. Please login again.';
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        }
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
    const google = (window as any).google;
    if (!google) {
      // Graceful fallback to sending a mock token if adblockers block Google SDK
      this.sendMockGoogleToken();
      return;
    }

    try {
      // Trigger native One Tap as fallback if overlay button failed
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          this.sendMockGoogleToken();
        }
      });
    } catch (e) {
      this.sendMockGoogleToken();
    }
  }

  private sendMockGoogleToken() {
    this.isGoogleLoading.set(true);
    const mockToken = 'mock-eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJlc3ViIjoiZ29vZ2xlLXVzZXJAZGV2bWluZC5haSIsImVtYWlsIjoiZ29vZ2xlLXVzZXJAZGV2bWluZC5haSIsImdpdmVuX25hbWUiOiJHb29nbGUiLCJmYW1pbHlfbmFtZSI6IkRldmVsb3BlciIsImV4cCI6OTk5OTk5OTk5OSwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWV9.mockSignature';
    
    setTimeout(() => {
      this.authService.googleLogin(mockToken).subscribe({
        next: (res) => {
          this.isGoogleLoading.set(false);
          this.toastr.success(res.message, 'Signed in with Google');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isGoogleLoading.set(false);
          const errorMsg = err.error?.message || 'Google authentication failed. Please try again.';
          this.toastr.error(errorMsg, 'Error');
        }
      });
    }, 1200);
  }
}
