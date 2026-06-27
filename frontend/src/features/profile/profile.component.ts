import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AnalyticsService, AnalyticsSummaryResponse } from '../../core/services/analytics.service';
import { ConfettiService } from '../../core/services/confetti.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
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
            <h1 class="text-2xl font-extrabold text-white tracking-wide font-title">👤 Developer Profile</h1>
            <p class="text-[11px] text-brand-textMuted/60 uppercase tracking-wider font-semibold mt-1">Review account achievements and workspace usage metrics</p>
          </div>
          <a routerLink="/dashboard" class="text-xs font-bold text-brand-highlight hover:underline flex items-center gap-1">
            &larr; Back to Dashboard
          </a>
        </div>

        <!-- Layout Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <!-- Column 1: Profile Card -->
          <div class="md:col-span-1 flex flex-col gap-6">
            <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
              <div class="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-secondary to-brand-highlight"></div>
              
              <!-- Avatar -->
              <div class="w-20 h-20 rounded-2xl bg-brand-surface border-2 border-brand-highlight flex items-center justify-center text-brand-highlight text-3xl font-black uppercase mb-4 shadow-medium mt-2">
                @if (user()?.profilePicture) {
                  <img [src]="user()?.profilePicture" alt="Profile" class="w-full h-full object-cover">
                } @else {
                  {{ user()?.firstName?.charAt(0) }}{{ user()?.lastName?.charAt(0) }}
                }
              </div>

              <!-- Info -->
              <h2 class="text-lg font-bold text-white leading-none mb-1">
                {{ user()?.firstName }} {{ user()?.lastName }}
              </h2>
              <span class="text-[10px] font-bold text-brand-highlight bg-brand-highlight/10 px-2 py-0.5 rounded border border-brand-highlight/20 uppercase tracking-wide mb-4">
                {{ getLevelTitle() }}
              </span>
              
              <div class="w-full border-t border-white/5 pt-4 text-left space-y-3.5 text-xs text-brand-textMuted">
                <div>
                  <span class="block text-[9px] uppercase font-bold text-white/40 leading-none mb-1">Email Address</span>
                  <span class="font-semibold text-white truncate block">{{ user()?.email }}</span>
                </div>
                <div>
                  <span class="block text-[9px] uppercase font-bold text-white/40 leading-none mb-1">System Role</span>
                  <span class="font-semibold text-white capitalize block">{{ user()?.role }}</span>
                </div>
                <div>
                  <span class="block text-[9px] uppercase font-bold text-white/40 leading-none mb-1">Total Operations Run</span>
                  <span class="font-semibold text-brand-highlight block">{{ summary()?.totalRequests || 0 }} analyses</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Column 2 & 3: Statistics & Achievements -->
          <div class="md:col-span-2 flex flex-col gap-8">
            
            <!-- Statistics Panel -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl">
              <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 font-title">
                📊 Workspace Usage Statistics
              </h3>
              
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <!-- Stat 1 -->
                <div class="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
                  <span class="text-[9px] font-bold text-brand-textMuted/60 uppercase block">Total Queries</span>
                  <span class="text-2xl font-black text-white block mt-1">{{ summary()?.totalRequests || 0 }}</span>
                </div>
                <!-- Stat 2 -->
                <div class="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
                  <span class="text-[9px] font-bold text-brand-textMuted/60 uppercase block">Success Rate</span>
                  <span class="text-2xl font-black text-emerald-400 block mt-1">{{ (summary()?.successRate || 0) | number:'1.1-1' }}%</span>
                </div>
                <!-- Stat 3 -->
                <div class="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
                  <span class="text-[9px] font-bold text-brand-textMuted/60 uppercase block">Avg Latency</span>
                  <span class="text-2xl font-black text-brand-highlight block mt-1">{{ (summary()?.averageLatencyMs || 0) | number:'1.0-0' }}ms</span>
                </div>
                <!-- Stat 4 -->
                <div class="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
                  <span class="text-[9px] font-bold text-brand-textMuted/60 uppercase block">Est. Tokens</span>
                  <span class="text-2xl font-black text-brand-accent block mt-1">{{ summary()?.totalEstimatedTokens || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Achievements Panel -->
            <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-title">
                  🏆 Achievements Unlock Log
                </h3>
                <span class="text-[9px] font-bold text-brand-highlight bg-brand-highlight/10 px-2 py-0.5 rounded border border-brand-highlight/20 uppercase tracking-wide">
                  Click badges to celebrate!
                </span>
              </div>
              
              <div class="space-y-3">
                @for (ach of achievementsList; track ach.id) {
                  <div (click)="clickAchievement(ach)"
                       [ngClass]="isAchievementUnlocked(ach) ? 'bg-brand-highlight/5 border-brand-highlight/20 cursor-pointer hover:bg-brand-highlight/10' : 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'"
                       class="p-4 rounded-xl border flex items-center justify-between gap-4 transition duration-200">
                    <div class="flex items-center gap-3">
                      <span class="text-3xl shrink-0">{{ ach.icon }}</span>
                      <div>
                        <h4 class="text-xs font-bold" [ngClass]="isAchievementUnlocked(ach) ? 'text-white' : 'text-brand-textMuted'">
                          {{ ach.name }}
                        </h4>
                        <p class="text-[10px] text-brand-textMuted/60 mt-0.5">{{ ach.desc }}</p>
                      </div>
                    </div>
                    <div class="shrink-0 flex items-center gap-2">
                      @if (isAchievementUnlocked(ach)) {
                        <span class="text-[9px] font-bold text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full select-none">Unlocked</span>
                        <span class="text-emerald-400">✓</span>
                      } @else {
                        <span class="text-[9px] font-bold text-white/30 uppercase bg-white/5 border border-white/5 px-2 py-0.5 rounded-full select-none">Locked</span>
                        <span class="text-white/20">🔒</span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

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
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private analyticsService = inject(AnalyticsService);
  private confetti = inject(ConfettiService);
  private toastr = inject(ToastrService);

  user = this.authService.currentUserSignal;
  summary = signal<AnalyticsSummaryResponse | null>(null);

  achievementsList = [
    { id: 'first', name: 'First Analysis 🥇', icon: '🥇', desc: 'Complete your first AI review operation', threshold: 1 },
    { id: 'ten', name: '10 Reviews 🔥', icon: '🔥', desc: 'Execute 10 total AI review runs', threshold: 10 },
    { id: 'power', name: 'Power User 💎', icon: '💎', desc: 'Execute 25 total AI review runs', threshold: 25 },
    { id: 'fifty', name: 'AI Master 🧠', icon: '🧠', desc: 'Execute 50 total AI review runs', threshold: 50 },
    { id: 'hundred', name: '100 Reviews 🚀', icon: '🚀', desc: 'Execute 100 total AI review runs', threshold: 100 }
  ];

  ngOnInit() {
    this.analyticsService.getSummary().subscribe({
      next: (res) => {
        this.summary.set(res.data);
        // Trigger initial celebratory confetti burst if they have at least 1 analysis!
        if (res.data && res.data.totalRequests >= 1) {
          setTimeout(() => {
            this.confetti.burst();
          }, 300);
        }
      },
      error: (err) => console.error('Failed to load analytics summary', err)
    });
  }

  getLevelTitle(): string {
    const total = this.summary()?.totalRequests || 0;
    if (total >= 50) return 'AI Master 🧠';
    if (total >= 25) return 'Power User 💎';
    if (total >= 10) return 'AI Practitioner 🔥';
    if (total >= 1) return 'First Steps 🐣';
    return 'Novice Developer 🥚';
  }

  isAchievementUnlocked(ach: any): boolean {
    const total = this.summary()?.totalRequests || 0;
    return total >= ach.threshold;
  }

  clickAchievement(ach: any): void {
    if (this.isAchievementUnlocked(ach)) {
      this.confetti.burst();
      this.toastr.success(`Celebrating: ${ach.name}! 🎉`, 'Achievement Unlocked');
    } else {
      this.toastr.warning(`Complete more analyses to unlock this achievement. Threshold: ${ach.threshold}`, 'Locked');
    }
  }
}
