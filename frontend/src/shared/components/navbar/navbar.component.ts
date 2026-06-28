import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommandPaletteService } from '../../../core/services/command-palette.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="border-b border-brand-border bg-brand-bg/85 backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center justify-between top-0 z-50 shrink-0 select-none">
      <!-- Left: Logo & Mobile Hamburger Menu -->
      <div class="flex items-center gap-3">
        <button (click)="toggleMobileSidebar($event)" class="md:hidden text-brand-textMuted hover:text-white p-1 bg-white/5 rounded-lg border border-white/5 transition">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <a routerLink="/dashboard" class="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-secondary to-brand-highlight flex items-center justify-center font-black text-white text-base shadow-low hover:scale-105 transition duration-300">
          D
        </a>
        <div class="hidden sm:block">
          <span class="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-highlight tracking-wide text-sm block font-title">
            DEVMIND AI
          </span>
          <span class="text-[9px] block text-brand-textMuted/60 font-semibold uppercase tracking-wider">AI Developer Platform</span>
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
              <img [src]="getDefaultAvatar()" alt="Profile" class="w-full h-full object-cover">
            </button>

            <!-- Premium Notion/GitHub inspired Profile Menu -->
            @if (showProfileMenu()) {
              <div (click)="$event.stopPropagation()"
                   class="absolute right-0 mt-2.5 w-76 bg-brand-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-3.5 backdrop-blur-md origin-top-right transform transition scale-100 ease-out animate-fade-in text-brand-text font-sans">
                
                <!-- Profile Header (Clickable link to profile page) -->
                <div (click)="navTo('/profile')" class="flex items-center gap-3.5 pb-3.5 border-b border-white/5 cursor-pointer hover:opacity-90">
                  <!-- Avatar Circle with Glowing Online status -->
                  <div class="relative w-14 h-14 rounded-full overflow-hidden bg-brand-bg/50 border border-brand-highlight flex items-center justify-center shrink-0">
                    <img [src]="getDefaultAvatar()" class="w-full h-full object-cover">
                    <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-brand-surface"></span>
                  </div>
                  
                  <div class="min-w-0 flex-1">
                    <h3 class="text-sm font-extrabold text-white flex items-center gap-1 truncate">
                      {{ u.firstName }}
                      <span class="text-brand-accent text-xs">✦</span>
                    </h3>
                    <p class="text-[10px] font-semibold text-brand-textMuted/65 truncate uppercase mt-0.5">{{ u.email }}</p>
                    
                    <div class="flex items-center gap-2 mt-2">
                      <span class="text-[8px] font-bold text-brand-highlight bg-brand-highlight/10 px-1.5 py-0.5 rounded border border-brand-highlight/20 uppercase tracking-wide">
                        🚀 {{ getLevelTitle() }}
                      </span>
                      <span class="text-[8px] font-bold text-brand-accent bg-brand-accent/10 px-1.5 py-0.5 rounded border border-brand-accent/20 uppercase tracking-wide">
                        PRO PLAN
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Requests Meter -->
                <div class="flex items-center justify-between gap-3 bg-black/35 border border-white/5 rounded-2xl p-3 mt-3">
                  <div class="flex-1 space-y-1.5">
                    <div class="flex items-center justify-between text-[10px] font-bold">
                      <span class="text-brand-textMuted flex items-center gap-1">⚡ AI Requests</span>
                      <span class="text-brand-highlight">1,248 / 5,000</span>
                    </div>
                    <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-brand-secondary to-brand-highlight rounded-full" style="width: 25%"></div>
                    </div>
                  </div>
                  <!-- SVG circular chart ring -->
                  <div class="relative w-10 h-10 flex items-center justify-center shrink-0">
                    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path class="text-white/10" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path class="text-brand-highlight" stroke-dasharray="25, 100" stroke-width="3.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span class="absolute text-[8px] font-black text-white">25%</span>
                  </div>
                </div>

                <!-- Navigation List -->
                <div class="py-2.5 space-y-1 border-b border-white/5">
                  <button (click)="navTo('/profile')" class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition group text-left">
                    <div class="flex items-center gap-3">
                      <div class="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        👤
                      </div>
                      <div>
                        <span class="text-xs font-bold text-white block">Developer Profile</span>
                        <span class="text-[9px] text-brand-textMuted/60 block">View Achievements & Stats</span>
                      </div>
                    </div>
                    <span class="text-brand-textMuted/40 group-hover:text-white transition">&rarr;</span>
                  </button>

                  <button (click)="navTo('/dashboard')" class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition group text-left">
                    <div class="flex items-center gap-3">
                      <div class="w-7 h-7 rounded-lg bg-[#4F46E5]/10 border border-[#4F46E5]/20 flex items-center justify-center text-brand-primary">
                        🏠
                      </div>
                      <div>
                        <span class="text-xs font-bold text-white block">Dashboard</span>
                        <span class="text-[9px] text-brand-textMuted/60 block">Overview & Analytics</span>
                      </div>
                    </div>
                    <span class="text-brand-textMuted/40 group-hover:text-white transition">&rarr;</span>
                  </button>

                  <button (click)="navTo('/workspace')" class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition group text-left">
                    <div class="flex items-center gap-3">
                      <div class="w-7 h-7 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center text-brand-accent">
                        💻
                      </div>
                      <div>
                        <span class="text-xs font-bold text-white block">Workspace Environment</span>
                        <span class="text-[9px] text-brand-textMuted/60 block">Your AI Coding Workspace</span>
                      </div>
                    </div>
                    <span class="text-brand-textMuted/40 group-hover:text-white transition">&rarr;</span>
                  </button>

                  <button (click)="navTo('/jobs')" class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition group text-left">
                    <div class="flex items-center gap-3">
                      <div class="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                        💼
                      </div>
                      <div>
                        <span class="text-xs font-bold text-white block">Background Jobs Console</span>
                        <span class="text-[9px] text-brand-textMuted/60 block">Monitor & Manage Jobs</span>
                      </div>
                    </div>
                    <span class="text-brand-textMuted/40 group-hover:text-white transition">&rarr;</span>
                  </button>

                  <button (click)="navTo('/project-review')" class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition group text-left">
                    <div class="flex items-center gap-3">
                      <div class="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500">
                        🧠
                      </div>
                      <div>
                        <span class="text-xs font-bold text-white block">AI Project Review</span>
                        <span class="text-[9px] text-brand-textMuted/60 block">Smart Code Analysis</span>
                      </div>
                    </div>
                    <span class="text-brand-textMuted/40 group-hover:text-white transition">&rarr;</span>
                  </button>

                  <button (click)="navTo('/settings')" class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition group text-left">
                    <div class="flex items-center gap-3">
                      <div class="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                        ⚙️
                      </div>
                      <div>
                        <span class="text-xs font-bold text-white block">Settings Preferences</span>
                        <span class="text-[9px] text-brand-textMuted/60 block">Customize Your Experience</span>
                      </div>
                    </div>
                    <span class="text-brand-textMuted/40 group-hover:text-white transition">&rarr;</span>
                  </button>
                </div>

                <!-- Interactive App Appearance Themes Panel -->
                <div class="py-3 border-b border-white/5">
                  <h4 class="text-[9px] font-extrabold text-brand-highlight/85 uppercase tracking-wider mb-2.5">
                    CHOOSE YOUR THEME
                  </h4>
                  <div class="grid grid-cols-2 gap-2">
                    <button (click)="setAppTheme('theme-purple')" 
                            [class]="appTheme() === 'theme-purple' ? 'border-brand-primary bg-brand-primary/10 text-white font-bold' : 'border-white/5 bg-white/5 text-brand-textMuted'"
                            class="relative flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-[11px] transition select-none cursor-pointer">
                      <span>💜</span><span>Purple</span>
                      @if (appTheme() === 'theme-purple') {
                        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-primary rounded-full flex items-center justify-center text-[8px] text-white">✓</span>
                      }
                    </button>
                    
                    <button (click)="setAppTheme('theme-blue')" 
                            [class]="appTheme() === 'theme-blue' ? 'border-brand-primary bg-brand-primary/10 text-white font-bold' : 'border-white/5 bg-white/5 text-brand-textMuted'"
                            class="relative flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-[11px] transition select-none cursor-pointer">
                      <span>🌊</span><span>Ocean</span>
                      @if (appTheme() === 'theme-blue') {
                        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-primary rounded-full flex items-center justify-center text-[8px] text-white">✓</span>
                      }
                    </button>

                    <button (click)="setAppTheme('theme-orange')" 
                            [class]="appTheme() === 'theme-orange' ? 'border-brand-primary bg-brand-primary/10 text-white font-bold' : 'border-white/5 bg-white/5 text-brand-textMuted'"
                            class="relative flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-[11px] transition select-none cursor-pointer">
                      <span>🌅</span><span>Sunset</span>
                      @if (appTheme() === 'theme-orange') {
                        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-primary rounded-full flex items-center justify-center text-[8px] text-white">✓</span>
                      }
                    </button>

                    <button (click)="setAppTheme('theme-green')" 
                            [class]="appTheme() === 'theme-green' ? 'border-brand-primary bg-brand-primary/10 text-white font-bold' : 'border-white/5 bg-white/5 text-brand-textMuted'"
                            class="relative flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-[11px] transition select-none cursor-pointer">
                      <span>🌿</span><span>Emerald</span>
                      @if (appTheme() === 'theme-green') {
                        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-primary rounded-full flex items-center justify-center text-[8px] text-white">✓</span>
                      }
                    </button>

                    <button (click)="setAppTheme('theme-midnight')" 
                            [class]="appTheme() === 'theme-midnight' ? 'border-brand-primary bg-brand-primary/10 text-white font-bold' : 'border-white/5 bg-white/5 text-brand-textMuted'"
                            class="relative flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-[11px] transition select-none cursor-pointer">
                      <span>🌙</span><span>Midnight</span>
                      @if (appTheme() === 'theme-midnight') {
                        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-primary rounded-full flex items-center justify-center text-[8px] text-white">✓</span>
                      }
                    </button>

                    <button (click)="setAppTheme('theme-light')" 
                            [class]="appTheme() === 'theme-light' ? 'border-brand-primary bg-brand-primary/10 text-white font-bold' : 'border-white/5 bg-white/5 text-brand-textMuted'"
                            class="relative flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-[11px] transition select-none cursor-pointer">
                      <span>☀️</span><span>Light UI</span>
                      @if (appTheme() === 'theme-light') {
                        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-primary rounded-full flex items-center justify-center text-[8px] text-white">✓</span>
                      }
                    </button>
                  </div>
                </div>

                <!-- Documentation and Support links -->
                <div class="py-2 space-y-1.5 border-b border-white/5">
                  <a href="https://github.com" target="_blank" class="w-full flex items-center justify-between px-2.5 py-1 rounded-lg hover:bg-white/5 transition text-left group">
                    <div class="flex items-center gap-3">
                      <span class="text-sm">📄</span>
                      <div>
                        <span class="text-xs font-bold text-white block">Documentation</span>
                        <span class="text-[9px] text-brand-textMuted/60 block">Guides & Help Center</span>
                      </div>
                    </div>
                    <span class="text-brand-textMuted/40 group-hover:text-white transition">&rarr;</span>
                  </a>

                  <a href="https://github.com" target="_blank" class="w-full flex items-center justify-between px-2.5 py-1 rounded-lg hover:bg-white/5 transition text-left group">
                    <div class="flex items-center gap-3">
                      <span class="text-sm">💬</span>
                      <div>
                        <span class="text-xs font-bold text-white block">Share Feedback</span>
                        <span class="text-[9px] text-brand-textMuted/60 block">Help us improve</span>
                      </div>
                    </div>
                    <span class="text-brand-textMuted/40 group-hover:text-white transition">&rarr;</span>
                  </a>
                </div>

                <!-- Sign Out -->
                <div class="pt-2">
                  <button (click)="logout()" class="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition text-left">
                    <div class="flex items-center gap-3">
                      <span class="text-xs">🚪</span>
                      <div>
                        <span class="text-xs font-bold block">Sign Out</span>
                        <span class="text-[9px] opacity-60 block">Logout from DevMind AI</span>
                      </div>
                    </div>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            }
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

  user = this.authService.currentUserSignal;

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
