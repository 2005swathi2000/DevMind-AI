import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommandPaletteService } from '../../core/services/command-palette.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent],
  template: `
    <div class="flex-1 flex flex-col min-h-screen bg-brand-bg text-brand-text font-sans pb-12 relative overflow-hidden">
      <!-- Glow background accents -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-brand-primary/5 blur-[120px]"></div>
        <div class="absolute bottom-[20%] right-[5%] w-[500px] h-[500px] rounded-full bg-brand-highlight/5 blur-[120px]"></div>
      </div>

      <!-- Shared Header Navbar -->
      <app-navbar></app-navbar>

      <!-- Main Container -->
      <main class="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 flex flex-col gap-8 animate-fade-in relative z-10">
        
        <!-- Page Title -->
        <div class="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h1 class="text-2xl font-extrabold text-white tracking-wide font-title">⚙️ Settings & Configuration</h1>
            <p class="text-[11px] text-brand-textMuted/60 uppercase tracking-wider font-semibold mt-1">Configure profile details, preferences, and editor tools</p>
          </div>
          <a routerLink="/dashboard" class="text-xs font-bold text-brand-highlight hover:underline flex items-center gap-1">
            &larr; Back to Dashboard
          </a>
        </div>

        <!-- Settings Layout Columns -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <!-- Navigation Sidebar -->
          <div class="md:col-span-1 flex flex-col gap-2">
            <button (click)="activeTab = 'profile'" 
                    [ngClass]="activeTab === 'profile' ? 'bg-white/10 text-white border-l-2 border-brand-highlight' : 'text-brand-textMuted/70 hover:bg-white/5'"
                    class="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition duration-150">
              👤 Edit Profile Details
            </button>
            <button (click)="activeTab = 'general'" 
                    [ngClass]="activeTab === 'general' ? 'bg-white/10 text-white border-l-2 border-brand-highlight' : 'text-brand-textMuted/70 hover:bg-white/5'"
                    class="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition duration-150">
              🎨 Preferences & Themes
            </button>
            <button (click)="activeTab = 'api'" 
                    [ngClass]="activeTab === 'api' ? 'bg-white/10 text-white border-l-2 border-brand-highlight' : 'text-brand-textMuted/70 hover:bg-white/5'"
                    class="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition duration-150">
              🔑 API Access Keys
            </button>
          </div>

          <!-- Settings Forms Column -->
          <div class="md:col-span-2 flex flex-col gap-8">
            
            <!-- PROFILE TAB -->
            @if (activeTab === 'profile') {
              <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl space-y-6 animate-fade-in">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 font-title">
                  Profile Details
                </h3>

                <!-- Avatar Upload Section -->
                <div class="flex items-center gap-5 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div class="relative w-16 h-16 rounded-2xl overflow-hidden bg-brand-surface border border-white/10 flex items-center justify-center text-brand-highlight text-2xl font-extrabold">
                    @if (profilePicture) {
                      <img [src]="profilePicture" alt="Avatar" class="w-full h-full object-cover">
                    } @else {
                      {{ firstName.charAt(0) }}{{ lastName.charAt(0) }}
                    }
                  </div>
                  <div class="flex flex-col gap-2">
                    <span class="text-xs font-bold text-white">Profile Photo</span>
                    <div class="flex gap-2">
                      <label class="cursor-pointer bg-brand-primary hover:bg-brand-primary/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition">
                        Upload Image
                        <input type="file" (change)="onAvatarUpload($event)" accept="image/*" class="hidden">
                      </label>
                      <button (click)="generateDefaultAvatar()" class="bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition">
                        Reset Avatar
                      </button>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[10px] font-bold uppercase tracking-wider text-brand-textMuted mb-1.5">First Name</label>
                    <input type="text" [(ngModel)]="firstName" 
                           class="w-full bg-brand-surface border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-highlight">
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold uppercase tracking-wider text-brand-textMuted mb-1.5">Last Name</label>
                    <input type="text" [(ngModel)]="lastName" 
                           class="w-full bg-brand-surface border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-highlight">
                  </div>
                </div>

                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-brand-textMuted mb-1.5">Gender</label>
                  <select [(ngModel)]="gender"
                          class="w-full bg-brand-surface border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-highlight">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <button (click)="saveProfileDetails()" [disabled]="isProfileLoading"
                        class="btn-primary w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                  @if (isProfileLoading) {
                    <span class="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                    <span>Saving Profile...</span>
                  } @else {
                    <span>Save Profile Changes</span>
                  }
                </button>
              </div>
            }

            <!-- GENERAL PREFERENCES TAB -->
            @if (activeTab === 'general') {
              <div class="space-y-6 animate-fade-in">
                <!-- Appearance -->
                <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl space-y-6">
                  <h3 class="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 font-title">
                    🎨 Visual Appearance
                  </h3>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="flex flex-col gap-2">
                      <label class="text-[10px] font-bold uppercase text-brand-textMuted/75">Application Theme</label>
                      <select [(ngModel)]="appTheme" (change)="changeAppTheme()"
                              class="w-full bg-brand-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-highlight">
                        <option value="theme-purple">🌌 Purple Space (Default)</option>
                        <option value="theme-blue">🌊 Ocean Blue</option>
                        <option value="theme-orange">🌅 Sunset Orange</option>
                        <option value="theme-green">🌿 Emerald Green</option>
                        <option value="theme-midnight">🌙 Midnight Dark</option>
                        <option value="theme-light">☀️ Light Theme</option>
                      </select>
                    </div>

                    <div class="flex flex-col gap-2">
                      <label class="text-[10px] font-bold uppercase text-brand-textMuted/75">Language</label>
                      <select [(ngModel)]="activeLanguage" (change)="savePrefs()"
                              class="w-full bg-brand-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-highlight">
                        <option value="en">English (US)</option>
                        <option value="es">Español (ES)</option>
                        <option value="fr">Français (FR)</option>
                        <option value="de">Deutsch (DE)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Monaco Editor Configuration -->
                <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl space-y-6">
                  <h3 class="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 font-title">
                    💻 Monaco Editor Preferences
                  </h3>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="flex flex-col gap-2">
                      <label class="text-[10px] font-bold uppercase text-brand-textMuted/75">Editor Theme</label>
                      <select [(ngModel)]="editorTheme" (change)="changeEditorTheme()"
                              class="w-full bg-brand-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-highlight">
                        <option value="devmind-dark">Purple Brand Dark</option>
                        <option value="vs-dark">Monaco Dark</option>
                        <option value="vs">Monaco Light</option>
                      </select>
                    </div>

                    <div class="flex flex-col gap-2">
                      <label class="text-[10px] font-bold uppercase text-brand-textMuted/75">Editor Font Size</label>
                      <input type="number" [(ngModel)]="fontSize" min="10" max="24" (change)="savePrefs()"
                             class="w-full bg-brand-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-highlight">
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <label class="flex items-center gap-3 cursor-pointer select-none">
                      <input type="checkbox" [(ngModel)]="wordWrap" (change)="savePrefs()"
                             class="rounded border-white/10 bg-brand-surface text-brand-highlight focus:ring-brand-highlight">
                      <div>
                        <span class="text-xs font-bold text-white block">Word Wrap</span>
                        <span class="text-[9px] text-brand-textMuted/60 block">Wrap long line codes vertically</span>
                      </div>
                    </label>

                    <label class="flex items-center gap-3 cursor-pointer select-none">
                      <input type="checkbox" [(ngModel)]="autoSave" (change)="savePrefs()"
                             class="rounded border-white/10 bg-brand-surface text-brand-highlight focus:ring-brand-highlight">
                      <div>
                        <span class="text-xs font-bold text-white block">Auto Save changes</span>
                        <span class="text-[9px] text-brand-textMuted/60 block">Save workspace codes periodically</span>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- AI settings -->
                <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl space-y-6">
                  <h3 class="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 font-title">
                    🧠 AI Assistant Engine
                  </h3>

                  <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-bold uppercase text-brand-textMuted/75">Preferred AI Provider</label>
                    <select [(ngModel)]="aiProvider" (change)="savePrefs()"
                            class="w-full bg-brand-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-highlight">
                      <option value="gemini">Google Gemini Ultra (Recommended)</option>
                      <option value="openai">OpenAI GPT-4o</option>
                      <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
                    </select>
                  </div>
                </div>

                <!-- Notifications Alerts -->
                <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
                  <h3 class="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 font-title">
                    🔔 Notifications Options
                  </h3>
                  
                  <div class="space-y-4">
                    <label class="flex items-start gap-3 cursor-pointer select-none">
                      <input type="checkbox" [(ngModel)]="notifEmail" (change)="savePrefs()"
                             class="rounded border-white/10 bg-brand-surface text-brand-highlight focus:ring-brand-highlight mt-0.5">
                      <div>
                        <span class="text-xs font-bold text-white block">Email review summaries</span>
                        <span class="text-[10px] text-brand-textMuted/60 block">Receive audit email sheets after workspace review completion.</span>
                      </div>
                    </label>

                    <label class="flex items-start gap-3 cursor-pointer select-none">
                      <input type="checkbox" [(ngModel)]="notifPush" (change)="savePrefs()"
                             class="rounded border-white/10 bg-brand-surface text-brand-highlight focus:ring-brand-highlight mt-0.5">
                      <div>
                        <span class="text-xs font-bold text-white block">Real-time alerts notifications</span>
                        <span class="text-[10px] text-brand-textMuted/60 block">Show browser popups for analysis completions.</span>
                      </div>
                    </label>

                    <label class="flex items-start gap-3 cursor-pointer select-none">
                      <input type="checkbox" [(ngModel)]="notifFail" (change)="savePrefs()"
                             class="rounded border-white/10 bg-brand-surface text-brand-highlight focus:ring-brand-highlight mt-0.5">
                      <div>
                        <span class="text-xs font-bold text-white block">Worker diagnostics logs</span>
                        <span class="text-[10px] text-brand-textMuted/60 block">Get alert warnings if server workers encounter errors.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            }

            <!-- API ACCESS KEYS TAB -->
            @if (activeTab === 'api') {
              <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4 animate-fade-in">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 font-title">
                  🔑 API Token Access Keys
                </h3>
                <p class="text-[10px] text-brand-textMuted/65 leading-relaxed">
                  Connect your DevMind AI profile to external CLI scanners and IDE plugins (e.g., VS Code extension).
                </p>

                <div class="space-y-3">
                  @if (apiTokens().length === 0) {
                    <div class="py-4 text-center border border-dashed border-white/5 rounded-xl text-xs text-brand-textMuted/45">
                      No active API tokens found. Generate one below to connect extensions.
                    </div>
                  }
                  @for (token of apiTokens(); track token.id) {
                    <div class="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                      <div class="min-w-0">
                        <span class="text-xs font-bold text-white block">{{ token.name }}</span>
                        <span class="text-[10px] text-brand-textMuted/60 font-mono block mt-0.5">
                          {{ token.reveal ? token.key : 'devmind_live_sk_••••••••••••••••••••••••' }}
                        </span>
                      </div>
                      
                      <div class="flex items-center gap-2">
                        <button (click)="token.reveal = !token.reveal" class="text-[10px] font-bold text-brand-highlight hover:underline">
                          {{ token.reveal ? 'Hide' : 'Reveal' }}
                        </button>
                        <button (click)="copyToken(token)" class="text-[10px] font-bold text-white hover:underline">
                          Copy
                        </button>
                        <button (click)="deleteToken(token.id)" class="text-[10px] font-bold text-rose-400 hover:underline">
                          Revoke
                        </button>
                      </div>
                    </div>
                  }
                </div>

                <div class="pt-2 flex items-center gap-3">
                  <input type="text" [(ngModel)]="newTokenName" placeholder="Key name (e.g., VS Code Home)"
                         class="flex-1 bg-brand-surface border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/35 focus:outline-none focus:border-brand-highlight">
                  <button (click)="generateToken()"
                          class="btn-primary text-xs py-2 px-4 rounded-xl font-bold shrink-0">
                    Generate Key
                  </button>
                </div>
              </div>
            }

          </div>
        </div>

      </main>

      <!-- Footer -->
      <footer class="border-t border-brand-border bg-white/5 px-6 py-6 text-center text-xs text-brand-textMuted/60 mt-12 shrink-0">
        &copy; 2026 DevMind AI. Enterprise-grade AI Software Engineer Assistant. All rights reserved.
      </footer>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private toastr = inject(ToastrService);
  private commandService = inject(CommandPaletteService);
  private authService = inject(AuthService);

  activeTab = 'profile';
  isProfileLoading = false;

  // Profile data
  firstName = '';
  lastName = '';
  profilePicture = '';
  gender = 'male';

  // Visual options
  appTheme = 'theme-purple';
  activeLanguage = 'en';

  // Monaco options
  editorTheme = 'devmind-dark';
  fontSize = 14;
  wordWrap = true;
  autoSave = true;

  // AI config
  aiProvider = 'gemini';

  // Notifications
  notifEmail = true;
  notifPush = false;
  notifFail = true;

  newTokenName = '';
  apiTokens = signal<any[]>([
    { id: '1', name: 'IntelliJ Client Dev', key: 'devmind_live_sk_4f6g7hj8k901234567890abcdef', reveal: false }
  ]);

  ngOnInit() {
    this.loadProfile();
    this.loadStoredPreferences();
  }

  private loadProfile() {
    const user = this.authService.currentUserSignal();
    if (user) {
      this.firstName = user.firstName || '';
      this.lastName = user.lastName || '';
      this.profilePicture = user.profilePicture || '';
      this.gender = user.gender || 'male';
    }
  }

  private loadStoredPreferences() {
    if (typeof window === 'undefined') return;
    this.appTheme = localStorage.getItem('devmind_current_theme') || 'theme-purple';
    this.activeLanguage = localStorage.getItem('devmind_language') || 'en';
    this.editorTheme = localStorage.getItem('devmind_editor_theme') || 'devmind-dark';
    this.fontSize = Number(localStorage.getItem('devmind_font_size')) || 14;
    this.wordWrap = localStorage.getItem('devmind_word_wrap') !== 'false';
    this.autoSave = localStorage.getItem('devmind_auto_save') !== 'false';
    this.aiProvider = localStorage.getItem('devmind_ai_provider') || 'gemini';
    this.notifEmail = localStorage.getItem('devmind_notif_email') !== 'false';
    this.notifPush = localStorage.getItem('devmind_notif_push') === 'true';
    this.notifFail = localStorage.getItem('devmind_notif_fail') !== 'false';
  }

  onAvatarUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.profilePicture = reader.result as string;
      this.toastr.success('Avatar loaded. Save changes to store permanently!', 'Photo Staged');
    };
    reader.readAsDataURL(file);
  }

  generateDefaultAvatar() {
    const user = this.authService.currentUserSignal();
    if (user) {
      this.profilePicture = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`;
      this.toastr.success('Generated avatar from email seed.', 'Photo reset');
    }
  }

  saveProfileDetails() {
    this.isProfileLoading = true;
    this.authService.updateProfile({
      firstName: this.firstName,
      lastName: this.lastName,
      profilePicture: this.profilePicture,
      gender: this.gender
    }).subscribe({
      next: () => {
        this.isProfileLoading = false;
        this.toastr.success('Profile details saved successfully.', 'Profile Updated');
      },
      error: () => {
        this.isProfileLoading = false;
        this.toastr.error('Could not save profile details.', 'Error');
      }
    });
  }

  changeAppTheme(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('devmind_current_theme', this.appTheme);
    
    // Dynamically apply properties
    const root = document.documentElement;
    if (this.appTheme === 'theme-blue') {
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
    } else if (this.appTheme === 'theme-orange') {
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
    } else if (this.appTheme === 'theme-green') {
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
    } else if (this.appTheme === 'theme-midnight') {
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
    } else if (this.appTheme === 'theme-light') {
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

    this.toastr.success(`Application theme set to ${this.appTheme.replace('theme-', '').toUpperCase()}`, 'Theme Changed');
  }

  changeEditorTheme(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('devmind_editor_theme', this.editorTheme);

    let action = 'CHANGE_THEME_BRAND';
    if (this.editorTheme === 'vs-dark') action = 'CHANGE_THEME_VS_DARK';
    else if (this.editorTheme === 'vs') action = 'CHANGE_THEME_VS';

    this.commandService.triggerAction(action);
    this.toastr.success(`Editor theme updated to ${this.editorTheme}`, 'Settings Saved');
  }

  savePrefs(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('devmind_language', this.activeLanguage);
    localStorage.setItem('devmind_font_size', String(this.fontSize));
    localStorage.setItem('devmind_word_wrap', String(this.wordWrap));
    localStorage.setItem('devmind_auto_save', String(this.autoSave));
    localStorage.setItem('devmind_ai_provider', this.aiProvider);
    localStorage.setItem('devmind_notif_email', String(this.notifEmail));
    localStorage.setItem('devmind_notif_push', String(this.notifPush));
    localStorage.setItem('devmind_notif_fail', String(this.notifFail));

    this.toastr.success('Preferences successfully updated.', 'Preferences Saved');
  }

  generateToken(): void {
    const name = this.newTokenName.trim();
    if (!name) {
      this.toastr.error('Please enter a descriptive key name', 'Error');
      return;
    }

    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newKey = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      key: `devmind_live_sk_${randomHex}`,
      reveal: true
    };

    this.apiTokens.update(tokens => [...tokens, newKey]);
    this.newTokenName = '';
    this.toastr.success(`Key "${name}" successfully generated!`, 'Token Created');
  }

  copyToken(token: any): void {
    navigator.clipboard.writeText(token.key);
    this.toastr.success(`Token "${token.name}" copied to clipboard!`, 'Copied');
  }

  deleteToken(id: string): void {
    this.apiTokens.update(tokens => tokens.filter(t => t.id !== id));
    this.toastr.info('Token access revoked.', 'Revoked');
  }
}
