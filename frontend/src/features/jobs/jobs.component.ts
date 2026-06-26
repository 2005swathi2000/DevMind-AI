import { Component, inject, OnInit, OnDestroy, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { JobsService, JobResponse } from '../../core/services/jobs.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, MonacoEditorModule, RouterLink],
  template: `
    <div class="flex flex-col h-screen bg-brand-bg text-brand-text font-sans overflow-hidden">
      <!-- Glow background accents -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-brand-primary/5 blur-[120px]"></div>
        <div class="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-brand-surface/20 blur-[120px]"></div>
      </div>

      <!-- Navbar -->
      <nav class="border-b border-brand-border bg-brand-bg/80 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between z-10 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-secondary to-brand-highlight flex items-center justify-center font-bold text-white text-lg shadow-low transition duration-300 hover:scale-105">
            D
          </div>
          <div>
            <span class="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-highlight tracking-wide text-base block font-title">
              DEVMIND AI
            </span>
            <span class="text-[10px] block text-brand-textMuted font-semibold uppercase tracking-wider">Asynchronous Worker Console</span>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <a routerLink="/workspace" class="text-sm font-semibold text-brand-textMuted hover:text-brand-highlight transition duration-150">
            Workspace
          </a>
          <a routerLink="/dashboard" class="text-sm font-semibold text-brand-textMuted hover:text-brand-highlight transition duration-150">
            Dashboard
          </a>
          <div class="h-4 w-px bg-brand-border"></div>
          @if (user(); as u) {
            <div class="flex items-center gap-3">
              @if (u.profilePicture) {
                <img [src]="u.profilePicture" alt="Profile" class="w-7 h-7 rounded-full object-cover">
              } @else {
                <div class="w-7 h-7 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-brand-highlight text-xs font-semibold uppercase">
                  {{ u.firstName.charAt(0) }}{{ u.lastName.charAt(0) }}
                </div>
              }
              <span class="text-sm text-white font-bold hidden md:inline">{{ u.firstName }}</span>
            </div>
          }
        </div>
      </nav>

      <!-- Main Layout Grid -->
      <div class="flex-1 flex overflow-hidden z-10">
        
        <!-- Sidebar: Job List -->
        <aside class="w-80 border-r border-brand-border bg-brand-primary text-white flex flex-col overflow-hidden shrink-0">
          <div class="p-4 border-b border-brand-primaryHover flex items-center justify-between shrink-0">
            <div>
              <h2 class="text-xs font-bold text-white uppercase tracking-wider font-title">Background Jobs</h2>
              <span class="text-[10px] text-white/60 font-semibold uppercase">Auto-polling every 3s</span>
            </div>
            <button (click)="loadJobs()" class="text-xs font-bold text-white/80 hover:text-white transition duration-150">
              Refresh
            </button>
          </div>

          <!-- Job List Container -->
          <div class="flex-1 overflow-y-auto p-3 space-y-2.5">
            @if (jobsList().length === 0) {
              <div class="flex flex-col items-center justify-center py-16 text-center text-white/50">
                <span class="text-2xl mb-2">⚙️</span>
                <span class="text-xs font-bold uppercase tracking-wider">No background jobs</span>
                <span class="text-[10px] mt-1 text-white/40 max-w-[180px] leading-relaxed">Your background AI operations will show up here.</span>
              </div>
            }

            @for (job of jobsList(); track job.id) {
              <div (click)="selectJob(job)"
                   [class]="activeJobId() === job.id ? 'border-brand-highlight bg-white/10' : 'border-brand-primaryHover bg-brand-primaryHover/20 hover:bg-brand-primaryHover/40'"
                   class="group p-3.5 rounded-xl border flex flex-col gap-2 relative cursor-pointer transition duration-200">
                
                <div class="flex items-start justify-between gap-2">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-bold text-white uppercase tracking-wide">
                      {{ formatToolLabel(job.toolType) }}
                    </span>
                    <span class="text-[10px] text-white/70 font-semibold capitalize">
                      {{ job.provider }} &bull; {{ job.language }}
                    </span>
                  </div>
                  
                  <!-- Status Badge -->
                  <span [class]="getStatusClass(job.status)"
                        class="text-[9px] font-bold px-2 py-0.5 rounded-full border">
                    {{ job.status }}
                  </span>
                </div>

                <div class="flex items-center justify-between text-[9px] text-white/60 font-semibold">
                  <span>{{ job.createdAt | date:'short' }}</span>
                  <div class="flex items-center gap-2">
                    @if (job.retryCount > 0) {
                      <span class="text-amber-300 font-bold animate-pulse">Retries: {{ job.retryCount }}</span>
                    }
                    
                    <!-- Action Overlay -->
                    @if (job.status === 'QUEUED' || job.status === 'RUNNING') {
                      <button (click)="cancelJob($event, job.id)"
                              class="text-rose-300 hover:text-rose-200 font-bold hover:underline">
                        Cancel
                      </button>
                    } @else {
                      <button (click)="deleteJob($event, job.id)"
                              class="opacity-0 group-hover:opacity-100 text-white/85 hover:text-rose-300 font-bold hover:underline transition duration-150">
                        Delete
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </aside>

        <!-- Right Panel: Result & Details -->
        <main class="flex-1 flex flex-col overflow-hidden bg-brand-bg">
          @if (!selectedJob()) {
            <div class="flex-1 flex flex-col items-center justify-center text-center p-8 text-brand-textMuted">
              <div class="w-16 h-16 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center text-3xl shadow-medium mb-4 transition duration-300 hover:scale-105">
                ⚙️
              </div>
              <h3 class="text-sm font-bold text-white uppercase tracking-wider font-title">No Job Selected</h3>
              <p class="text-xs text-brand-textMuted max-w-sm mt-1.5 leading-relaxed">
                Select a background task from the list on the left to monitor progress, view retry diagnostics, or read completed AI analysis reports.
              </p>
            </div>
          } @else {
            @if (selectedJob(); as job) {
              <!-- Job Header Panel -->
              <div class="px-6 py-4 bg-brand-surface border-b border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-3">
                    <h2 class="text-sm font-bold text-white uppercase tracking-wider font-title">
                      {{ formatToolLabel(job.toolType) }}
                    </h2>
                    <span [class]="getStatusClass(job.status)" class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase">
                      {{ job.status }}
                    </span>
                  </div>
                  <span class="text-xs text-brand-textMuted">
                    ID: <strong class="text-brand-highlight font-mono font-normal">{{ job.id }}</strong> &bull; Submitted by <strong class="text-white">{{ user()?.firstName }}</strong>
                  </span>
                </div>

                <div class="flex items-center gap-3">
                  @if (job.status === 'COMPLETED') {
                    <button (click)="copyResponse()" class="btn-secondary px-3.5 py-1.5 text-xs">
                      Copy Response
                    </button>
                    <select (change)="exportResponse($event)"
                            class="bg-brand-editorBg border border-brand-border text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-accent text-white">
                      <option value="">Export</option>
                      <option value="md">Markdown (.md)</option>
                      <option value="txt">Plain Text (.txt)</option>
                    </select>
                  }
                  @if (job.status === 'QUEUED' || job.status === 'RUNNING') {
                    <button (click)="cancelJob($event, job.id)" class="px-4 py-1.5 text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition duration-150">
                      Cancel Job
                    </button>
                  }
                </div>
              </div>

              <!-- Metadata Summary Row -->
              <div class="px-6 py-3 bg-brand-surface/60 border-b border-brand-border flex flex-wrap gap-x-8 gap-y-2 text-xs font-bold text-brand-textMuted shrink-0">
                <span>Provider: <strong class="text-white capitalize">{{ job.provider }}</strong></span>
                <span>Language: <strong class="text-white capitalize">{{ job.language }}</strong></span>
                <span>Queued: <strong class="text-white">{{ job.createdAt | date:'mediumTime' }}</strong></span>
                @if (job.startedAt) {
                  <span>Started: <strong class="text-white">{{ job.startedAt | date:'mediumTime' }}</strong></span>
                }
                @if (job.completedAt) {
                  <span>Ended: <strong class="text-white">{{ job.completedAt | date:'mediumTime' }}</strong></span>
                }
                @if (job.startedAt && job.completedAt) {
                  <span>Execution: <strong class="text-brand-highlight">{{ calculateDuration(job.startedAt, job.completedAt) }}s</strong></span>
                }
                @if (job.retryCount > 0) {
                  <span class="text-amber-400">Attempts: <strong>{{ job.retryCount + 1 }}</strong></span>
                }
              </div>

              <!-- Content Split Panels -->
              <div class="flex-1 flex overflow-hidden">
                
                <!-- Left half: Input Code -->
                <div class="w-1/2 flex flex-col border-r border-brand-border bg-brand-bg">
                  <div class="px-4 py-2 bg-brand-surface border-b border-brand-border shrink-0">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-brand-textMuted">Code Submitted</span>
                  </div>
                  <div class="flex-1 bg-brand-editorBg">
                    <ngx-monaco-editor [options]="editorOptions" [ngModel]="job.inputCode" (init)="onEditorInit($event, job.language)" class="h-full w-full"></ngx-monaco-editor>
                  </div>
                </div>

                <!-- Right half: AI Report -->
                <div class="w-1/2 flex flex-col bg-brand-bg">
                  <div class="px-4 py-2 bg-brand-surface border-b border-brand-border shrink-0">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-brand-textMuted">Analysis Output</span>
                  </div>
                  <div class="flex-1 overflow-y-auto p-6 bg-brand-editorBg border-l-[6px] border-brand-accent relative">
                    <!-- Loading / Error States -->
                    @if (job.status === 'QUEUED') {
                      <div class="flex flex-col items-center justify-center h-full text-center text-brand-textMuted">
                        <div class="w-8 h-8 rounded-full border-2 border-brand-accent/20 border-t-brand-accent animate-spin mb-3"></div>
                        <span class="text-xs font-bold uppercase tracking-wider">Awaiting worker thread...</span>
                      </div>
                    } @else if (job.status === 'RUNNING') {
                      <div class="flex flex-col items-center justify-center h-full text-center text-brand-textMuted">
                        <div class="w-8 h-8 rounded-full border-2 border-brand-accent/20 border-t-brand-accent animate-spin mb-3"></div>
                        <span class="text-xs font-bold uppercase tracking-wider text-brand-highlight">AI analysis is in progress...</span>
                        <span class="text-[10px] text-brand-textMuted/70 block mt-1">This may take up to 2 minutes depending on code size.</span>
                      </div>
                    } @else if (job.status === 'CANCELLED') {
                      <div class="flex flex-col items-center justify-center h-full text-center text-brand-textMuted p-6">
                        <span class="text-3xl mb-2">⏹️</span>
                        <h4 class="text-xs font-bold uppercase text-brand-textMuted/70">Job Cancelled</h4>
                        <p class="text-xs text-brand-textMuted max-w-xs mt-1">
                          This job was aborted by user request before execution could complete.
                        </p>
                      </div>
                    } @else if (job.status === 'FAILED') {
                      <div class="flex flex-col items-center justify-center h-full text-center text-brand-textMuted p-6">
                        <span class="text-3xl mb-2">⚠️</span>
                        <h4 class="text-xs font-bold uppercase text-rose-400">Execution Failed</h4>
                        <p class="text-xs text-rose-300 max-w-xs mt-2 bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 font-mono text-left break-words">
                          {{ job.errorMessage || 'Unknown provider error occurred during analysis.' }}
                        </p>
                      </div>
                    } @else {
                      <!-- Completed output -->
                      <div class="prose prose-slate text-sm max-w-none text-brand-text leading-relaxed break-words animate-fadeIn"
                           [innerHTML]="renderedMarkdown()">
                      </div>
                    }
                  </div>
                </div>

              </div>
            }
          }
        </main>
      </div>
    </div>
  `
})
export class JobsComponent implements OnInit, OnDestroy {
  private jobsService = inject(JobsService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  user = this.authService.currentUserSignal;
  jobsList = signal<JobResponse[]>([]);
  selectedJob = signal<JobResponse | null>(null);
  activeJobId = signal<string | null>(null);

  private pollIntervalId: any = null;

  editorOptions = {
    theme: 'devmind-dark',
    readOnly: true,
    fontSize: 14,
    minimap: { enabled: false },
    wordWrap: 'on',
    automaticLayout: true
  };

  renderedMarkdown = computed(() => {
    const job = this.selectedJob();
    return job && job.response ? this.parseMarkdown(job.response) : '';
  });

  ngOnInit() {
    this.loadJobs(true);
    // Setup background polling interval every 3 seconds
    this.pollIntervalId = setInterval(() => {
      this.loadJobs(false);
    }, 3000);
  }

  ngOnDestroy() {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
    }
  }

