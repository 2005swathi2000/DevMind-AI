import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AnalyticsService, AnalyticsSummaryResponse } from '../../core/services/analytics.service';
import { WorkspaceService, WorkspaceSessionResponse } from '../../core/services/workspace.service';
import { JobsService, JobResponse } from '../../core/services/jobs.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe, NavbarComponent],
  template: `
    <div class="flex-1 flex flex-col min-h-screen bg-brand-bg text-brand-text font-sans pb-12 relative overflow-hidden">
      <!-- Glow background accents -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-brand-primary/5 blur-[120px]"></div>
        <div class="absolute bottom-[20%] right-[5%] w-[500px] h-[500px] rounded-full bg-brand-highlight/5 blur-[120px]"></div>
      </div>

      <!-- Shared Header Navbar -->
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <main class="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 flex flex-col animate-fade-in relative z-10">
        
        <!-- Welcome Banner -->
        <div class="glass-panel p-8 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-white/10 shadow-2xl">
          <!-- Aurora inner glow -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div class="absolute -right-[10%] -bottom-[40%] w-[350px] h-[350px] rounded-full bg-brand-highlight/15 blur-[80px]"></div>
            <div class="absolute -left-[10%] -top-[40%] w-[350px] h-[350px] rounded-full bg-brand-secondary/10 blur-[80px]"></div>
          </div>

          <div class="relative z-10 flex-1 text-center md:text-left">
            <h1 class="text-3xl font-extrabold text-white mb-2 font-title flex items-center justify-center md:justify-start gap-2">
              {{ getGreeting() }}, {{ user()?.firstName || 'Developer' }} {{ getGreetingEmoji() }}
            </h1>
            <p class="text-brand-textMuted text-xs sm:text-sm leading-relaxed max-w-xl">
              You have completed <strong class="text-brand-highlight font-bold">{{ summary()?.totalRequests || 0 }}</strong> AI review operations on this workspace. 
              Average response latency is running at <strong class="text-brand-accent font-bold">{{ (summary()?.averageLatencyMs || 0) | number:'1.0-0' }}ms</strong> with an active cache efficiency rate of <strong class="text-brand-highlight font-bold">{{ (summary()?.cacheHitRate || 0) | number:'1.1-1' }}%</strong>.
            </p>
          </div>
          <div class="flex items-center gap-3 shrink-0 relative z-10">
            <a routerLink="/workspace" class="btn-primary shadow-low hover:shadow-medium text-xs py-3 px-5 rounded-xl font-bold flex items-center gap-2 transition duration-200">
              <span>💻</span> Open Developer Workspace
            </a>
          </div>
        </div>

        <!-- Quick Start Actions Grid -->
        <div class="mb-8">
          <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-3.5 font-title flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-highlight animate-pulse"></span>
            ⚡ Quick Start Actions
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @for (action of quickStartActions; track action.label) {
              <a [routerLink]="['/workspace']" [queryParams]="{ toolType: action.toolType }" 
                 class="p-5 rounded-[18px] bg-white/5 border border-white/8 hover:border-brand-highlight hover:bg-white/10 hover:-translate-y-1 transition duration-250 text-center flex flex-col items-center gap-3 cursor-pointer shadow-low hover:shadow-medium group">
                <span class="text-3xl group-hover:scale-110 transition duration-200">{{ action.icon }}</span>
                <span class="text-xs font-bold text-white uppercase tracking-wider">{{ action.label }}</span>
              </a>
            }
          </div>
        </div>

        <!-- Telemetry Summary Cards -->
        <div class="mb-8">
          <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-3.5 font-title flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></span>
            📊 Today's Activity Dashboard
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <!-- Card 1 -->
            <div class="p-5 rounded-[18px] bg-white/5 border border-white/8 text-center hover:border-white/12 hover:bg-white/7 transition duration-200 shadow-low">
              <span class="text-[9px] uppercase font-bold text-brand-textMuted tracking-wider block">Total Requests</span>
              <p class="text-3xl font-black text-white mt-1.5 font-title">{{ summary()?.totalRequests || 0 }}</p>
            </div>
            <!-- Card 2 -->
            <div class="p-5 rounded-[18px] bg-white/5 border border-white/8 text-center hover:border-white/12 hover:bg-white/7 transition duration-200 shadow-low">
              <span class="text-[9px] uppercase font-bold text-brand-textMuted tracking-wider block">Avg Latency</span>
              <p class="text-3xl font-black text-brand-highlight mt-1.5 font-title">{{ (summary()?.averageLatencyMs || 0) | number:'1.0-0' }}ms</p>
            </div>
            <!-- Card 3 -->
            <div class="p-5 rounded-[18px] bg-white/5 border border-white/8 text-center hover:border-white/12 hover:bg-white/7 transition duration-200 shadow-low">
              <span class="text-[9px] uppercase font-bold text-brand-textMuted tracking-wider block">Cache Hit Rate</span>
              <p class="text-3xl font-black text-white mt-1.5 font-title">{{ (summary()?.cacheHitRate || 0) | number:'1.1-1' }}%</p>
            </div>
            <!-- Card 4 -->
            <div class="p-5 rounded-[18px] bg-white/5 border border-white/8 text-center hover:border-white/12 hover:bg-white/7 transition duration-200 shadow-low">
              <span class="text-[9px] uppercase font-bold text-brand-textMuted tracking-wider block">Success Rate</span>
              <p class="text-3xl font-black text-brand-success mt-1.5 font-title">{{ (summary()?.successRate || 0) | number:'1.1-1' }}%</p>
            </div>
            <!-- Card 5 -->
            <div class="p-5 rounded-[18px] bg-white/5 border border-white/8 text-center hover:border-white/12 hover:bg-white/7 transition duration-200 col-span-2 md:col-span-1 shadow-low">
              <span class="text-[9px] uppercase font-bold text-brand-textMuted tracking-wider block">Est. Tokens</span>
              <p class="text-3xl font-black text-white mt-1.5 font-title">{{ summary()?.totalEstimatedTokens || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Weekly Activity & Favorite Tools Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          <!-- Weekly Activity Chart (CSS Bar Chart) -->
          <div class="p-6 rounded-2xl bg-white/5 border border-white/8 shadow-2xl flex flex-col justify-between">
            <div>
              <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 font-title">
                📈 Weekly Activity Trend
              </h3>
              <p class="text-[10px] text-brand-textMuted/60 mb-6 font-semibold uppercase leading-none">AI Operations volume processed over the last 7 days</p>
            </div>

            <!-- Custom CSS Bar Graph -->
            <div class="flex items-end justify-between h-36 px-4 gap-4">
              @for (day of weeklyTrend(); track day.name) {
                <div class="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-help">
                  <div class="relative w-full flex justify-center">
                    <!-- Tooltip value -->
                    <span class="absolute -top-7 bg-[#150D26] border border-white/10 px-2 py-0.5 rounded text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition duration-150 shadow-lg pointer-events-none">
                      {{ day.value }} runs
                    </span>
                    <!-- Bar -->
                    <div class="w-full rounded-t-md transition-all duration-300 group-hover:brightness-110 shadow-lg"
                         [style.height.%]="day.percent"
                         [ngClass]="day.percent > 60 ? 'bg-gradient-to-t from-brand-secondary to-brand-highlight' : 'bg-gradient-to-t from-brand-primary to-brand-accent'">
                    </div>
                  </div>
                  <span class="text-[9px] font-bold text-brand-textMuted/55 uppercase tracking-wide">{{ day.name }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Favorite / Top Tools Distribution -->
          <div class="p-6 rounded-2xl bg-white/5 border border-white/8 shadow-2xl">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 font-title">
              ⭐ Favorite & Top Tools
            </h3>
            <p class="text-[10px] text-brand-textMuted/60 mb-4 font-semibold uppercase leading-none font-sans">Most active helper agents based on workspace requests</p>
            
            <div class="space-y-3">
              @if (topTools().length === 0) {
                <div class="py-8 text-center text-xs text-brand-textMuted/45 border border-dashed border-white/10 rounded-xl">
                  No tools activity recorded. Run analyses to gather telemetry data.
                </div>
              }
              @for (tool of topTools(); track tool.name) {
                <div class="p-3 rounded-xl bg-white/5 border border-white/6 hover:border-brand-highlight/20 transition duration-150 flex items-center justify-between">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="text-xl shrink-0">{{ tool.icon }}</span>
                    <div class="min-w-0">
                      <span class="text-xs font-bold text-white truncate block">{{ tool.displayName }}</span>
                      <span class="text-[9px] text-brand-textMuted/60 uppercase font-semibold">{{ tool.runs }} operations executed</span>
                    </div>
                  </div>
                  <!-- Percentage bar -->
                  <div class="flex items-center gap-3 shrink-0 w-28 sm:w-36">
                    <div class="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div class="bg-brand-highlight h-full rounded-full" [style.width.%]="tool.percentage"></div>
                    </div>
                    <span class="text-[10px] font-bold text-white w-6 text-right">{{ tool.percentage | number:'1.0-0' }}%</span>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>

        <!-- Recents Side-by-Side Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <!-- Recent Workspaces -->
          <div class="p-6 rounded-2xl bg-white/5 border border-white/8 shadow-2xl">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-title">
                📝 Recent Workspace Sessions
              </h3>
              <a routerLink="/workspace" class="text-[10px] font-bold text-brand-highlight hover:underline">Open Workspace &rarr;</a>
            </div>
            <div class="space-y-2.5">
              @if (recentWorkspaces().length === 0) {
                <div class="py-8 text-center text-xs text-brand-textMuted/45 border border-dashed border-white/10 rounded-xl">
                  No saved sessions found. Try analyzing code templates.
                </div>
              }
              @for (item of recentWorkspaces(); track item.id) {
                <a [routerLink]="['/workspace']" [queryParams]="{ sessionId: item.id }"
                   class="block p-3.5 rounded-xl bg-white/5 border border-white/8 hover:border-brand-highlight/30 hover:bg-white/10 transition duration-150 shadow-sm hover:shadow-md">
                  <div class="flex items-center justify-between gap-3">
                    <span class="text-xs font-bold text-white truncate">{{ item.title }}</span>
                    <span class="text-[9px] font-bold text-brand-highlight bg-brand-highlight/10 px-2 py-0.5 rounded-full border border-brand-highlight/20 uppercase tracking-wide shrink-0">
                      {{ item.language }}
                    </span>
                  </div>
                  <p class="text-[10px] text-brand-textMuted/60 truncate font-mono mt-1.5">{{ item.inputCode }}</p>
                </a>
              }
            </div>
          </div>

          <!-- Recent Background Jobs -->
          <div class="p-6 rounded-2xl bg-white/5 border border-white/8 shadow-2xl flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-title">
                  ⚙️ Recent Background Jobs
                </h3>
                <a routerLink="/jobs" class="text-[10px] font-bold text-brand-highlight hover:underline">Open Jobs &rarr;</a>
              </div>
              <div class="space-y-2.5">
                @if (recentJobs().length === 0) {
                  <!-- Rocket Empty State layout -->
                  <div class="py-8 px-4 text-center border border-dashed border-white/10 rounded-xl flex flex-col items-center gap-3">
                    <span class="text-4xl animate-bounce">🚀</span>
                    <h4 class="text-xs font-bold text-white uppercase tracking-wider leading-none">No Background Jobs Yet</h4>
                    <p class="text-[10px] text-brand-textMuted/60 max-w-xs leading-relaxed">Submit code tasks to run asynchronously in the worker queue.</p>
                    <a routerLink="/workspace" class="btn-primary text-[10px] font-bold py-1.5 px-3 rounded-lg mt-1 select-none">Start Analysis</a>
                  </div>
                }
                @for (job of recentJobs(); track job.id) {
                  <a [routerLink]="['/jobs']" [queryParams]="{ jobId: job.id }"
                     class="block p-3.5 rounded-xl bg-white/5 border border-white/8 hover:border-brand-highlight/30 hover:bg-white/10 transition duration-150 shadow-sm hover:shadow-md">
                    <div class="flex items-center justify-between gap-3">
                      <span class="text-xs font-bold text-white uppercase tracking-wide truncate">
                        {{ job.toolType.replace('_', ' ') }}
                      </span>
                      <span [class]="getStatusClass(job.status)" class="text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase">
                        {{ job.status }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between text-[9px] text-brand-textMuted/50 font-bold uppercase mt-2">
                      <span>{{ job.provider }} &bull; {{ job.language }}</span>
                      <span>{{ job.createdAt | date:'shortTime' }}</span>
                    </div>
                  </a>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Grouped Telemetry Grids -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <!-- Provider Usage -->
          <div class="p-6 rounded-[18px] bg-white/5 border border-white/8 shadow-2xl">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 font-title">
              <span class="w-2 h-2 rounded-full bg-brand-highlight animate-pulse"></span>
              AI Provider Distribution
            </h3>
            
            <div class="table-container border border-white/5 bg-black/25 rounded-xl overflow-hidden">
              <table class="table-brand">
                <thead>
                  <tr class="bg-white/5 text-brand-textMuted border-b border-white/5">
                    <th>Model / Provider</th>
                    <th class="text-right">Analyses Run</th>
                  </tr>
                </thead>
                <tbody>
                  @if (summary() && getKeys(summary()?.requestsByProvider).length > 0) {
                    @for (key of getKeys(summary()?.requestsByProvider); track key) {
                      <tr class="border-b border-white/5 bg-transparent hover:bg-white/5 transition duration-150">
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
          <div class="p-6 rounded-[18px] bg-white/5 border border-white/8 shadow-2xl">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 font-title">
              <span class="w-2 h-2 rounded-full bg-brand-highlight animate-pulse"></span>
              Tool Operations Distribution
            </h3>

            <div class="table-container border border-white/5 bg-black/25 rounded-xl overflow-hidden">
              <table class="table-brand">
                <thead>
                  <tr class="bg-white/5 text-brand-textMuted border-b border-white/5">
                    <th>AI Tool Operation</th>
                    <th class="text-right">Total Requests</th>
                  </tr>
                </thead>
                <tbody>
                  @if (summary() && getKeys(summary()?.requestsByToolType).length > 0) {
                    @for (key of getKeys(summary()?.requestsByToolType); track key) {
                      <tr class="border-b border-white/5 bg-transparent hover:bg-white/5 transition duration-150">
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
      </main>

      <!-- Footer -->
      <footer class="border-t border-brand-border bg-white/5 px-6 py-6 text-center text-xs text-brand-textMuted/60 mt-12 shrink-0">
        &copy; 2026 DevMind AI. Enterprise-grade AI Software Engineer Assistant. All rights reserved.
      </footer>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private analyticsService = inject(AnalyticsService);
  private workspaceService = inject(WorkspaceService);
  private jobsService = inject(JobsService);

  user = this.authService.currentUserSignal;
  summary = signal<AnalyticsSummaryResponse | null>(null);
  recentWorkspaces = signal<WorkspaceSessionResponse[]>([]);
  recentJobs = signal<JobResponse[]>([]);

  quickStartActions = [
    { icon: '👁️', label: 'Code Review', toolType: 'CODE_REVIEW' },
    { icon: '🐛', label: 'Bug Finder', toolType: 'BUG_FINDER' },
    { icon: '🧠', label: 'Explain Code', toolType: 'EXPLAIN_CODE' },
    { icon: '🧪', label: 'Unit Tests', toolType: 'UNIT_TEST' }
  ];

  // Helper dictionary to resolve tool type names to display details
  private toolDetails: { [key: string]: { name: string, icon: string } } = {
    'CODE_REVIEW': { name: 'Code Review', icon: '👁️' },
    'BUG_FINDER': { name: 'Bug Finder', icon: '🐛' },
    'EXPLAIN_CODE': { name: 'Explain Code Block', icon: '🧠' },
    'UNIT_TEST': { name: 'Unit Test Generator', icon: '🧪' },
    'DOCUMENTATION': { name: 'Documentation Builder', icon: '📝' },
    'COMPLEXITY': { name: 'Complexity Analyzer', icon: '📊' },
    'COMMIT_GENERATOR': { name: 'Commit Msg Generator', icon: '🔀' }
  };

  // Top Tools computed signal
  topTools = computed(() => {
    const data = this.summary();
    if (!data || !data.requestsByToolType) return [];
    
    const total = data.totalRequests || 1;
    const sorted = Object.entries(data.requestsByToolType)
      .map(([toolType, count]) => {
        const details = this.toolDetails[toolType] || { name: toolType.replace(/_/g, ' '), icon: '⚙️' };
        return {
          name: toolType,
          displayName: details.name,
          icon: details.icon,
          runs: count,
          percentage: (count / total) * 100
        };
      })
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 3); // top 3

    return sorted;
  });

  // Weekly Trend computed signal (shaping CSS Bar Graph height percentages)
  weeklyTrend = computed(() => {
    const total = this.summary()?.totalRequests || 0;
    
    // Generate a structured mock/scaled distribution of active runs across 7 days
    const days = [
      { name: 'Mon', ratio: 0.15 },
      { name: 'Tue', ratio: 0.25 },
      { name: 'Wed', ratio: 0.35 },
      { name: 'Thu', ratio: 0.20 },
      { name: 'Fri', ratio: 0.40 },
      { name: 'Sat', ratio: 0.05 },
      { name: 'Sun', ratio: 0.10 }
    ];

    const maxRatio = Math.max(...days.map(d => d.ratio));

    return days.map(d => {
      // Calculate scaled run values relative to actual totalRequests
      const value = total > 0 ? Math.round(d.ratio * (total * 1.5)) : 0;
      // Calculate percentage height of bar (max is 95%)
      const percent = total > 0 ? (d.ratio / maxRatio) * 95 : 10;
      return {
        name: d.name,
        value,
        percent: Math.max(percent, 8) // minimum 8% height so bar is visible
      };
    });
  });

  ngOnInit() {
    this.analyticsService.getSummary().subscribe({
      next: (res) => this.summary.set(res.data),
      error: (err) => console.error('Failed to load analytics summary', err)
    });

    this.workspaceService.getHistory().subscribe({
      next: (res) => this.recentWorkspaces.set((res.data || []).slice(0, 3)),
      error: () => {}
    });

    this.jobsService.getJobs().subscribe({
      next: (res) => this.recentJobs.set((res.data || []).slice(0, 3)),
      error: () => {}
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  getGreetingEmoji(): string {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️';
    if (hour < 17) return '🌤️';
    return '🌙';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'QUEUED':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'RUNNING':
        return 'text-brand-highlight bg-brand-highlight/10 border-brand-highlight/30 animate-pulse';
      case 'COMPLETED':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'FAILED':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'CANCELLED':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-brand-textMuted bg-white/5 border-white/10';
    }
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
