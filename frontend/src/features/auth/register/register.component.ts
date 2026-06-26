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
    <div class="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-950 min-h-screen text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <!-- Glow background accents -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
        <div class="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-purple-500/5 blur-[120px]"></div>
      </div>

      <div class="w-full max-w-md space-y-8 z-10">
        <!-- Logo Header -->
        <div class="flex flex-col items-center">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-black text-white text-3xl shadow-xl shadow-indigo-500/20 mb-4 animate-pulse">
            D
          </div>
          <h2 class="text-3xl font-extrabold tracking-tight text-white">Create your account</h2>
          <p class="mt-2 text-sm text-slate-400">
            Already registered?
            <a routerLink="/login" class="font-semibold text-indigo-400 hover:text-indigo-300 transition duration-150">
              sign in to your account
            </a>
          </p>
        </div>

        <!-- Form Card -->
        <div class="bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/40 hover:border-slate-800 transition duration-300">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="first-name" class="block text-xs font-semibold uppercase tracking-wider text-slate-400">First Name</label>
                <input id="first-name" type="text" formControlName="firstName" required
                       class="mt-1.5 w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
                       placeholder="Ada">
                @if (registerForm.get('firstName')?.touched && registerForm.get('firstName')?.invalid) {
                  <p class="mt-1 text-[10px] text-rose-500 font-medium">First name is required.</p>
                }
              </div>
              <div>
                <label for="last-name" class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Last Name</label>
                <input id="last-name" type="text" formControlName="lastName" required
                       class="mt-1.5 w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
                       placeholder="Lovelace">
                @if (registerForm.get('lastName')?.touched && registerForm.get('lastName')?.invalid) {
                  <p class="mt-1 text-[10px] text-rose-500 font-medium">Last name is required.</p>
                }
              </div>
            </div>

            <div>
              <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
              <input id="email" type="email" formControlName="email" required
                     class="mt-1.5 w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
                     placeholder="developer@devmind.ai">
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.invalid) {
                <p class="mt-1 text-[10px] text-rose-500 font-medium">Please enter a valid email address.</p>
              }
            </div>

            <div>
              <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
              <input id="password" type="password" formControlName="password" required
                     (input)="checkPasswordStrength()"
                     class="mt-1.5 w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
                     placeholder="••••••••">
              
              <!-- Password requirements checklist -->
              <div class="mt-3 space-y-1.5 text-[11px] text-slate-400 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
                <p class="font-semibold text-slate-300">Password strength requirements:</p>
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="checks.length ? 'bg-emerald-500' : 'bg-slate-700'"></span>
                  <span [ngClass]="{'text-slate-300': checks.length, 'line-through text-slate-500': checks.length}">At least 8 characters</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="checks.upper ? 'bg-emerald-500' : 'bg-slate-700'"></span>
                  <span [ngClass]="{'text-slate-300': checks.upper, 'line-through text-slate-500': checks.upper}">At least one uppercase letter (A-Z)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="checks.lower ? 'bg-emerald-500' : 'bg-slate-700'"></span>
                  <span [ngClass]="{'text-slate-300': checks.lower, 'line-through text-slate-500': checks.lower}">At least one lowercase letter (a-z)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="checks.digit ? 'bg-emerald-500' : 'bg-slate-700'"></span>
                  <span [ngClass]="{'text-slate-300': checks.digit, 'line-through text-slate-500': checks.digit}">At least one number (0-9)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="checks.special ? 'bg-emerald-500' : 'bg-slate-700'"></span>
                  <span [ngClass]="{'text-slate-300': checks.special, 'line-through text-slate-500': checks.special}">At least one special character (!&#64;#$%^&*)</span>
                </div>
              </div>
            </div>

            <button type="submit" [disabled]="registerForm.invalid || !isPasswordStrong() || isLoading()"
                    class="w-full mt-4 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 disabled:opacity-50 transition duration-200 shadow-lg shadow-indigo-500/20">
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