  loadJobs(showToast = false) {
    this.jobsService.getJobs().subscribe({
      next: (res) => {
        this.jobsList.set(res.data);
        if (showToast) {
          this.toastr.success('Jobs fetched successfully', 'Success');
        }
        // Update active job reference if currently open
        const activeId = this.activeJobId();
        if (activeId) {
          const fresh = res.data.find(j => j.id === activeId);
          if (fresh) {
            this.selectedJob.set(fresh);
          }
        }
      },
      error: () => {
        if (showToast) {
          this.toastr.error('Failed to load jobs list', 'Error');
        }
      }
    });
  }

  selectJob(job: JobResponse) {
    this.selectedJob.set(job);
    this.activeJobId.set(job.id);
  }

  onEditorInit(editor: any, language: string) {
    const monaco = (window as any).monaco;
    if (monaco) {
      monaco.editor.defineTheme('devmind-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#1E1E2E',
          'editorLineNumber.foreground': '#5C5C7A',
          'editorLineNumber.activeForeground': '#D552A3',
          'editor.lineHighlightBackground': '#2D2B3F',
          'editor.selectionBackground': '#462C7D4D',
          'editorCursor.foreground': '#FF70BF'
        }
      });
      monaco.editor.setTheme('devmind-dark');
    }
    const model = editor.getModel();
    if (model) {
      editor.setModelLanguage(model, language.toLowerCase());
    }
  }

  cancelJob(event: Event, id: string) {
    event.stopPropagation();
    this.jobsService.cancelOrDeleteJob(id).subscribe({
      next: () => {
        this.toastr.info('Job cancelled successfully.', 'Info');
        this.loadJobs(false);
      },
      error: (err) => this.toastr.error(err.error?.message || 'Failed to cancel job', 'Error')
    });
  }

  deleteJob(event: Event, id: string) {
    event.stopPropagation();
    this.jobsService.cancelOrDeleteJob(id).subscribe({
      next: () => {
        this.toastr.success('Job deleted successfully.', 'Success');
        if (this.activeJobId() === id) {
          this.selectedJob.set(null);
          this.activeJobId.set(null);
        }
        this.loadJobs(false);
      },
      error: (err) => this.toastr.error(err.error?.message || 'Failed to delete job', 'Error')
    });
  }

  formatToolLabel(val: string): string {
    return val.replace(/_/g, ' ');
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

  calculateDuration(start: string, end: string): string {
    try {
      const diff = new Date(end).getTime() - new Date(start).getTime();
      return (diff / 1000).toFixed(1);
    } catch {
      return '0';
    }
  }

  copyResponse() {
    const job = this.selectedJob();
    if (job && job.response) {
      navigator.clipboard.writeText(job.response);
      this.toastr.success('Response copied to clipboard!', 'Success');
    }
  }

  exportResponse(event: Event) {
    const format = (event.target as HTMLSelectElement).value;
    const job = this.selectedJob();
    if (!format || !job || !job.response) return;

    const data = job.response;
    let filename = `devmind-job-${job.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}`;
    let mimeType = 'text/plain';

    if (format === 'md') {
      filename += '.md';
      mimeType = 'text/markdown';
    } else if (format === 'txt') {
      filename += '.txt';
    }

    const blob = new Blob([data], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Reset selector
    (event.target as HTMLSelectElement).value = '';
  }

  parseMarkdown(text: string): string {
    if (!text) return '';
    let html = text;

    // XML safe escapes
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks: ```lang ... ```
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    html = html.replace(codeBlockRegex, (match, lang, codeCode) => {
      const cleanCode = codeCode.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      return `<div class="my-4 rounded-xl border border-brand-border overflow-hidden bg-brand-bg font-mono text-sm">
        <div class="bg-brand-surface/40 px-4 py-2 border-b border-brand-border flex justify-between items-center text-xs text-brand-text font-bold">
          <span>${lang || 'code'}</span>
          <button onclick="navigator.clipboard.writeText(\`${cleanCode}\`)" class="hover:text-brand-highlight transition duration-150 font-bold bg-brand-editorBg hover:bg-brand-surface/20 px-2 py-0.5 rounded border border-brand-border text-brand-text">Copy</button>
        </div>
        <pre class="p-4 overflow-x-auto text-indigo-300 bg-brand-editorBg"><code>${codeCode}</code></pre>
      </div>`;
    });

    // Inline code: `code`
    html = html.replace(/`([^`]+)`/g, '<code class="bg-brand-surface/20 border border-brand-border text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs font-bold">$1</code>');

    // Headers
    html = html.replace(/^\s*###\s+(.+)$/gm, '<h3 class="text-sm font-bold text-indigo-400 mt-4 mb-2 uppercase tracking-wide border-b border-brand-border pb-1">$1</h3>');
    html = html.replace(/^\s*##\s+(.+)$/gm, '<h2 class="text-base font-bold text-indigo-300 mt-5 mb-2.5">$1</h2>');
    html = html.replace(/^\s*#\s+(.+)$/gm, '<h1 class="text-lg font-extrabold text-brand-text mt-6 mb-3 border-b border-brand-border pb-1.5">$1</h1>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-brand-text">$1</strong>');

    // Bullet Lists
    html = html.replace(/^\s*-\s+(.+)$/gm, '<li class="ml-4 list-disc text-brand-text/90 my-1 font-semibold">$1</li>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
  }
}
