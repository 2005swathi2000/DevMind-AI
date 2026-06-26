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
    <div class="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <!-- Glow background accents -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
        <div class="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-purple-500/5 blur-[120px]"></div>
      </div>

      <!-- Navbar -->
      <nav class="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between z-10 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-lg shadow shadow-indigo-500/20">
            D
          </div>
          <div>
            <span class="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-wide text-base">
              DEVMIND AI
            </span>
            <span class="text-[10px] block text-slate-400 font-medium">Asynchronous Worker Console</span>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <a routerLink="/workspace" class="text-sm font-semibold text-slate-400 hover:text-white transition duration-150">
            Workspace
          </a>
          <a routerLink="/dashboard" class="text-sm font-semibold text-slate-400 hover:text-white transition duration-150">
            Dashboard
          </a>
          <div class="h-4 w-px bg-slate-800"></div>
          @if (user(); as u) {
            <div class="flex items-center gap-3">
              @if (u.profilePicture) {
                <img [src]="u.profilePicture" alt="Profile" class="w-7 h-7 rounded-full object-cover">
              } @else {
                <div class="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 text-xs font-semibold uppercase">
                  {{ u.firstName.charAt(0) }}{{ u.lastName.charAt(0) }}
                </div>
              }
              <span class="text-sm text-slate-300 font-medium hidden md:inline">{{ u.firstName }}</span>
            </div>
          }
        </div>
      </nav>

      <!-- Main Layout Grid -->
      <div class="flex-1 flex overflow-hidden z-10">
        
        <!-- Sidebar: Job List -->
        <aside class="w-80 border-r border-slate-900 bg-slate-950/40 flex flex-col overflow-hidden shrink-0">
          <div class="p-4 border-b border-slate-900 flex items-center justify-between shrink-0">
            <div>
              <h2 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Background Jobs</h2>
              <span class="text-[10px] text-slate-500 font-semibold uppercase">Auto-polling every 3s</span>
            </div>
            <button (click)="loadJobs()" class="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition duration-150">
              Refresh
            </button>
          </div>

          <!-- Job List Container -->
          <div class="flex-1 overflow-y-auto p-3 space-y-2.5">
            @if (jobsList().length === 0) {
              <div class="text-center py-12 text-xs text-slate-600 font-semibold">
                No background jobs found.
              </div>
            }

            @for (job of jobsList(); track job.id) {
              <div (click)="selectJob(job)"
                   [class]="activeJobId() === job.id ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-slate-900 bg-slate-900/10 hover:bg-slate-900/40'"
                   class="group p-3.5 rounded-xl border flex flex-col gap-2 relative cursor-pointer transition duration-200">
                
                <div class="flex items-start justify-between gap-2">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-bold text-slate-200 uppercase tracking-wide">
                      {{ formatToolLabel(job.toolType) }}
                    </span>
                    <span class="text-[10px] text-slate-400 font-medium capitalize">
                      {{ job.provider }} &bull; {{ job.language }}
                    </span>
                  </div>
                  
                  <!-- Status Badge -->
                  <span [class]="getStatusClass(job.status)"
                        class="text-[9px] font-bold px-2 py-0.5 rounded-full border">
                    {{ job.status }}
                  </span>
                </div>

                <div class="flex items-center justify-between text-[9px] text-slate-500 font-semibold">
                  <span>{{ job.createdAt | date:'short' }}</span>
                  <div class="flex items-center gap-2">
                    @if (job.retryCount > 0) {
                      <span class="text-amber-500 font-bold">Retries: {{ job.retryCount }}</span>
                    }
                    
                    <!-- Action Overlay -->
                    @if (job.status === 'QUEUED' || job.status === 'RUNNING') {
                      <button (click)="cancelJob($event, job.id)"
                              class="text-rose-400 hover:text-rose-300 font-bold hover:underline">
                        Cancel
                      </button>
                    } @else {
                      <button (click)="deleteJob($event, job.id)"
                              class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 font-bold hover:underline transition duration-150">
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
        <main class="flex-1 flex flex-col overflow-hidden bg-slate-950">
          @if (!selectedJob()) {
            <div class="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-600">
              <div class="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/5 mb-4">
                ⚙️
              </div>
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">No Job Selected</h3>
              <p class="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                Select a background task from the list on the left to monitor progress, view retry diagnostics, or read completed AI analysis reports.
              </p>
            </div>
          } @else {
            @if (selectedJob(); as job) {
              <!-- Job Header Panel -->
              <div class="px-6 py-4 bg-slate-950/60 border-b border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-3">
                    <h2 class="text-sm font-bold text-white uppercase tracking-wider">
                      {{ formatToolLabel(job.toolType) }}
                    </h2>
                    <span [class]="getStatusClass(job.status)" class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase">
                      {{ job.status }}
                    </span>
                  </div>
                  <span class="text-xs text-slate-400">
                    ID: <strong class="text-indigo-400 font-mono font-normal">{{ job.id }}</strong> &bull; Submitted by <strong>{{ user()?.firstName }}</strong>
                  </span>
                </div>

                <div class="flex items-center gap-3">
                  @if (job.status === 'COMPLETED') {
                    <button (click)="copyResponse()" class="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition duration-150">
                      Copy Response
                    </button>
                    <select (change)="exportResponse($event)"
                            class="bg-slate-900 border border-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none">
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
              <div class="px-6 py-3 bg-slate-900/10 border-b border-slate-900 flex flex-wrap gap-x-8 gap-y-2 text-xs font-medium text-slate-400 shrink-0">
                <span>Provider: <strong class="text-slate-200 capitalize">{{ job.provider }}</strong></span>
                <span>Language: <strong class="text-slate-200 capitalize">{{ job.language }}</strong></span>
                <span>Queued: <strong class="text-slate-200">{{ job.createdAt | date:'mediumTime' }}</strong></span>
                @if (job.startedAt) {
                  <span>Started: <strong class="text-slate-200">{{ job.startedAt | date:'mediumTime' }}</strong></span>
                }
                @if (job.completedAt) {
                  <span>Ended: <strong class="text-slate-200">{{ job.completedAt | date:'mediumTime' }}</strong></span>
                }
                @if (job.startedAt && job.completedAt) {
                  <span>Execution: <strong class="text-indigo-400">{{ calculateDuration(job.startedAt, job.completedAt) }}s</strong></span>
                }
                @if (job.retryCount > 0) {
                  <span class="text-amber-400">Attempts: <strong>{{ job.retryCount + 1 }}</strong></span>
                }
              </div>

              <!-- Content Split Panels -->
              <div class="flex-1 flex overflow-hidden">
                
                <!-- Left half: Input Code -->
                <div class="w-1/2 flex flex-col border-r border-slate-900">
                  <div class="px-4 py-2 bg-slate-950/60 border-b border-slate-900 shrink-0">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Code Submitted</span>
                  </div>
                  <div class="flex-1 bg-slate-950">
                    <ngx-monaco-editor [options]="editorOptions" [ngModel]="job.inputCode" (init)="onEditorInit($event, job.language)" class="h-full w-full"></ngx-monaco-editor>
                  </div>
                </div>

                <!-- Right half: AI Report -->
                <div class="w-1/2 flex flex-col">
                  <div class="px-4 py-2 bg-slate-950/60 border-b border-slate-900 shrink-0">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Analysis Output</span>
                  </div>
                  <div class="flex-1 overflow-y-auto p-6 bg-slate-950/40 relative">
                    <!-- Loading / Error States -->
                    @if (job.status === 'QUEUED') {
                      <div class="flex flex-col items-center justify-center h-full text-center text-slate-500">
                        <div class="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-3"></div>
                        <span class="text-xs font-semibold uppercase tracking-wider">Awaiting worker thread...</span>
                      </div>
                    } @else if (job.status === 'RUNNING') {
                      <div class="flex flex-col items-center justify-center h-full text-center text-slate-500">
                        <div class="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-3"></div>
                        <span class="text-xs font-semibold uppercase tracking-wider text-indigo-400">AI analysis is in progress...</span>
                        <span class="text-[10px] text-slate-600 block mt-1">This may take up to 2 minutes depending on code size.</span>
                      </div>
                    } @else if (job.status === 'CANCELLED') {
                      <div class="flex flex-col items-center justify-center h-full text-center text-slate-500 p-6">
                        <span class="text-3xl mb-2">⏹️</span>
                        <h4 class="text-xs font-bold uppercase text-slate-400">Job Cancelled</h4>
                        <p class="text-xs text-slate-600 max-w-xs mt-1">
                          This job was aborted by user request before execution could complete.
                        </p>
                      </div>
                    } @else if (job.status === 'FAILED') {
                      <div class="flex flex-col items-center justify-center h-full text-center text-slate-500 p-6">
                        <span class="text-3xl mb-2">⚠️</span>
                        <h4 class="text-xs font-bold uppercase text-rose-500">Execution Failed</h4>
                        <p class="text-xs text-slate-400 max-w-xs mt-2 bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 font-mono text-left break-words">
                          {{ job.errorMessage || 'Unknown provider error occurred during analysis.' }}
                        </p>
                      </div>
                    } @else {
                      <!-- Completed output -->
                      <div class="prose prose-invert prose-slate text-sm max-w-none text-slate-300 leading-relaxed break-words"
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
    theme: 'vs-dark',
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
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'RUNNING':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 animate-pulse';
      case 'COMPLETED':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'FAILED':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'CANCELLED':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
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
      return `<div class="my-4 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 font-mono text-sm">
        <div class="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>${lang || 'code'}</span>
          <button onclick="navigator.clipboard.writeText(\`${cleanCode}\`)" class="hover:text-white transition duration-150 font-semibold bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700">Copy</button>
        </div>
        <pre class="p-4 overflow-x-auto text-indigo-300"><code>${codeCode}</code></pre>
      </div>`;
    });

    // Inline code: `code`
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-900/60 border border-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs font-medium">$1</code>');

    // Headers
    html = html.replace(/^\s*###\s+(.+)$/gm, '<h3 class="text-sm font-bold text-indigo-400 mt-4 mb-2 uppercase tracking-wide border-b border-slate-900/50 pb-1">$1</h3>');
    html = html.replace(/^\s*##\s+(.+)$/gm, '<h2 class="text-base font-bold text-indigo-300 mt-5 mb-2.5">$1</h2>');
    html = html.replace(/^\s*#\s+(.+)$/gm, '<h1 class="text-lg font-extrabold text-white mt-6 mb-3 border-b border-slate-800 pb-1.5">$1</h1>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-200">$1</strong>');

    // Bullet Lists
    html = html.replace(/^\s*-\s+(.+)$/gm, '<li class="ml-4 list-disc text-slate-300 my-1 font-medium">$1</li>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
  }
}
