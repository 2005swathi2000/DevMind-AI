import { Component, inject, OnInit, signal, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommandPaletteService } from '../../../core/services/command-palette.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ToastrService } from 'ngx-toastr';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ProfileModalComponent],
  template: `
    <nav class="border-b border-brand-border bg-brand-bg/85 backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center justify-between top-0 z-50 shrink-0 select-none">
      <!-- Left: Logo & Mobile Hamburger Menu -->
      <div class="flex items-center gap-3">
        <button (click)="toggleMobileSidebar($event)" class="md:hidden text-brand-textMuted hover:text-white p-1 bg-white/5 rounded-lg border border-white/5 transition">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div (click)="onLogoClick($event)" class="flex items-center gap-3 cursor-pointer group">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-secondary to-brand-highlight flex items-center justify-center font-black text-white text-base shadow-low group-hover:scale-105 transition duration-300">
            D
          </div>
          <div class="hidden sm:block">
            <span class="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-highlight tracking-wide text-sm block font-title">
              DEVMIND AI
            </span>
            <span class="text-[9px] block text-brand-textMuted/60 font-semibold uppercase tracking-wider">AI Developer Platform</span>
          </div>
        </div>
      </div>

      <!-- Center: Universal Search (Command Palette entry point) -->
      <div class="flex-1 max-w-sm sm:max-w-md md:max-w-lg mx-3 sm:mx-8">
        <div (click)="openCommandPalette()"
             class="w-full bg-white/5 hover:bg-white/10 border border-white/8 hover:border-brand-highlight/40 rounded-xl px-3 sm:px-4 py-2 flex items-center justify-between gap-3 text-[11px] sm:text-xs text-brand-textMuted/50 cursor-pointer transition duration-250 shadow-inner group">
          <div class="flex items-center gap-2.5 min-w-0">
            <svg class="w-4 h-4 text-brand-textMuted/60 group-hover:text-brand-highlight transition duration-150 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="font-medium text-brand-textMuted/70 group-hover:text-white transition duration-150 truncate">Search commands, code, jobs...</span>
          </div>
          <div class="hidden sm:flex items-center gap-1 shrink-0">
            <span class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-white/40 group-hover:text-brand-highlight transition duration-150">Ctrl</span>
            <span class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-white/40 group-hover:text-brand-highlight transition duration-150">K</span>
          </div>
        </div>
      </div>

      <!-- Right: Actions & Redesigned Profile (Notification Bell removed as requested) -->
      <div class="flex items-center gap-2 sm:gap-3 relative shrink-0">
        
        <!-- Keybind Help Icon -->
        <button (click)="toggleShortcutHelp($event)" title="Keyboard Shortcuts"
                class="hidden sm:flex w-8.5 h-8.5 rounded-lg bg-white/5 border border-white/8 items-center justify-center text-brand-textMuted hover:text-white hover:bg-white/10 transition duration-150 relative">
          <span class="text-xs font-extrabold font-mono">?</span>
        </button>

        <!-- Redesigned Profile Trigger -->
        @if (user(); as u) {
          <div class="relative">
            <button (click)="toggleProfileMenu($event)"
                    class="w-9 h-9 rounded-xl overflow-hidden bg-brand-surface border border-white/10 flex items-center justify-center hover:border-brand-highlight transition duration-150 scale-100 active:scale-95 duration-100">
              @if (!avatarError()) {
                <img [src]="getDefaultAvatar()" (error)="avatarError.set(true)" alt="Profile" class="w-full h-full object-cover">
              } @else {
                <span class="text-xs font-black text-brand-highlight uppercase">{{ u.firstName.charAt(0) }}{{ u.lastName ? u.lastName.charAt(0) : '' }}</span>
              }
            </button>

            <!-- Centered Profile Modal -->
            <app-profile-modal [isOpen]="showProfileMenu()" (close)="showProfileMenu.set(false)"></app-profile-modal>
          </div>
        }

      </div>
    </nav>

    <!-- Global Key Shortcut Helper Modal -->
    @if (showShortcutModal()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/75 backdrop-blur-md animate-fade-in" (click)="toggleShortcutHelp($event)"></div>
        <div class="relative w-full max-w-sm bg-brand-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 animate-slide-up">
          <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-4 font-title flex items-center gap-2">
            <span>⌨️</span> Keyboard Shortcuts
          </h3>
          <div class="space-y-3.5 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-brand-textMuted">Universal Search</span>
              <div class="flex gap-1">
                <span class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-bold">Ctrl</span>
                <span class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-bold">K</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-brand-textMuted">Focus Search Palette</span>
              <span class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-bold">/</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-brand-textMuted">Close Overlays</span>
              <span class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-bold">ESC</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-brand-textMuted">Show Keyboard Legend</span>
              <span class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-bold">?</span>
            </div>
          </div>

          <button (click)="closeShortcutHelp()"
                  class="btn-primary w-full mt-6 py-2 px-4 rounded-xl text-xs font-bold shadow-low hover:shadow-medium">
            Dismiss Help Dialog
          </button>
        </div>
      </div>
    }
  `
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private commandService = inject(CommandPaletteService);
  private analyticsService = inject(AnalyticsService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      if (typeof document !== 'undefined') {
        if (this.showProfileMenu() || this.showShortcutModal()) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    });
  }

  user = this.authService.currentUserSignal;
  avatarError = signal<boolean>(false);

  showProfileMenu = signal<boolean>(false);
  showShortcutModal = signal<boolean>(false);
  showQuickActions = signal<boolean>(false);

  appTheme = signal<string>('theme-purple');
  totalRequestsCount = signal<number>(0);

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showProfileMenu.set(false);
    this.showQuickActions.set(false);
  }

  @HostListener('window:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.showProfileMenu.set(false);
      this.showShortcutModal.set(false);
      return;
    }

    const active = document.activeElement;
    const isTyping = active && (
      active.tagName === 'INPUT' || 
      active.tagName === 'TEXTAREA' || 
      active.className.includes('inputarea') || 
      active.getAttribute('contenteditable') === 'true'
    );

    if (isTyping) return;

    if (event.key === '?') {
      event.preventDefault();
      this.showShortcutModal.set(!this.showShortcutModal());
    } else if (event.key === '/') {
      event.preventDefault();
      this.commandService.open();
    }
  }

  onLogoClick(event: MouseEvent): void {
    event.preventDefault();
    if (this.router.url === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.fetchAnalyticsData();
    if (typeof window !== 'undefined') {
      this.appTheme.set(localStorage.getItem('devmind_current_theme') || 'theme-purple');
    }
  }

  private fetchAnalyticsData(): void {
    if (!this.authService.isAuthenticated()) return;
    this.analyticsService.getSummary().subscribe({
      next: (res) => {
        if (res.data) {
          this.totalRequestsCount.set(res.data.totalRequests);
        }
      },
      error: () => {}
    });
  }

  getLevelTitle(): string {
    const total = this.totalRequestsCount();
    if (total >= 50) return 'AI Master';
    if (total >= 25) return 'Power User';
    if (total >= 10) return 'AI Practitioner';
    if (total >= 1) return 'First Steps';
    return 'Novice Developer';
  }

  openCommandPalette(): void {
    this.commandService.open();
  }

  toggleShortcutHelp(event: MouseEvent): void {
    event.stopPropagation();
    this.showShortcutModal.set(!this.showShortcutModal());
    this.showProfileMenu.set(false);
    this.showQuickActions.set(false);
  }

  closeShortcutHelp(): void {
    this.showShortcutModal.set(false);
  }

  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.fetchAnalyticsData(); // Refresh achievements count
    this.showProfileMenu.set(!this.showProfileMenu());
    this.showQuickActions.set(false);
  }

  getDefaultAvatar(): string {
    const u = this.user();
    if (!u) return '';

    if (u.profilePicture) {
      return u.profilePicture;
    }

    const gender = u.gender ? u.gender.toLowerCase() : this.guessGenderByName(u.firstName);
    if (gender === 'female') {
      // Swathi's premium anime female avatar wearing a hoodie with ears
      return 'https://api.dicebear.com/7.x/lorelei/svg?seed=Swathi&hair=long&hairColor=brown&mouth=smile';
    } else {
      // Premium male anime character
      return 'https://api.dicebear.com/7.x/lorelei/svg?seed=Felix&hair=short&hairColor=black&mouth=smile';
    }
  }

  private guessGenderByName(name: string): string {
    if (!name) return 'male';
    const femalePatterns = ['swathi', 'swetha', 'mary', 'jenny', 'jennifer', 'sara', 'sarah', 'emily', 'elizabeth', 'linda', 'anna', 'devi', 'priya', 'harini', 'divya', 'anitha'];
    const lowerName = name.toLowerCase();
    return femalePatterns.some(p => lowerName.includes(p)) ? 'female' : 'male';
  }

  setAppTheme(theme: string): void {
    this.appTheme.set(theme);
    if (typeof window === 'undefined') return;
    localStorage.setItem('devmind_current_theme', theme);
    
    const root = document.documentElement;
    if (theme === 'theme-blue') {
      root.style.setProperty('--primary', '#0284C7');
      root.style.setProperty('--primary-hover', '#0369A1');
      root.style.setProperty('--secondary', '#0369A1');
      root.style.setProperty('--accent', '#38BDF8');
      root.style.setProperty('--highlight', '#38BDF8');
      root.style.setProperty('--background', '#0B132B');
      root.style.setProperty('--surface', '#1C2541');
      root.style.setProperty('--editor-bg', '#1C2541');
      root.style.setProperty('--text', '#F8FAFC');
      root.style.setProperty('--text-muted', '#94A3B8');
      root.style.setProperty('--border', 'rgba(255, 255, 255, 0.08)');
    } else if (theme === 'theme-orange') {
      root.style.setProperty('--primary', '#EA580C');
      root.style.setProperty('--primary-hover', '#D97706');
      root.style.setProperty('--secondary', '#C2410C');
      root.style.setProperty('--accent', '#FDBA74');
      root.style.setProperty('--highlight', '#FDBA74');
      root.style.setProperty('--background', '#180F0A');
      root.style.setProperty('--surface', '#26160F');
      root.style.setProperty('--editor-bg', '#26160F');
      root.style.setProperty('--text', '#F8FAFC');
      root.style.setProperty('--text-muted', '#94A3B8');
      root.style.setProperty('--border', 'rgba(255, 255, 255, 0.08)');
    } else if (theme === 'theme-green') {
      root.style.setProperty('--primary', '#059669');
      root.style.setProperty('--primary-hover', '#047857');
      root.style.setProperty('--secondary', '#047857');
      root.style.setProperty('--accent', '#34D399');
      root.style.setProperty('--highlight', '#34D399');
      root.style.setProperty('--background', '#061A14');
      root.style.setProperty('--surface', '#0E2C22');
      root.style.setProperty('--editor-bg', '#0E2C22');
      root.style.setProperty('--text', '#F8FAFC');
      root.style.setProperty('--text-muted', '#94A3B8');
      root.style.setProperty('--border', 'rgba(255, 255, 255, 0.08)');
    } else if (theme === 'theme-midnight') {
      root.style.setProperty('--primary', '#312E81');
      root.style.setProperty('--primary-hover', '#1E1B4B');
      root.style.setProperty('--secondary', '#1E1B4B');
      root.style.setProperty('--accent', '#818CF8');
      root.style.setProperty('--highlight', '#818CF8');
      root.style.setProperty('--background', '#03001C');
      root.style.setProperty('--surface', '#0B0033');
      root.style.setProperty('--editor-bg', '#0B0033');
      root.style.setProperty('--text', '#F8FAFC');
      root.style.setProperty('--text-muted', '#94A3B8');
      root.style.setProperty('--border', 'rgba(255, 255, 255, 0.08)');
    } else if (theme === 'theme-light') {
      root.style.setProperty('--primary', '#4F46E5');
      root.style.setProperty('--primary-hover', '#4338CA');
      root.style.setProperty('--secondary', '#7C3AED');
      root.style.setProperty('--accent', '#0284C7');
      root.style.setProperty('--highlight', '#0284C7');
      root.style.setProperty('--background', '#F8FAFC');
      root.style.setProperty('--surface', '#FFFFFF');
      root.style.setProperty('--editor-bg', '#FFFFFF');
      root.style.setProperty('--text', '#0F172A');
      root.style.setProperty('--text-muted', '#64748B');
      root.style.setProperty('--border', 'rgba(0, 0, 0, 0.08)');
    } else {
      root.style.setProperty('--primary', '#4F46E5');
      root.style.setProperty('--primary-hover', '#4338CA');
      root.style.setProperty('--secondary', '#7C3AED');
      root.style.setProperty('--accent', '#06B6D4');
      root.style.setProperty('--highlight', '#22D3EE');
      root.style.setProperty('--background', '#09090B');
      root.style.setProperty('--surface', '#111827');
      root.style.setProperty('--editor-bg', '#111827');
      root.style.setProperty('--text', '#F8FAFC');
      root.style.setProperty('--text-muted', '#94A3B8');
      root.style.setProperty('--border', 'rgba(255, 255, 255, 0.08)');
    }

    this.toastr.success(`Application theme set to ${theme.replace('theme-', '').toUpperCase()}`, 'Theme Changed');
  }

  toggleMobileSidebar(event: MouseEvent): void {
    event.stopPropagation();
    const sidebar = document.querySelector('.workspace-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('mobile-open');
    }
  }

  navTo(route: string): void {
    this.showProfileMenu.set(false);
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
  }
}
