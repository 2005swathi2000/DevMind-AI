import { Component, inject, OnInit, HostListener, signal, computed, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommandPaletteService } from '../../../core/services/command-palette.service';
import { WorkspaceService, WorkspaceSessionResponse } from '../../../core/services/workspace.service';
import { JobsService, JobResponse } from '../../../core/services/jobs.service';
import { AuthService } from '../../../core/services/auth.service';
import { AnalyticsService, AnalyticsSummaryResponse } from '../../../core/services/analytics.service';
import { ToastrService } from 'ngx-toastr';

interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Commands' | 'Workspace History' | 'Background Jobs' | 'Prompt Templates' | 'Analytics' | 'Settings' | 'Profile' | 'Recent Files';
  icon: string;
  action: () => void;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-md" (click)="close()"></div>

        <!-- Palette Box -->
        <div class="relative w-full max-w-xl bg-[#130B24]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-slide-up backdrop-blur-xl">
          <!-- Search Header -->
          <div class="p-4 border-b border-white/5 flex items-center gap-3">
            <svg class="w-5 h-5 text-brand-textMuted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input #searchInput type="text" [(ngModel)]="query" (ngModelChange)="onQueryChange()"
                   placeholder="Type a command or search templates, workspaces, jobs..."
                   class="w-full bg-transparent text-sm text-white placeholder-white/35 border-none outline-none focus:ring-0"
                   (keydown.arrowdown)="moveSelection(1)"
                   (keydown.arrowup)="moveSelection(-1)"
                   (keydown.enter)="executeSelected()">
            <span class="text-[10px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase tracking-wide shrink-0">ESC to close</span>
          </div>

          <!-- Items List -->
          <div class="flex-1 overflow-y-auto p-2 space-y-4" #itemsListContainer>
            @if (filteredItems().length === 0) {
              <div class="p-8 text-center text-brand-textMuted text-xs">
                No matching results found for "{{ query }}"
              </div>
            }

            @for (cat of categories(); track cat) {
              @if (getItemsByCategory(cat).length > 0) {
                <div>
                  <h4 class="px-3 py-1.5 text-[9px] font-bold text-brand-highlight uppercase tracking-wider">{{ cat }}</h4>
                  <div class="space-y-0.5">
                    @for (item of getItemsByCategory(cat); track item.id) {
                      <div (click)="runItem(item)"
                           [class]="isSelected(item) ? 'bg-white/10 text-white border-l-2 border-brand-highlight' : 'text-brand-textMuted hover:bg-white/5 hover:text-white'"
                           class="group px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition duration-150 border-l-2 border-transparent">
                        <div class="flex items-center gap-3 min-w-0">
                          <span class="text-sm shrink-0" [innerHTML]="item.icon"></span>
                          <div class="min-w-0">
                            <p class="text-xs font-semibold truncate">{{ item.title }}</p>
                            @if (item.subtitle) {
                              <p class="text-[10px] text-brand-textMuted/60 truncate font-mono mt-0.5">{{ item.subtitle }}</p>
                            }
                          </div>
                        </div>
                        <span class="text-[10px] font-semibold text-white/40 group-hover:text-white/60 transition duration-150">Select &crarr;</span>
                      </div>
                    }
                  </div>
                </div>
              }
            }
          </div>

          <!-- Footer shortcuts legend -->
          <div class="bg-black/40 px-4 py-2 border-t border-white/5 flex items-center justify-between text-[9px] text-brand-textMuted/50 font-bold uppercase tracking-wider shrink-0">
            <span>Use <strong class="text-brand-textMuted/70">&uarr; &darr;</strong> to navigate</span>
            <span>Press <strong class="text-brand-textMuted/70">Enter</strong> to select</span>
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
export class CommandPaletteComponent implements OnInit {
  private paletteService = inject(CommandPaletteService);
  private workspaceService = inject(WorkspaceService);
  private jobsService = inject(JobsService);
  private authService = inject(AuthService);
  private analyticsService = inject(AnalyticsService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('itemsListContainer') itemsListContainer!: ElementRef<HTMLDivElement>;

  isOpen = this.paletteService.isOpen;
  query = '';
  selectedIndex = 0;

  // Cached data lists
  private rawHistoryList = signal<WorkspaceSessionResponse[]>([]);
  private rawJobsList = signal<JobResponse[]>([]);
  private rawAnalytics = signal<AnalyticsSummaryResponse | null>(null);

  // Static commands list
  private staticCommands: PaletteItem[] = [
    {
      id: 'cmd-dashboard',
      title: 'Open Dashboard',
      subtitle: 'Analyze server health and request telemetry',
      category: 'Commands',
      icon: '🏠',
      action: () => this.router.navigate(['/dashboard'])
    },
    {
      id: 'cmd-workspace',
      title: 'Open Developer Workspace',
      subtitle: 'Code and run interactive streaming analysis',
      category: 'Commands',
      icon: '💻',
      action: () => this.router.navigate(['/workspace'])
    },
    {
      id: 'cmd-jobs',
      title: 'View Background Jobs',
      subtitle: 'Track worker queue status and retry analytics',
      category: 'Commands',
      icon: '📂',
      action: () => this.router.navigate(['/jobs'])
    },
    {
      id: 'cmd-review',
      title: 'Analyze: Run Code Review',
      subtitle: 'Examine code logic and design choices',
      category: 'Commands',
      icon: '👁️',
      action: () => {
        this.router.navigate(['/workspace'], { queryParams: { toolType: 'CODE_REVIEW' } });
        this.paletteService.triggerAction('CODE_REVIEW');
      }
    },
    {
      id: 'cmd-bug',
      title: 'Analyze: Detect Security Bugs',
      subtitle: 'Identify potential issues, division errors, and leaks',
      category: 'Commands',
      icon: '🐛',
      action: () => {
        this.router.navigate(['/workspace'], { queryParams: { toolType: 'BUG_FINDER' } });
        this.paletteService.triggerAction('BUG_FINDER');
      }
    },
    {
      id: 'cmd-explain',
      title: 'Analyze: Explain Code Block',
      subtitle: 'Deconstruct complexity and provide walkthroughs',
      category: 'Commands',
      icon: '🧠',
      action: () => {
        this.router.navigate(['/workspace'], { queryParams: { toolType: 'EXPLAIN_CODE' } });
        this.paletteService.triggerAction('EXPLAIN_CODE');
      }
    },
    {
      id: 'cmd-test',
      title: 'Analyze: Generate Unit Tests',
      subtitle: 'Write assertions, mocks, and edge-case covers',
      category: 'Commands',
      icon: '🧪',
      action: () => {
        this.router.navigate(['/workspace'], { queryParams: { toolType: 'UNIT_TEST' } });
        this.paletteService.triggerAction('UNIT_TEST');
      }
    },
    {
      id: 'cmd-doc',
      title: 'Analyze: Generate Documentation',
      subtitle: 'Write professional Javadoc/Docstrings for current script',
      category: 'Commands',
      icon: '📝',
      action: () => {
        this.router.navigate(['/workspace'], { queryParams: { toolType: 'DOCUMENTATION' } });
        this.paletteService.triggerAction('DOCUMENTATION');
      }
    },
    {
      id: 'cmd-complexity',
      title: 'Analyze: Complexity Analyzer',
      subtitle: 'Review Big-O complexity and loop depth constraints',
      category: 'Commands',
      icon: '📊',
      action: () => {
        this.router.navigate(['/workspace'], { queryParams: { toolType: 'COMPLEXITY' } });
        this.paletteService.triggerAction('COMPLEXITY');
      }
    },
    {
      id: 'cmd-commit',
      title: 'Analyze: Generate Commit Message',
      subtitle: 'Produce semantic git message for current buffer changes',
      category: 'Commands',
      icon: '🔀',
      action: () => {
        this.router.navigate(['/workspace'], { queryParams: { toolType: 'COMMIT_GENERATOR' } });
        this.paletteService.triggerAction('COMMIT_GENERATOR');
      }
    },
    {
      id: 'cmd-logout',
      title: 'Log Out Session',
      subtitle: 'Invalidate JWT session tokens and exit',
      category: 'Commands',
      icon: '🚪',
      action: () => this.authService.logout()
    }
  ];

  // Static Prompt Templates matching WorkspaceComponent templates
  private promptTemplates = [
    {
      id: 'tpl-java',
      name: 'Java Review',
      language: 'java',
      tool: 'CODE_REVIEW',
      icon: '☕',
      desc: 'Check integer division edge cases and logic paths.'
    },
    {
      id: 'tpl-spring',
      name: 'Spring Review',
      language: 'java',
      tool: 'BUG_FINDER',
      icon: '🌱',
      desc: 'Scan repository access and potential NoSuchElement exceptions.'
    },
    {
      id: 'tpl-react',
      name: 'React Review',
      language: 'typescript',
      tool: 'EXPLAIN_CODE',
      icon: '⚛️',
      desc: 'Analyze React Hooks dependencies and cleanup functions.'
    },
    {
      id: 'tpl-sql',
      name: 'SQL Review',
      language: 'sql',
      tool: 'COMPLEXITY',
      icon: '🗄️',
      desc: 'Inspect Left Joins index efficiency and ordering paths.'
    },
    {
      id: 'tpl-python',
      name: 'Python Review',
      language: 'python',
      tool: 'UNIT_TEST',
      icon: '🐍',
      desc: 'Generate assertions for recursive Fibonacci algorithms.'
    }
  ];

  // Mock Developer Project files
  private recentFiles = [
    { id: 'file-workspace', name: 'workspace.component.ts', path: '/features/workspace', type: 'TypeScript Component', icon: '📄' },
    { id: 'file-dashboard', name: 'dashboard.component.ts', path: '/features/dashboard', type: 'TypeScript Component', icon: '📊' },
    { id: 'file-jobs', name: 'jobs.component.ts', path: '/features/jobs', type: 'TypeScript Component', icon: '⚙️' },
    { id: 'file-navbar', name: 'navbar.component.ts', path: '/shared/components/navbar', type: 'Navigation Component', icon: '🧭' },
    { id: 'file-styles', name: 'styles.scss', path: '/styles', type: 'Global SCSS StyleSheet', icon: '🎨' },
    { id: 'file-pom', name: 'pom.xml', path: '/backend', type: 'Spring Boot Maven POM config', icon: '☕' }
  ];

  constructor() {
    // Focus search input when opened
    effect(() => {
      if (this.isOpen()) {
        this.query = '';
        this.selectedIndex = 0;
        this.loadHistoryAndJobs();
        setTimeout(() => {
          this.searchInput?.nativeElement?.focus();
        }, 100);
      }
    });
  }

  ngOnInit(): void {}

  private loadHistoryAndJobs(): void {
    if (!this.authService.isAuthenticated()) return;

    this.workspaceService.getHistory().subscribe({
      next: (res) => this.rawHistoryList.set(res.data || []),
      error: () => {}
    });

    this.jobsService.getJobs().subscribe({
      next: (res) => this.rawJobsList.set(res.data || []),
      error: () => {}
    });

    this.analyticsService.getSummary().subscribe({
      next: (res) => this.rawAnalytics.set(res.data || null),
      error: () => {}
    });
  }

  // Hotkey handlers
  @HostListener('window:keydown.control.shift.p', ['$event'])
  @HostListener('window:keydown.meta.shift.p', ['$event'])
  onCommandPaletteShortcut(event: KeyboardEvent): void {
    event.preventDefault();
    this.paletteService.toggle();
  }

  @HostListener('window:keydown.control.k', ['$event'])
  @HostListener('window:keydown.meta.k', ['$event'])
  onSearchShortcut(event: KeyboardEvent): void {
    event.preventDefault();
    this.paletteService.toggle();
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.close();
  }

  close(): void {
    this.paletteService.close();
  }

  // Universal Filter Logic
  filteredItems = computed<PaletteItem[]>(() => {
    const q = this.query.trim().toLowerCase();
    const items: PaletteItem[] = [];

    // 1. Add matching commands
    const matchingCmds = this.staticCommands.filter(c => 
      c.title.toLowerCase().includes(q) || (c.subtitle && c.subtitle.toLowerCase().includes(q))
    );
    items.push(...matchingCmds);

    // 2. Add Settings Controls (Dynamic item generators)
    const settingsOptions = [
      { id: 'set-wrap', title: 'Settings: Toggle Editor Word Wrap', subtitle: 'Toggle wrap layouts inside Monaco instance', icon: '🔄', action: 'TOGGLE_WORD_WRAP' },
      { id: 'set-size-inc', title: 'Settings: Increase Font Size (+1)', subtitle: 'Make Monaco editor text larger', icon: '➕', action: 'INCREASE_FONT_SIZE' },
      { id: 'set-size-dec', title: 'Settings: Decrease Font Size (-1)', subtitle: 'Make Monaco editor text smaller', icon: '➖', action: 'DECREASE_FONT_SIZE' },
      { id: 'set-prov-gemini', title: 'Settings: Use Gemini 2.5 Flash Provider', subtitle: 'Switch active LLM query router to Google Gemini API', icon: '✨', action: 'SWITCH_PROVIDER_GEMINI' },
      { id: 'set-prov-openai', title: 'Settings: Use OpenAI GPT-5 Provider (Planned)', subtitle: 'Select OpenAI API endpoints', icon: '🤖', action: 'SWITCH_PROVIDER_OPENAI' },
      { id: 'set-prov-claude', title: 'Settings: Use Claude Sonnet Provider (Planned)', subtitle: 'Select Anthropic API endpoints', icon: '🧠', action: 'SWITCH_PROVIDER_CLAUDE' },
      { id: 'set-theme-brand', title: 'Settings: Set Brand Dark (Purple Space) Theme', subtitle: 'Apply brand colors to editor theme', icon: '🎨', action: 'CHANGE_THEME_BRAND' },
      { id: 'set-theme-dark', title: 'Settings: Set Monaco Default Dark Theme', subtitle: 'Apply default dark theme', icon: '🌑', action: 'CHANGE_THEME_VS_DARK' },
      { id: 'set-theme-light', title: 'Settings: Set Monaco Default Light Theme', subtitle: 'Apply default light theme', icon: '☀️', action: 'CHANGE_THEME_VS' }
    ];
    const matchingSettings = settingsOptions.filter(s => s.title.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q)).map(s => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      category: 'Settings' as const,
      icon: s.icon,
      action: () => {
        this.paletteService.triggerAction(s.action);
        this.toastr.success(`Executed action: ${s.title.replace('Settings: ', '')}`, 'Settings Updated');
      }
    }));
    items.push(...matchingSettings);

