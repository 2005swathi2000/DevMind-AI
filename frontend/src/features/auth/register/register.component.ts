import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
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
          <h2 class="text-3xl font-extrabold tracking-tight text-brand-text">Create your account</h2>
          <p class="mt-2 text-sm text-brand-text/75">
            Already registered?
            <a routerLink="/login" class="font-semibold text-brand-primary hover:text-brand-primaryHover transition duration-150">
              sign in to your account
            </a>
          </p>
        </div>

        <!-- Form Card -->
        <div class="bg-brand-surface border border-brand-border rounded-[18px] p-8 shadow-medium transition duration-300 animate-slide-up">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="first-name" class="block text-xs font-semibold uppercase tracking-wider text-brand-text/80">First Name</label>
                <input id="first-name" type="text" formControlName="firstName" required
                       class="mt-1.5 w-full bg-brand-editorBg border border-brand-border rounded-xl px-4 py-2.5 text-brand-text placeholder-brand-text/40 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition duration-200"
                       placeholder="Ada">
                @if (registerForm.get('firstName')?.touched && registerForm.get('firstName')?.invalid) {
                  <p class="mt-1 text-[10px] text-brand-danger font-medium">First name is required.</p>
                }
              </div>
              <div>
                <label for="last-name" class="block text-xs font-semibold uppercase tracking-wider text-brand-text/80">Last Name</label>
                <input id="last-name" type="text" formControlName="lastName" required
                       class="mt-1.5 w-full bg-brand-editorBg border border-brand-border rounded-xl px-4 py-2.5 text-brand-text placeholder-brand-text/40 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition duration-200"
                       placeholder="Lovelace">
                @if (registerForm.get('lastName')?.touched && registerForm.get('lastName')?.invalid) {
                  <p class="mt-1 text-[10px] text-brand-danger font-medium">Last name is required.</p>
                }
              </div>
            </div>

            <div>
              <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-brand-text/80">Email Address</label>
              <input id="email" type="email" formControlName="email" required
                     class="mt-1.5 w-full bg-brand-editorBg border border-brand-border rounded-xl px-4 py-2.5 text-brand-text placeholder-brand-text/40 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition duration-200"
                     placeholder="developer@devmind.ai">
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.invalid) {
                <p class="mt-1 text-[10px] text-brand-danger font-medium">Please enter a valid email address.</p>
              }
            </div>

            <div>
              <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-brand-text/80">Password</label>
              <input id="password" type="password" formControlName="password" required
                     (input)="checkPasswordStrength()"
                     class="mt-1.5 w-full bg-brand-editorBg border border-brand-border rounded-xl px-4 py-2.5 text-brand-text placeholder-brand-text/40 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition duration-200"
                     placeholder="••••••••">
              
              <!-- Password requirements checklist -->
              <div class="mt-3 space-y-1.5 text-[11px] text-brand-text bg-brand-bg/40 border border-brand-border rounded-xl p-3">
                <p class="font-semibold text-brand-text">Password strength requirements:</p>
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="checks.length ? 'bg-emerald-600' : 'bg-slate-400'"></span>
                  <span [ngClass]="{'text-slate-500 line-through': checks.length, 'text-brand-text': !checks.length}">At least 8 characters</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="checks.upper ? 'bg-emerald-600' : 'bg-slate-400'"></span>
                  <span [ngClass]="{'text-slate-500 line-through': checks.upper, 'text-brand-text': !checks.upper}">At least one uppercase letter (A-Z)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="checks.lower ? 'bg-emerald-600' : 'bg-slate-400'"></span>
                  <span [ngClass]="{'text-slate-500 line-through': checks.lower, 'text-brand-text': !checks.lower}">At least one lowercase letter (a-z)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="checks.digit ? 'bg-emerald-600' : 'bg-slate-400'"></span>
                  <span [ngClass]="{'text-slate-500 line-through': checks.digit, 'text-brand-text': !checks.digit}">At least one number (0-9)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="checks.special ? 'bg-emerald-600' : 'bg-slate-400'"></span>
                  <span [ngClass]="{'text-slate-500 line-through': checks.special, 'text-brand-text': !checks.special}">At least one special character (!&#64;#$%^&*)</span>
                </div>
              </div>
            </div>

            <button type="submit" [disabled]="registerForm.invalid || !isPasswordStrong() || isLoading()"
                    class="w-full mt-4 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary focus:ring-offset-brand-surface disabled:opacity-50 transition duration-200 shadow-low hover:shadow-medium hover-lift">
              {{ isLoading() ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  isLoading = this.authService.isLoadingSignal;

  registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  checks = {
    length: false,
    upper: false,
    lower: false,
    digit: false,
    special: false
  };

  checkPasswordStrength() {
    const val = this.registerForm.value.password || '';
    this.checks.length = val.length >= 8;
    this.checks.upper = /[A-Z]/.test(val);
    this.checks.lower = /[a-z]/.test(val);
    this.checks.digit = /[0-9]/.test(val);
    this.checks.special = /[!@#$%^&*(),.?":{}|<>]/.test(val);
  }

  isPasswordStrong(): boolean {
    return this.checks.length && this.checks.upper && this.checks.lower && this.checks.digit && this.checks.special;
  }

  onSubmit() {
    if (this.registerForm.invalid || !this.isPasswordStrong()) return;

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.toastr.success(res.message, 'Account Created');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Registration failed. Try checking your parameters.';
        this.toastr.error(errorMsg, 'Error');
      }
    });
  }
}
