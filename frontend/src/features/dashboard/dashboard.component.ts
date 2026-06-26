import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AnalyticsService, AnalyticsSummaryResponse } from '../../core/services/analytics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe],
  template: `
    <div class="flex-1 flex flex-col min-h-screen bg-brand-bg text-brand-text font-sans">
      <!-- Navbar -->
      <nav class="border-b border-brand-border bg-brand-bg/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-secondary to-brand-highlight flex items-center justify-center font-bold text-white text-xl shadow-low transition duration-300 hover:scale-105">
            D
          </div>
          <div>
            <span class="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-highlight tracking-wide text-lg block">
              DEVMIND AI
            </span>
            <span class="text-[10px] block text-brand-textMuted font-bold uppercase tracking-wider">Enterprise Assistant</span>
          </div>
        </div>

        <div class="flex items-center gap-4">
          @if (user(); as u) {
            <div class="flex items-center gap-3">
              @if (u.profilePicture) {
                <img [src]="u.profilePicture" alt="Profile" class="w-9 h-9 rounded-full border border-brand-border object-cover shadow-low">
              } @else {
                <div class="w-9 h-9 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-brand-highlight font-bold uppercase">
                  {{ u.firstName.charAt(0) }}{{ u.lastName.charAt(0) }}
                </div>
              }
              <div class="hidden md:block text-left">
                <p class="text-sm font-bold text-white">{{ u.firstName }} {{ u.lastName }}</p>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-accent/15 text-brand-highlight border border-brand-accent/30 uppercase tracking-wide">
                  {{ u.role }}
                </span>
              </div>
            </div>
          }
          <button (click)="logout()" class="btn-secondary px-4 py-2 text-xs">
            Logout
          </button>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col justify-center animate-fade-in">
        <!-- Hero Section -->
        <div class="text-center max-w-3xl mx-auto mb-12">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 font-title">
            Welcome Back, {{ user()?.firstName || 'Developer' }}<br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-highlight to-brand-accent">
              AI-Powered Software Engineering
            </span>
          </h1>
          <p class="text-brand-textMuted text-sm max-w-xl mx-auto leading-relaxed">
            Analyze, test, and document your code bases asynchronously using custom AI provider execution pipelines.
          </p>
          <div class="mt-6 flex justify-center gap-3">
            <a routerLink="/workspace" class="btn-primary shadow-low hover:shadow-medium text-xs">
              Open AI Workspace &rarr;
            </a>
            <a routerLink="/jobs" class="btn-secondary shadow-low hover:shadow-medium text-xs">
              View Background Jobs
            </a>
          </div>
        </div>

        <!-- Telemetry Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto w-full mb-10">
          <!-- Card 1 -->
          <div class="p-5 rounded-[18px] bg-brand-surface border border-brand-border shadow-low hover:shadow-medium hover-lift text-center">
            <span class="text-[9px] uppercase font-bold text-brand-textMuted tracking-wider block">Total Requests</span>
            <p class="text-3xl font-black text-white mt-1.5 font-title">{{ summary()?.totalRequests || 0 }}</p>
          </div>
          <!-- Card 2 -->
          <div class="p-5 rounded-[18px] bg-brand-surface border border-brand-border shadow-low hover:shadow-medium hover-lift text-center">
            <span class="text-[9px] uppercase font-bold text-brand-textMuted tracking-wider block">Avg Latency</span>
            <p class="text-3xl font-black text-brand-highlight mt-1.5 font-title">{{ (summary()?.averageLatencyMs || 0) | number:'1.0-0' }}ms</p>
          </div>
          <!-- Card 3 -->
          <div class="p-5 rounded-[18px] bg-brand-surface border border-brand-border shadow-low hover:shadow-medium hover-lift text-center">
            <span class="text-[9px] uppercase font-bold text-brand-textMuted tracking-wider block">Cache Hit Rate</span>
            <p class="text-3xl font-black text-white mt-1.5 font-title">{{ (summary()?.cacheHitRate || 0) | number:'1.1-1' }}%</p>
          </div>
          <!-- Card 4 -->
          <div class="p-5 rounded-[18px] bg-brand-surface border border-brand-border shadow-low hover:shadow-medium hover-lift text-center">
            <span class="text-[9px] uppercase font-bold text-brand-textMuted tracking-wider block">Success Rate</span>
            <p class="text-3xl font-black text-brand-success mt-1.5 font-title">{{ (summary()?.successRate || 0) | number:'1.1-1' }}%</p>
          </div>
          <!-- Card 5 -->
          <div class="p-5 rounded-[18px] bg-brand-surface border border-brand-border shadow-low hover:shadow-medium hover-lift text-center col-span-2 md:col-span-1">
            <span class="text-[9px] uppercase font-bold text-brand-textMuted tracking-wider block">Est. Tokens</span>
            <p class="text-3xl font-black text-white mt-1.5 font-title">{{ summary()?.totalEstimatedTokens || 0 }}</p>
          </div>
        </div>

        <!-- Grouped Telemetry Grids -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full mb-10">
          <!-- Provider Usage -->
          <div class="p-6 rounded-[18px] bg-brand-surface border border-brand-border shadow-low">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 font-title">
              <span class="w-2 h-2 rounded-full bg-brand-highlight animate-pulse"></span>
              AI Provider Distribution
            </h3>
            
            <div class="table-container border-white/5 bg-black/25">
              <table class="table-brand">
                <thead>
                  <tr class="bg-white/5 text-brand-textMuted">
                    <th>Model / Provider</th>
                    <th class="text-right">Analyses Run</th>
                  </tr>
                </thead>
                <tbody>
                  @if (summary() && getKeys(summary()?.requestsByProvider).length > 0) {
                    @for (key of getKeys(summary()?.requestsByProvider); track key) {
                      <tr class="border-white/5 bg-transparent hover:bg-white/5">
                        <td class="capitalize font-bold text-white">{{ key }}</td>
                        <td class="text-right font-semibold text-brand-textMuted">{{ summary()?.requestsByProvider?.[key] || 0 }} requests</td>
                      </tr>
                    }
                  } @else {
                    <tr class="border-white/5">
                      <td colspan="2" class="text-center py-6 text-brand-textMuted/50 font-medium">No provider logs found yet.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tool Usage -->
          <div class="p-6 rounded-[18px] bg-brand-surface border border-brand-border shadow-low">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 font-title">
              <span class="w-2 h-2 rounded-full bg-brand-highlight animate-pulse"></span>
              Tool Operations Distribution
            </h3>

            <div class="table-container border-white/5 bg-black/25">
              <table class="table-brand">
                <thead>
                  <tr class="bg-white/5 text-brand-textMuted">
                    <th>AI Tool Operation</th>
                    <th class="text-right">Total Requests</th>
                  </tr>
                </thead>
                <tbody>
                  @if (summary() && getKeys(summary()?.requestsByToolType).length > 0) {
                    @for (key of getKeys(summary()?.requestsByToolType); track key) {
                      <tr class="border-white/5 bg-transparent hover:bg-white/5">
                        <td class="capitalize font-bold text-white">{{ key.replace('_', ' ') }}</td>
                        <td class="text-right font-semibold text-brand-textMuted">{{ summary()?.requestsByToolType?.[key] || 0 }} requests</td>
                      </tr>
                    }
                  } @else {
                    <tr class="border-white/5">
                      <td colspan="2" class="text-center py-6 text-brand-textMuted/50 font-medium">No operations logs found yet.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Tool Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          <!-- Card 1 -->
          <div class="p-6 card-brand">
            <div class="w-12 h-12 rounded-xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center mb-4 transition duration-300">
              <span class="text-brand-highlight font-bold text-lg">&lt;/&gt;</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2 font-title">Code Generator</h3>
            <p class="text-brand-textMuted text-xs leading-relaxed">
              Generate structured, modular, and optimized programs matching specific requirements with Monaco Editor support.
            </p>
          </div>

          <!-- Card 2 -->
          <div class="p-6 card-brand">
            <div class="w-12 h-12 rounded-xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center mb-4 transition duration-300">
              <span class="text-brand-highlight font-bold text-lg">&#x2713;</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2 font-title">Code Analysis & Review</h3>
            <p class="text-brand-textMuted text-xs leading-relaxed">
              Detect bugs, analyze syntax issues, optimize security, and review logic flows dynamically using advanced model reasoning.
            </p>
          </div>

          <!-- Card 3 -->
          <div class="p-6 card-brand">
            <div class="w-12 h-12 rounded-xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center mb-4 transition duration-300">
              <span class="text-brand-highlight font-bold text-lg">&#x1F4D8;</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2 font-title">Documentation & Tests</h3>
            <p class="text-brand-textMuted text-xs leading-relaxed">
              Instantly draft documentation wikis, README pages, and generate unit testing suites in Java, TS, and Python.
            </p>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="border-t border-brand-border bg-brand-surface px-6 py-6 text-center text-xs text-brand-textMuted">
        &copy; 2026 DevMind AI. Enterprise-grade AI Software Engineer Assistant. All rights reserved.
      </footer>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);

  user = this.authService.currentUserSignal;
  summary = signal<AnalyticsSummaryResponse | null>(null);

  ngOnInit() {
    this.analyticsService.getSummary().subscribe({
      next: (res) => this.summary.set(res.data),
      error: (err) => console.error('Failed to load analytics summary', err)
    });
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  logout() {
    this.authService.logout();
  }
}
