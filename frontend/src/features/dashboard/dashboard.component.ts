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
    <div class="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      <!-- Navbar -->
      <nav class="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-500/20">
            D
          </div>
          <div>
            <span class="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-wide text-lg">
              DEVMIND AI
            </span>
            <span class="text-xs block text-slate-400 font-medium">Enterprise Assistant</span>
          </div>
        </div>

        <div class="flex items-center gap-4">
          @if (user(); as u) {
            <div class="flex items-center gap-3">
              @if (u.profilePicture) {
                <img [src]="u.profilePicture" alt="Profile" class="w-9 h-9 rounded-full border border-slate-700 object-cover shadow">
              } @else {
                <div class="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-semibold uppercase">
                  {{ u.firstName.charAt(0) }}{{ u.lastName.charAt(0) }}
                </div>
              }
              <div class="hidden md:block text-left">
                <p class="text-sm font-semibold text-slate-200">{{ u.firstName }} {{ u.lastName }}</p>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {{ u.role }}
                </span>
              </div>
            </div>
          }
          <button (click)="logout()" class="px-4 py-2 text-sm font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl transition duration-200 shadow shadow-black/20">
            Logout
          </button>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col justify-center">
        <!-- Hero Section -->
        <div class="text-center max-w-3xl mx-auto mb-12">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Welcome to the Future of <br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              AI-Powered Engineering
            </span>
          </h1>
          <p class="text-slate-400 text-lg">
            DevMind AI is fully initialized. Build, analyze, test, and document your repositories using cutting-edge standalone developer tools.
          </p>
          <div class="mt-6">
            <a routerLink="/workspace" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/20 transition duration-150">
              Open AI Developer Workspace &rarr;
            </a>
          </div>
        </div>

        <!-- Telemetry Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto w-full mb-8">
          <!-- Card 1 -->
          <div class="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur text-center">
            <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Requests</span>
            <p class="text-2xl font-black text-white mt-1">{{ summary()?.totalRequests || 0 }}</p>
          </div>
          <!-- Card 2 -->
          <div class="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur text-center">
            <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Latency</span>
            <p class="text-2xl font-black text-indigo-400 mt-1">{{ (summary()?.averageLatencyMs || 0) | number:'1.0-0' }}ms</p>
          </div>
          <!-- Card 3 -->
          <div class="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur text-center">
            <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cache Hit Rate</span>
            <p class="text-2xl font-black text-purple-400 mt-1">{{ (summary()?.cacheHitRate || 0) | number:'1.1-1' }}%</p>
          </div>
          <!-- Card 4 -->
          <div class="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur text-center">
            <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Success Rate</span>
            <p class="text-2xl font-black text-emerald-400 mt-1">{{ (summary()?.successRate || 0) | number:'1.1-1' }}%</p>
          </div>
          <!-- Card 5 -->
          <div class="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur text-center col-span-2 md:col-span-1">
            <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Est. Tokens</span>
            <p class="text-2xl font-black text-pink-400 mt-1">{{ summary()?.totalEstimatedTokens || 0 }}</p>
          </div>
        </div>

        <!-- Grouped Telemetry Grids -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full mb-8">
          <!-- Provider Usage -->
          <div class="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur">
            <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              AI Provider Distribution
            </h3>
            <div class="space-y-2">
              @if (summary() && getKeys(summary()?.requestsByProvider).length > 0) {
                @for (key of getKeys(summary()?.requestsByProvider); track key) {
                  <div class="flex items-center justify-between text-xs py-1 border-b border-slate-800/50">
                    <span class="text-slate-400 capitalize">{{ key }}</span>
                    <span class="font-bold text-slate-200">{{ summary()?.requestsByProvider?.[key] || 0 }} requests</span>
                  </div>
                }
              } @else {
                <div class="text-center py-4 text-xs text-slate-600 font-medium">No provider logs found yet.</div>
              }
            </div>
          </div>

          <!-- Tool Usage -->
          <div class="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur">
            <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
              Tool Operations Distribution
            </h3>
            <div class="space-y-2">
              @if (summary() && getKeys(summary()?.requestsByToolType).length > 0) {
                @for (key of getKeys(summary()?.requestsByToolType); track key) {
                  <div class="flex items-center justify-between text-xs py-1 border-b border-slate-800/50">
                    <span class="text-slate-400 capitalize">{{ key.replace('_', ' ') }}</span>
                    <span class="font-bold text-slate-200">{{ summary()?.requestsByToolType?.[key] || 0 }} requests</span>
                  </div>
                }
              } @else {
                <div class="text-center py-4 text-xs text-slate-600 font-medium">No operations logs found yet.</div>
              }
            </div>
          </div>
        </div>

        <!-- Tool Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          <!-- Card 1 -->
          <div class="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur hover:border-indigo-500/50 transition duration-300 group hover:-translate-y-1">
            <div class="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300">
              <span class="text-indigo-400 font-bold text-lg">&lt;/&gt;</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Code Generator</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              Generate structured, modular, and optimized programs matching specific requirements with Monaco Editor support.
            </p>
          </div>

          <!-- Card 2 -->
          <div class="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur hover:border-purple-500/50 transition duration-300 group hover:-translate-y-1">
            <div class="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300">
              <span class="text-purple-400 font-bold text-lg">&#x2713;</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Code Analysis & Review</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              Detect bugs, analyze syntax issues, optimize security, and review logic flows dynamically using advanced model reasoning.
            </p>
          </div>

          <!-- Card 3 -->
          <div class="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur hover:border-pink-500/50 transition duration-300 group hover:-translate-y-1">
            <div class="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300">
              <span class="text-pink-400 font-bold text-lg">&#x1F4D8;</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Documentation & Tests</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              Instantly draft documentation wikis, README pages, and generate unit testing suites in Java, TS, and Python.
            </p>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="border-t border-slate-900 bg-slate-950 px-6 py-6 text-center text-xs text-slate-500">
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