    // 3. Add matching workspace sessions
    const matchingHistory = this.rawHistoryList().filter(h =>
      h.title.toLowerCase().includes(q) || h.language.toLowerCase().includes(q) || h.inputCode.toLowerCase().includes(q)
    ).slice(0, 5).map(h => ({
      id: `history-${h.id}`,
      title: h.title,
      subtitle: `Workspace Session (${h.language}) • Pinned: ${h.pinned ? 'Yes' : 'No'}`,
      category: 'Workspace History' as const,
      icon: '📝',
      action: () => this.router.navigate(['/workspace'], { queryParams: { sessionId: h.id } })
    }));
    items.push(...matchingHistory);

    // 4. Add matching background jobs
    const matchingJobs = this.rawJobsList().filter(j =>
      j.id.toLowerCase().includes(q) || j.toolType.toLowerCase().includes(q) || j.status.toLowerCase().includes(q)
    ).slice(0, 5).map(j => ({
      id: `job-${j.id}`,
      title: `${j.toolType.replace(/_/g, ' ')} [${j.status}]`,
      subtitle: `Job ID: ${j.id.slice(0, 8)}... • ${j.provider} • ${j.language}`,
      category: 'Background Jobs' as const,
      icon: '⚙️',
      action: () => this.router.navigate(['/jobs'], { queryParams: { jobId: j.id } })
    }));
    items.push(...matchingJobs);

