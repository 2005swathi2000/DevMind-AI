import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private getStorage(): Storage {
    if (this.isBrowser()) {
      const rememberMe = localStorage.getItem('devmind_remember_me') === 'true';
      return rememberMe ? localStorage : sessionStorage;
    }
    // Fallback for SSR
    return {
      clear: () => {},
      getItem: () => null,
      key: () => null,
      length: 0,
      removeItem: () => {},
      setItem: () => {}
    };
  }

  getItem(key: string): string | null {
    if (this.isBrowser()) {
      // Check both local and session to find existing sessions
      const localVal = localStorage.getItem(key);
      if (localVal) return localVal;
      return sessionStorage.getItem(key);
    }
    return null;
  }

  setItem(key: string, value: string): void {
    if (this.isBrowser()) {
      this.getStorage().setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (this.isBrowser()) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  }

  clear(): void {
    if (this.isBrowser()) {
      localStorage.clear();
      sessionStorage.clear();
    }
  }
}
