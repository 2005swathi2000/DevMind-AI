import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'devmind_access_token';
  private readonly REFRESH_TOKEN_KEY = 'devmind_refresh_token';

  constructor(private storageService: StorageService) {}

  getAccessToken(): string | null {
    return this.storageService.getItem(this.ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    this.storageService.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  removeAccessToken(): void {
    this.storageService.removeItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.storageService.getItem(this.REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    this.storageService.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  removeRefreshToken(): void {
    this.storageService.removeItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
  }

  decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    const expiry = decoded.exp * 1000;
    return Date.now() >= expiry;
  }
}