    // 5. Add Prompt Templates
    const matchingTemplates = this.promptTemplates.filter(t =>
      t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.language.toLowerCase().includes(q)
    ).map(t => ({
      id: t.id,
      title: `Prompt Template: ${t.name}`,
      subtitle: `${t.desc} (${t.language})`,
      category: 'Prompt Templates' as const,
      icon: t.icon,
      action: () => {
        this.router.navigate(['/workspace'], { queryParams: { toolType: t.tool, applyTpl: t.name } });
        // Trigger select template
        this.paletteService.triggerAction(`APPLY_TEMPLATE_${t.name.replace(/ /g, '_').toUpperCase()}`);
      }
    }));
    items.push(...matchingTemplates);

    // 6. Add Analytics Data (display active metrics as searchable items)
    const stats = this.rawAnalytics();
    if (stats) {
      const analyticsItems = [
        { id: 'stat-total', title: `Analytics: Total Analyses Completed (${stats.totalRequests})`, subtitle: 'Overall operations count run on DevMind AI', icon: '📊' },
        { id: 'stat-latency', title: `Analytics: Average Latency (${Math.round(stats.averageLatencyMs)}ms)`, subtitle: 'System prompt-to-response generation speed', icon: '⚡' },
        { id: 'stat-cache', title: `Analytics: Cache Hit Rate (${stats.cacheHitRate.toFixed(1)}%)`, subtitle: 'Percentage of requests served from database cache', icon: '💾' },
        { id: 'stat-success', title: `Analytics: Request Success Rate (${stats.successRate.toFixed(1)}%)`, subtitle: 'Healthy API execution vs failures', icon: '✅' }
      ];
      const matchingAnalytics = analyticsItems.filter(a => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)).map(a => ({
        id: a.id,
        title: a.title,
        subtitle: a.subtitle,
        category: 'Analytics' as const,
        icon: a.icon,
        action: () => this.router.navigate(['/dashboard'])
      }));
      items.push(...matchingAnalytics);
    }

    // 7. Add Profile achievements (calculating levels based on request counts)
    const user = this.authService.currentUserSignal();
    if (user) {
      const totalAnalyses = stats ? stats.totalRequests : 0;
      let level = 'Novice Developer 🥚';
      if (totalAnalyses >= 50) level = 'AI Master 🧠';
      else if (totalAnalyses >= 25) level = 'Power User 💎';
      else if (totalAnalyses >= 10) level = 'AI Practitioner 🔥';
      else if (totalAnalyses >= 1) level = 'First Steps 🐣';

      const profileOptions = [
        { id: 'prof-user', title: `Profile: ${user.firstName} ${user.lastName}`, subtitle: `Role: ${user.role} • Email: ${user.email}`, icon: '👤' },
        { id: 'prof-level', title: `Achievements Level: ${level}`, subtitle: `Calculated from ${totalAnalyses} total analyses completed`, icon: '🏆' }
      ];
      const matchingProfile = profileOptions.filter(p => p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)).map(p => ({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle,
        category: 'Profile' as const,
        icon: p.icon,
        action: () => {
          this.toastr.info(`Achievement Tier: ${level}`, 'Profile Details');
        }
      }));
      items.push(...matchingProfile);
    }

    // 8. Add Recent Files
    const matchingFiles = this.recentFiles.filter(f =>
      f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q)
    ).map(f => ({
      id: f.id,
      title: f.name,
      subtitle: `${f.type} • Path: ${f.path}`,
      category: 'Recent Files' as const,
      icon: f.icon,
      action: () => {
        if (f.path.includes('workspace')) {
          this.router.navigate(['/workspace']);
        } else if (f.path.includes('dashboard')) {
          this.router.navigate(['/dashboard']);
        } else if (f.path.includes('jobs')) {
          this.router.navigate(['/jobs']);
        } else {
          this.router.navigate(['/workspace']);
          this.toastr.info(`Opening file context: ${f.name}`, 'File Loaded');
        }
      }
    }));
    items.push(...matchingFiles);

    return items;
  });

  categories = computed<('Commands' | 'Workspace History' | 'Background Jobs' | 'Prompt Templates' | 'Analytics' | 'Settings' | 'Profile' | 'Recent Files')[]>(() => {
    const activeCats: ('Commands' | 'Workspace History' | 'Background Jobs' | 'Prompt Templates' | 'Analytics' | 'Settings' | 'Profile' | 'Recent Files')[] = [];
    const items = this.filteredItems();
    if (items.some(i => i.category === 'Commands')) activeCats.push('Commands');
    if (items.some(i => i.category === 'Workspace History')) activeCats.push('Workspace History');
    if (items.some(i => i.category === 'Background Jobs')) activeCats.push('Background Jobs');
    if (items.some(i => i.category === 'Prompt Templates')) activeCats.push('Prompt Templates');
    if (items.some(i => i.category === 'Analytics')) activeCats.push('Analytics');
    if (items.some(i => i.category === 'Settings')) activeCats.push('Settings');
    if (items.some(i => i.category === 'Profile')) activeCats.push('Profile');
    if (items.some(i => i.category === 'Recent Files')) activeCats.push('Recent Files');
    return activeCats;
  });

  getItemsByCategory(cat: string): PaletteItem[] {
    return this.filteredItems().filter(i => i.category === cat);
  }

  // Keyboard navigation
  moveSelection(direction: number): void {
    const max = this.filteredItems().length;
    if (max === 0) return;
    this.selectedIndex = (this.selectedIndex + direction + max) % max;
    this.scrollToSelected();
  }

  isSelected(item: PaletteItem): boolean {
    const list = this.filteredItems();
    return list[this.selectedIndex]?.id === item.id;
  }

  executeSelected(): void {
    const list = this.filteredItems();
    const item = list[this.selectedIndex];
    if (item) {
      this.runItem(item);
    }
  }

  runItem(item: PaletteItem): void {
    item.action();
    this.close();
  }

  onQueryChange(): void {
    this.selectedIndex = 0;
  }

  private scrollToSelected(): void {
    setTimeout(() => {
      const container = this.itemsListContainer?.nativeElement;
      if (!container) return;
      const selectedEl = container.querySelector('.border-l-brand-highlight');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    });
  }
}
