import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePicture?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePicture?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  private readonly API_URL = 'http://localhost:8080/api/auth';

  // Signals for application state
  currentUserSignal = signal<User | null>(null);
  isLoadingSignal = signal<boolean>(false);

  // Computed signals
  isAuthenticated = computed(() => !!this.currentUserSignal());

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.tokenService.getAccessToken();
    if (token) {
      if (!this.tokenService.isTokenExpired(token)) {
        const decoded = this.tokenService.decodeToken(token);
        this.currentUserSignal.set({
          email: decoded.sub,
          firstName: decoded.firstName || '',
          lastName: decoded.lastName || '',
          role: decoded.role || 'USER'
        });
        this.setupSilentRefresh();
      } else {
        this.refreshAccessToken().subscribe({
          error: () => this.logout()
        });
      }
    }
  }

  register(payload: any): Observable<ApiResponse<AuthResponse>> {
    this.isLoadingSignal.set(true);
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/register`, payload).pipe(
      tap(res => this.handleAuthSuccess(res.data)),
      catchError(err => {
        this.isLoadingSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  login(payload: any): Observable<ApiResponse<AuthResponse>> {
    this.isLoadingSignal.set(true);
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/login`, payload).pipe(
      tap(res => this.handleAuthSuccess(res.data)),
      catchError(err => {
        this.isLoadingSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  googleLogin(idToken: string): Observable<ApiResponse<AuthResponse>> {
    this.isLoadingSignal.set(true);
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/google`, { idToken }).pipe(
      tap(res => this.handleAuthSuccess(res.data)),
      catchError(err => {
        this.isLoadingSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${this.API_URL}/logout`, { refreshToken }).subscribe({
        next: () => this.clearSession(),
        error: () => this.clearSession()
      });
    } else {
      this.clearSession();
    }
  }

  private clearSession(): void {
    this.tokenService.clearTokens();
    this.currentUserSignal.set(null);
    this.isLoadingSignal.set(false);
    this.router.navigate(['/login']);
  }

  refreshAccessToken(): Observable<ApiResponse<AuthResponse>> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/refresh`, { refreshToken }).pipe(
      tap(res => this.handleAuthSuccess(res.data)),
      catchError(err => {
        this.clearSession();
        return throwError(() => err);
      })
    );
  }

  requestPasswordReset(email: string): Observable<ApiResponse<String>> {
    return this.http.post<ApiResponse<String>>(`${this.API_URL}/password-reset/request`, { email });
  }

  confirmPasswordReset(payload: any): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/password-reset/confirm`, payload);
  }

  private handleAuthSuccess(data: AuthResponse): void {
    this.tokenService.setAccessToken(data.accessToken);
    this.tokenService.setRefreshToken(data.refreshToken);

    this.currentUserSignal.set({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      profilePicture: data.profilePicture
    });

    this.isLoadingSignal.set(false);
    this.setupSilentRefresh();
  }

  private refreshTimeout: any;

  private setupSilentRefresh(): void {
    const token = this.tokenService.getAccessToken();
    if (!token) return;

    const decoded = this.tokenService.decodeToken(token);
    if (!decoded || !decoded.exp) return;

    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    const expiryTime = decoded.exp * 1000;
    const delay = expiryTime - Date.now() - 60000; // 1 minute before expiry

    if (delay > 0) {
      this.refreshTimeout = setTimeout(() => {
        this.refreshAccessToken().subscribe();
      }, delay);
    } else {
      this.refreshAccessToken().subscribe();
    }
  }
}
