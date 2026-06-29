import { Component, Input, Output, EventEmitter, inject, OnInit, OnChanges, SimpleChanges, HostListener, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ToastrService } from 'ngx-toastr';

interface NavItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action: string;
}

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop blur overlay -->
        <div class="absolute inset-0 bg-black/75 backdrop-blur-md" (click)="closeModal()"></div>

        <!-- Centered Modal Box with elastic scale-up -->
        <div #modalContainer
             class="relative w-full max-w-4xl bg-brand-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-scale-up text-brand-text font-sans z-10 max-h-[90vh]"
             (click)="$event.stopPropagation()"
             role="dialog"
             aria-modal="true"
             aria-labelledby="modal-title">

          <!-- Close Button (✕) -->
          <button #closeButton
                  (click)="closeModal()"
                  class="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center transition-all duration-300 hover:rotate-90 cursor-pointer outline-none focus:ring-1 focus:ring-brand-highlight"
                  aria-label="Close Profile Modal">
            <span class="text-sm font-bold">✕</span>
          </button>

          <!-- Left Section (Profile Summary) -->
          <div class="w-full md:w-[40%] bg-white/[0.02] border-r border-white/5 p-6 flex flex-col gap-6 overflow-y-auto no-scrollbar">
            
            <!-- User Info Card -->
            <div class="flex flex-col items-center text-center">
              <div class="w-20 h-20 rounded-2xl bg-brand-surface border-2 border-brand-highlight flex items-center justify-center text-brand-highlight text-3xl font-black uppercase mb-3 shadow-md relative overflow-hidden">
                @if (user()?.profilePicture) {
                  <img [src]="user()?.profilePicture" alt="Profile" class="w-full h-full object-cover">
                } @else {
                  {{ user()?.firstName?.charAt(0) }}{{ user()?.lastName?.charAt(0) }}
                }
              </div>

              <!-- Username & Email -->
              <h3 id="modal-title" class="text-base font-extrabold text-white leading-tight flex items-center gap-1.5 justify-center">
                {{ user()?.firstName }} {{ user()?.lastName }}
                <span class="text-brand-highlight text-xs select-none" title="Verified Account">✓</span>
              </h3>
              <p class="text-[11px] text-brand-textMuted/60 leading-none mt-1.5 truncate max-w-full">
                {{ user()?.email }}
              </p>

              <!-- Badges Row -->
              <div class="flex gap-2 mt-3.5">
                <span class="text-[9px] font-bold text-brand-highlight bg-brand-highlight/10 px-2.5 py-0.5 rounded border border-brand-highlight/20 uppercase tracking-wide">
                  {{ getLevelTitle() }}
                </span>
                <span class="text-[9px] font-bold text-brand-accent bg-brand-accent/10 px-2.5 py-0.5 rounded border border-brand-accent/20 uppercase tracking-wide">
                  {{ planName }}
                </span>
              </div>
            </div>

            <!-- AI Usage Card -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div class="flex justify-between items-center text-xs">
                <span class="font-bold text-brand-textMuted">AI Request Usage</span>
                <span class="font-black text-brand-highlight">{{ usagePercentage }}%</span>
              </div>
              <div class="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div class="h-full bg-gradient-to-r from-brand-primary to-brand-highlight rounded-full transition-all duration-500" [style.width.%]="usagePercentage"></div>
              </div>
              <div class="flex justify-between text-[10px] font-mono text-brand-textMuted/60 font-semibold">
                <span>{{ totalRequests() | number }} / {{ limitRequests | number }} Reqs</span>
                <span>Limit reset monthly</span>
              </div>
            </div>

            <!-- Current Plan Card -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 text-left">
              <div class="flex items-start gap-2.5">
                <span class="text-base">⭐</span>
                <div>
                  <h4 class="text-[11px] font-black text-white uppercase tracking-wider">{{ planName }}</h4>
                  <p class="text-[10px] text-brand-textMuted/80 leading-snug mt-1">{{ planDescription }}</p>
                </div>
              </div>
              <button (click)="managePlan()" class="w-full py-2 bg-gradient-to-r from-brand-primary to-brand-highlight hover:from-brand-primary-hover hover:to-brand-highlight rounded-xl text-[10px] font-bold text-white shadow transition-all cursor-pointer border-none uppercase tracking-widest text-center mt-1">
                Manage Plan
              </button>
            </div>

            <!-- Theme Selector -->
            <div class="space-y-3">
              <h4 class="text-[10px] font-extrabold text-brand-highlight/90 uppercase tracking-widest text-center">App Theme</h4>
              <div class="grid grid-cols-2 gap-2">
                <button (click)="setTheme('theme-purple')" 
                        [class]="appTheme() === 'theme-purple' ? 'border-brand-primary bg-brand-primary/10 text-white font-bold' : 'border-white/5 bg-white/5 text-brand-textMuted'"
                        class="relative flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[11px] transition select-none cursor-pointer">
                  <span>💜</span><span>Purple</span>
                </button>
                
                <button (click)="setTheme('theme-blue')" 
                        [class]="appTheme() === 'theme-blue' ? 'border-brand-primary bg-brand-primary/10 text-white font-bold' : 'border-white/5 bg-white/5 text-brand-textMuted'"
                        class="relative flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[11px] transition select-none cursor-pointer">
                  <span>🌊</span><span>Ocean</span>
                </button>

                <button (click)="setTheme('theme-green')" 
                        [class]="appTheme() === 'theme-green' ? 'border-brand-primary bg-brand-primary/10 text-white font-bold' : 'border-white/5 bg-white/5 text-brand-textMuted'"
                        class="relative flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[11px] transition select-none cursor-pointer">
                  <span>🌿</span><span>Emerald</span>
                </button>

                <button (click)="setTheme('theme-midnight')" 
                        [class]="appTheme() === 'theme-midnight' ? 'border-brand-primary bg-brand-primary/10 text-white font-bold' : 'border-white/5 bg-white/5 text-brand-textMuted'"
                        class="relative flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[11px] transition select-none cursor-pointer">
                  <span>🌙</span><span>Midnight</span>
                </button>
              </div>
            </div>

          </div>

          <!-- Right Section (Navigation Menu) -->
          <div class="w-full md:w-[60%] p-6 flex flex-col gap-4 overflow-y-auto no-scrollbar relative text-left">
            <h4 class="text-[10px] font-black uppercase text-brand-textMuted/60 tracking-wider mb-2">
              Quick Actions & Settings
            </h4>

            <div class="grid sm:grid-cols-2 gap-3">
              @for (item of navItems; track item.id) {
                <a (click)="navigate(item.action)"
                   class="group flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-brand-highlight/25 rounded-2xl cursor-pointer transition duration-300 shadow-sm">
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="text-lg shrink-0 p-2 rounded-xl bg-white/5 group-hover:bg-brand-highlight/10 group-hover:text-brand-highlight transition duration-300">
                      {{ item.icon }}
                    </span>
                    <div class="min-w-0">
                      <h4 class="text-xs font-bold text-white group-hover:text-brand-highlight transition duration-300 leading-tight">
                        {{ item.title }}
                      </h4>
                      <p class="text-[9px] text-brand-textMuted/60 leading-tight mt-1 truncate">
                        {{ item.subtitle }}
                      </p>
                    </div>
                  </div>
                  <span class="text-brand-textMuted/40 group-hover:text-white group-hover:translate-x-0.5 transition duration-300 text-xs font-bold font-mono">
                    &rarr;
                  </span>
                </a>
              }
            </div>
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProfileModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  private authService = inject(AuthService);
  private analyticsService = inject(AnalyticsService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('modalContainer') modalContainer!: ElementRef<HTMLDivElement>;

  user = this.authService.currentUserSignal;
  totalRequests = signal<number>(0);
  appTheme = signal<string>('theme-purple');

  navItems: NavItem[] = [
    { id: 'dashboard', title: 'Dashboard', subtitle: 'Overview & Analytics', icon: '🏠', action: '/dashboard' },
    { id: 'workspace', title: 'Workspace', subtitle: 'AI Coding Workspace', icon: '💻', action: '/workspace' },
    { id: 'reviews', title: 'AI Project Reviews', subtitle: 'Review & Improve Code', icon: '👁️', action: '/project-review' },
    { id: 'jobs', title: 'Background Jobs', subtitle: 'Monitor Running Tasks', icon: '⚙️', action: '/jobs' },
    { id: 'settings', title: 'Settings', subtitle: 'Preferences & Account', icon: '🔧', action: '/settings' },
    { id: 'docs', title: 'Documentation', subtitle: 'Guides & Help Center', icon: '📚', action: 'docs' },
    { id: 'feedback', title: 'Feedback', subtitle: 'Share Feedback', icon: '💬', action: 'feedback' },
    { id: 'logout', title: 'Logout', subtitle: 'Sign out safely', icon: '🚪', action: 'logout' }
  ];

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.appTheme.set(localStorage.getItem('devmind_current_theme') || 'theme-purple');
    }
    this.fetchUsage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.fetchUsage();
      this.preventBodyScroll();
      // Accessibility: Focus initial close button
      setTimeout(() => {
        this.closeButton?.nativeElement?.focus();
      }, 100);
    } else if (changes['isOpen'] && changes['isOpen'].currentValue === false) {
      this.restoreBodyScroll();
    }
  }

  fetchUsage(): void {
    if (!this.authService.isAuthenticated()) return;
    this.analyticsService.getSummary().subscribe({
      next: (res) => {
        if (res.data) {
          this.totalRequests.set(res.data.totalRequests || 0);
        }
      },
      error: () => {}
    });
  }

  get limitRequests(): number {
    return this.user()?.role === 'ADMIN' ? 5000 : 100;
  }

  get planName(): string {
    return this.user()?.role === 'ADMIN' ? 'Pro Plan' : 'Free Plan';
  }

  get planDescription(): string {
    return this.user()?.role === 'ADMIN' 
      ? 'Unlimited access to advanced AI reviews and background task executors.' 
      : 'Standard analysis rate limits and daily developer chat support.';
  }

  get usagePercentage(): number {
    const used = this.totalRequests();
    const limit = this.limitRequests;
    return Math.min(100, Math.round((used / limit) * 100));
  }

  getLevelTitle(): string {
    const reqs = this.totalRequests();
    if (reqs > 100) return 'Expert Developer';
    if (reqs > 30) return 'Intermediate Developer';
    return 'Novice Developer';
  }

  // Prevents scrolling background body
  preventBodyScroll(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  restoreBodyScroll(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  closeModal(): void {
    this.close.emit();
    this.restoreBodyScroll();
  }

  managePlan(): void {
    this.closeModal();
    this.router.navigate(['/settings']);
    this.toastr.info('Upgrade plans and billing options can be configured here.', 'Billing Manager');
  }

  setTheme(theme: string): void {
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

  navigate(action: string): void {
    this.closeModal();
    if (action === 'logout') {
      this.authService.logout();
    } else if (action === 'docs') {
      this.toastr.info('Documentation is currently under maintenance.', 'Guides & Docs');
    } else if (action === 'feedback') {
      this.toastr.success('Thank you for your feedback!', 'Feedback Submitted');
    } else {
      this.router.navigate([action]);
    }
  }

  // Accessibility: ESC closes modal
  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.closeModal();
    }
  }

  // Accessibility: Focus trap & Tab cycles correctly
  @HostListener('keydown.tab', ['$event'])
  onTabKey(event: KeyboardEvent): void {
    if (!this.isOpen) return;
    const focusable = this.getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    }
  }

  private getFocusableElements(): HTMLElement[] {
    if (!this.modalContainer) return [];
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]';
    const elements = Array.from(this.modalContainer.nativeElement.querySelectorAll(selector)) as HTMLElement[];
    return elements.filter(el => el.tabIndex !== -1);
  }
}
