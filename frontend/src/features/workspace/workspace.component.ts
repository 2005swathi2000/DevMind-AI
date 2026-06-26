import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { WorkspaceService, WorkspaceSessionResponse } from '../../core/services/workspace.service';
import { JobsService } from '../../core/services/jobs.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-workspace',
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
            <span class="text-[10px] block text-brand-textMuted font-semibold uppercase tracking-wider">AI Developer Workspace</span>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <a routerLink="/dashboard" class="text-sm font-semibold text-brand-textMuted hover:text-brand-highlight transition duration-150">
            Dashboard
          </a>
          <a routerLink="/jobs" class="text-sm font-semibold text-brand-textMuted hover:text-brand-highlight transition duration-150">
            Jobs
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

      <!-- Layout Grid -->
      <div class="flex-1 flex overflow-hidden z-10">
        
        <!-- COLUMN 1: Sidebar & History -->
        <aside class="w-72 border-r border-brand-border bg-brand-primary text-white flex flex-col overflow-hidden shrink-0">
          
          <!-- Tool Selection -->
          <div class="p-4 border-b border-brand-primaryHover">
            <label class="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-2">AI Operations</label>
            <div class="space-y-1">
              @for (tool of tools; track tool.value) {
                <button (click)="selectTool(tool.value)"
                        [class]="selectedTool() === tool.value ? 'bg-white/10 text-brand-highlight border-l-2 border-brand-highlight shadow-low' : 'text-white/75 hover:text-white hover:bg-brand-primaryHover'"
                        class="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-between transition duration-200">
                  <span>{{ tool.label }}</span>
                  @if (selectedTool() === tool.value) {
                    <span class="w-1.5 h-1.5 rounded-full bg-brand-highlight animate-pulse"></span>
                  }
                </button>
              }
            </div>
          </div>

          <!-- Quick Templates -->
          <div class="p-4 border-b border-brand-primaryHover">
            <label class="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-2">Quick Templates</label>
            <div class="grid grid-cols-2 gap-2">
              @for (tpl of templates; track tpl.name) {
                <button (click)="applyTemplate(tpl)"
                        class="px-2 py-1.5 rounded-lg border border-brand-primaryHover hover:border-brand-highlight bg-brand-primaryHover/40 hover:bg-brand-primaryHover text-[10px] font-bold text-white/80 hover:text-white text-left truncate transition duration-150">
                  {{ tpl.name }}
                </button>
              }
            </div>
          </div>

          <!-- History List -->
          <div class="flex-1 flex flex-col overflow-hidden">
            <div class="p-4 py-3 border-b border-brand-primaryHover flex items-center justify-between shrink-0">
              <span class="text-[10px] font-bold uppercase tracking-wider text-white/60">History & Saves</span>
              <button (click)="loadHistory()" class="text-[10px] font-bold text-white/80 hover:text-white">Refresh</button>
            </div>
            <div class="flex-1 overflow-y-auto p-3 space-y-2">
              @if (historyList().length === 0) {
                <div class="text-center py-8 text-xs text-white/50 font-medium">No saved sessions.</div>
              }
              @for (item of historyList(); track item.id) {
                <div [class]="activeSessionId() === item.id ? 'border-brand-highlight bg-white/10' : 'border-brand-primaryHover bg-brand-primaryHover/20 hover:bg-brand-primaryHover/40'"
                     class="group p-3 rounded-xl border flex flex-col gap-1.5 transition duration-200 relative cursor-pointer"
                     (click)="loadSession(item)">
                  <div class="flex items-start justify-between gap-2">
                    <span class="text-xs font-bold text-white truncate pr-6">{{ item.title }}</span>
                    <!-- Actions overlay -->
                    <div class="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition duration-150">
                      <button (click)="togglePin($event, item)" class="p-1 rounded bg-brand-primary border border-brand-primaryHover hover:text-white text-white/85">
                        <span class="text-[10px]">{{ item.pinned ? '📌' : '📍' }}</span>
                      </button>
                      <button (click)="toggleFavorite($event, item)" class="p-1 rounded bg-brand-primary border border-brand-primaryHover hover:text-white text-white/85">
                        <span class="text-[10px]">{{ item.favorite ? '⭐' : '☆' }}</span>
                      </button>
                      <button (click)="deleteSession($event, item.id)" class="p-1 rounded bg-brand-primary border border-brand-primaryHover hover:text-rose-400 text-white/85">
                        <span class="text-[10px]">🗑️</span>
                      </button>
                    </div>
                  </div>
                  <div class="flex items-center justify-between text-[9px] text-white/60 font-semibold uppercase">
                    <span>{{ item.language }}</span>
                    <span>{{ item.createdAt | date:'shortTime' }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </aside>

        <!-- COLUMN 2: Monaco Editor -->
        <div class="flex-1 flex flex-col border-r border-brand-border bg-brand-bg">
          
          <!-- Editor Config Panel -->
          <div class="px-4 py-2 bg-brand-surface border-b border-brand-border flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <!-- Language Selector -->
              <select [(ngModel)]="selectedLanguage" (change)="onLanguageChange()"
                      class="bg-brand-editorBg border border-brand-border text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-accent text-white">
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
                <option value="cpp">C++</option>
                <option value="sql">SQL</option>
              </select>

              <!-- Theme Selector -->
              <select [(ngModel)]="selectedTheme" (change)="onThemeChange()"
                      class="bg-brand-editorBg border border-brand-border text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-accent text-white">
                <option value="devmind-dark">Brand Dark Theme</option>
                <option value="vs-dark">Monaco Default Dark</option>
                <option value="vs">Monaco Default Light</option>
              </select>

              <!-- Provider Selector -->
              <select [(ngModel)]="selectedProvider"
                      class="bg-brand-editorBg border border-brand-border text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-accent text-white">
                <option value="gemini">Gemini 2.5 Flash</option>
                <option value="openai">OpenAI GPT-5 (Planned)</option>
                <option value="claude">Claude Sonnet (Planned)</option>
              </select>

              <!-- Word Wrap Toggle -->
              <label class="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" [(ngModel)]="wordWrap" (change)="onWordWrapChange()" class="rounded border-brand-border bg-brand-editorBg text-brand-accent focus:ring-brand-accent">
                <span class="text-[10px] text-brand-textMuted font-semibold uppercase">Wrap</span>
              </label>
            </div>

            <!-- Font Size -->
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-brand-textMuted font-semibold uppercase">Font</span>
              <input type="number" [(ngModel)]="fontSize" (change)="onFontSizeChange()" min="10" max="24"
                     class="w-12 bg-brand-editorBg border border-brand-border text-xs font-bold rounded-lg px-1.5 py-0.5 text-center focus:outline-none focus:border-brand-accent text-white">
            </div>
          </div>

          <!-- Code Editor Instance -->
          <div class="flex-1 relative bg-brand-editorBg">
            <ngx-monaco-editor [options]="editorOptions" [(ngModel)]="code" (init)="onEditorInit($event)" class="h-full w-full"></ngx-monaco-editor>
          </div>

          <!-- Counter Bar & Trigger -->
          <div class="px-4 py-3 bg-brand-surface border-t border-brand-border flex items-center justify-between shrink-0">
            <!-- Metrics -->
            <div class="flex items-center gap-4 text-[10px] text-brand-textMuted font-bold uppercase">
              <span>Chars: <strong class="text-white">{{ charCount() }}</strong></span>
              <span>Lines: <strong class="text-white">{{ lineCount() }}</strong></span>
              <span>Tokens Est: <strong class="text-white">{{ tokenEstimate() }}</strong></span>
            </div>

            <!-- Trigger Actions -->
            <div class="flex items-center gap-2">
              <button (click)="clearEditor()" class="btn-secondary px-3.5 py-1.5 text-xs">
                Clear
              </button>
              @if (isGenerating()) {
                <button (click)="cancelGeneration()" class="px-4 py-1.5 text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition duration-150">
                  Cancel
                </button>
              } @else {
                <button (click)="runAnalysis()" [disabled]="!code.trim()"
                        class="btn-primary px-5 py-1.5 text-xs shadow-low hover:shadow-medium">
                  Run Analysis
                </button>
                <button (click)="runBackground()" [disabled]="!code.trim()"
                        class="btn-secondary px-4 py-1.5 text-xs shadow-low hover:shadow-medium">
                  Run Background
                </button>
              }
            </div>
          </div>
        </div>

        <!-- COLUMN 3: AI Response Streaming Viewer -->
        <div class="w-[500px] flex flex-col bg-brand-bg shrink-0">
          
          <!-- Actions & Header -->
          <div class="px-4 py-2 bg-brand-surface border-b border-brand-border flex items-center justify-between shrink-0">
            <span class="text-xs font-bold text-white">AI Response Engine</span>
            
            <div class="flex items-center gap-2">
              <!-- Auto Scroll Checkbox -->
              <label class="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" [(ngModel)]="autoScroll" class="rounded border-brand-border bg-brand-editorBg text-brand-accent focus:ring-brand-accent">
                <span class="text-[9px] text-brand-textMuted font-bold uppercase">AutoScroll</span>
              </label>

              <!-- Copy response -->
              <button (click)="copyResponse()" [disabled]="!responseStream()" class="p-1 rounded bg-brand-editorBg border border-brand-border hover:text-brand-highlight text-white disabled:opacity-40 text-[10px]" title="Copy to Clipboard">
                📋 Copy
              </button>

              <!-- Export Select -->
              <select (change)="exportResponse($event)" [disabled]="!responseStream()"
                      class="bg-brand-editorBg border border-brand-border text-[10px] font-bold uppercase rounded-lg px-2 py-1 focus:outline-none text-white">
                <option value="">Export</option>
                <option value="md">Markdown (.md)</option>
                <option value="txt">Text (.txt)</option>
              </select>
            </div>
          </div>

          <!-- Output Box -->
          <div class="flex-1 overflow-y-auto p-6 bg-brand-editorBg border-l-[6px] border-brand-accent relative" #scrollContainer>
            @if (!responseStream() && !isGenerating()) {
              <div class="flex flex-col items-center justify-center h-full text-center p-6 text-brand-textMuted">
                <div class="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-xl mb-3 shadow-low">
                  ✨
                </div>
                <h4 class="text-sm font-bold text-white font-title">Ready for Analysis</h4>
                <p class="text-xs max-w-xs mt-1 text-brand-textMuted leading-relaxed">
                  Select an operation on the left, write or paste code in the Monaco Editor, and click "Run Analysis".
                </p>
              </div>
            }

            <!-- Streaming results -->
            <div class="prose prose-slate text-sm max-w-none text-brand-text leading-relaxed break-words"
                 [innerHTML]="renderedMarkdown()">
            </div>

            <!-- Typing cursor block -->
            @if (isGenerating()) {
              <span class="inline-block w-2.5 h-4 ml-1 bg-brand-highlight animate-pulse align-middle"></span>
            }
          </div>
        </div>

      </div>
    </div>
  `
})
export class WorkspaceComponent implements OnInit, AfterViewChecked {
  private workspaceService = inject(WorkspaceService);
  private jobsService = inject(JobsService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  // Signal states
  user = this.authService.currentUserSignal;
  historyList = signal<WorkspaceSessionResponse[]>([]);
  selectedTool = signal<string>('CODE_REVIEW');
  isGenerating = signal<boolean>(false);
  responseStream = signal<string>('');
  activeSessionId = signal<string | null>(null);

  // Form states
  code = `// Write or paste your code here\npublic class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`;
  selectedLanguage = 'java';
  selectedTheme = 'devmind-dark';
  selectedProvider = 'gemini';
  wordWrap = true;
  fontSize = 14;
  autoScroll = true;

  // Abort controller for cancellation
  private abortController: AbortController | null = null;

  // Monaco Configurations
  editorOptions = {
    theme: 'devmind-dark',
    language: 'java',
    fontSize: 14,
    minimap: { enabled: false },
    wordWrap: 'on',
    automaticLayout: true
  };

  // Metrics signals
  charCount = computed(() => this.code.length);
  lineCount = computed(() => this.code.split('\n').length);
  tokenEstimate = computed(() => Math.round(this.code.length / 4));

  // Rendered Markdown Signal
  renderedMarkdown = computed(() => this.parseMarkdown(this.responseStream()));

  tools = [
    { value: 'CODE_REVIEW', label: 'Code Review' },
    { value: 'BUG_FINDER', label: 'Bug Finder' },
    { value: 'EXPLAIN_CODE', label: 'Explain Code' },
    { value: 'COMPLEXITY', label: 'Complexity Analyzer' },
    { value: 'DOCUMENTATION', label: 'Documentation' },
    { value: 'UNIT_TEST', label: 'Unit Test Generator' },
    { value: 'COMMIT_GENERATOR', label: 'Commit Msg Gen' }
  ];

  templates = [
    {
      name: 'Java Review',
      language: 'java',
      tool: 'CODE_REVIEW',
      code: `public class Calculator {\n    public int divide(int a, int b) {\n        return a / b; // Bug: Potential division by zero\n    }\n}`
    },
    {
      name: 'Spring Review',
      language: 'java',
      tool: 'BUG_FINDER',
      code: `@RestController\n@RequestMapping("/users")\npublic class UserController {\n    @Autowired\n    private UserRepository repo;\n\n    @GetMapping("/{id}")\n    public User getUser(@PathVariable String id) {\n        return repo.findById(id).get(); // Bug: NoSuchElementException if empty\n    }\n}`
    },
    {
      name: 'React Review',
      language: 'typescript',
      tool: 'EXPLAIN_CODE',
      code: `import React, { useState, useEffect } from 'react';\n\nexport const Timer = () => {\n  const [seconds, setSeconds] = useState(0);\n  useEffect(() => {\n    const interval = setInterval(() => setSeconds(s => s + 1), 1000);\n    return () => clearInterval(interval);\n  }, []);\n  return <div>Seconds: {seconds}</div>;\n};`
    },
    {
      name: 'SQL Review',
      language: 'sql',
      tool: 'COMPLEXITY',
      code: `SELECT u.id, u.name, o.total\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE o.created_at > '2026-01-01'\nORDER BY o.total DESC;`
    },
    {
      name: 'Python Review',
      language: 'python',
      tool: 'UNIT_TEST',
      code: `def fibonacci(n):\n    if n <= 0:\n        return []\n    elif n == 1:\n        return [0]\n    fib = [0, 1]\n    while len(fib) < n:\n        fib.append(fib[-1] + fib[-2])\n    return fib`
    }
  ];

  onEditorInit(editor: any) {
    const monaco = (window as any).monaco;
    if (monaco) {
      // Define devmind-dark theme
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

      // Define devmind-light theme
      monaco.editor.defineTheme('devmind-light', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'comment', foreground: 'A88B76', fontStyle: 'italic' },
          { token: 'keyword', foreground: '810B38', fontStyle: 'bold' },
          { token: 'string', foreground: '541A1A' },
          { token: 'number', foreground: 'B45309' },
          { token: 'type', foreground: '810B38' },
          { token: 'class', foreground: '810B38' }
        ],
        colors: {
          'editor.background': '#F7EFE6',
          'editor.foreground': '#541A1A',
          'editorLineNumber.foreground': '#A88B76',
          'editorLineNumber.activeForeground': '#810B38',
          'editor.lineHighlightBackground': '#EFE2D2',
          'editor.selectionBackground': '#DCC3AA',
          'editorCursor.foreground': '#810B38'
        }
      });
      monaco.editor.setTheme(this.selectedTheme);
    }
    const model = editor.getModel();
    if (model) {
      editor.setModelLanguage(model, this.selectedLanguage.toLowerCase());
    }
  }

  ngOnInit() {
    this.loadHistory();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  loadHistory() {
    this.workspaceService.getHistory().subscribe({
      next: (res) => this.historyList.set(res.data),
      error: () => this.toastr.error('Failed to load history list', 'Error')
    });
  }

  selectTool(type: string) {
    this.selectedTool.set(type);
  }

  applyTemplate(tpl: any) {
    this.selectedLanguage = tpl.language;
    this.selectedTool.set(tpl.tool);
    this.code = tpl.code;
    this.onLanguageChange();
  }

  onLanguageChange() {
    this.editorOptions = { ...this.editorOptions, language: this.selectedLanguage };
  }

  onThemeChange() {
    this.editorOptions = { ...this.editorOptions, theme: this.selectedTheme };
    const monaco = (window as any).monaco;
    if (monaco) {
      monaco.editor.setTheme(this.selectedTheme);
    }
  }

  onWordWrapChange() {
    this.editorOptions = { ...this.editorOptions, wordWrap: this.wordWrap ? 'on' : 'off' };
  }

  onFontSizeChange() {
    this.editorOptions = { ...this.editorOptions, fontSize: this.fontSize };
  }

  clearEditor() {
    this.code = '';
    this.responseStream.set('');
    this.activeSessionId.set(null);
  }

  cancelGeneration() {
    if (this.abortController) {
      this.abortController.abort();
      this.isGenerating.set(false);
      this.toastr.info('AI analysis generation cancelled.', 'Cancelled');
    }
  }

  runAnalysis() {
    if (!this.code.trim()) return;

    this.isGenerating.set(true);
    this.responseStream.set('');
    this.activeSessionId.set(null);
    this.abortController = new AbortController();

    const payload = {
      code: this.code,
      toolType: this.selectedTool(),
      language: this.selectedLanguage,
      provider: this.selectedProvider
    };

    this.workspaceService.analyzeStream(
      payload,
      (chunk) => {
        // Safe check for carriage returns/escape quotes
        let text = chunk;
        if (text.startsWith('"') && text.endsWith('"')) {
          text = text.substring(1, text.length - 1);
        }
        text = text.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t');
        this.responseStream.update(s => s + text);
      },
      () => {
        this.isGenerating.set(false);
        this.toastr.success('AI analysis complete!', 'Success');
        this.loadHistory();
      },
      (err) => {
        this.isGenerating.set(false);
        const errMsg = err.message || 'Error occurred during streaming.';
        this.toastr.error(errMsg, 'Error');
      },
      this.abortController.signal
    );
  }

  runBackground() {
    if (!this.code.trim()) return;

    const payload = {
      code: this.code,
      toolType: this.selectedTool(),
      language: this.selectedLanguage,
      provider: this.selectedProvider
    };

    this.jobsService.submitJob(payload).subscribe({
      next: (res) => {
        this.toastr.success('Background job submitted successfully!', 'Success');
        this.router.navigate(['/jobs']);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to submit background job', 'Error');
      }
    });
  }

  loadSession(item: WorkspaceSessionResponse) {
    this.activeSessionId.set(item.id);
    this.code = item.inputCode;
    this.selectedLanguage = item.language.toLowerCase();
    this.selectedTool.set(item.toolType);
    this.responseStream.set(item.aiResponse);
    this.onLanguageChange();
  }

  toggleFavorite(event: Event, item: WorkspaceSessionResponse) {
    event.stopPropagation();
    this.workspaceService.toggleFavorite(item.id).subscribe({
      next: () => {
        this.toastr.success('Favorite status updated.', 'Success');
        this.loadHistory();
      }
    });
  }

  togglePin(event: Event, item: WorkspaceSessionResponse) {
    event.stopPropagation();
    this.workspaceService.togglePin(item.id).subscribe({
      next: () => {
        this.toastr.success('Pin status updated.', 'Success');
        this.loadHistory();
      }
    });
  }

  deleteSession(event: Event, id: string) {
    event.stopPropagation();
    this.workspaceService.deleteSession(id).subscribe({
      next: () => {
        this.toastr.success('Session deleted successfully.', 'Success');
        if (this.activeSessionId() === id) {
          this.clearEditor();
        }
        this.loadHistory();
      }
    });
  }

  copyResponse() {
    navigator.clipboard.writeText(this.responseStream());
    this.toastr.success('Response copied to clipboard!', 'Success');
  }

  exportResponse(event: Event) {
    const format = (event.target as HTMLSelectElement).value;
    if (!format || !this.responseStream()) return;

    const data = this.responseStream();
    let filename = `devmind-analysis-${new Date().toISOString().slice(0, 10)}`;
    let mimeType = 'text/plain';

    if (format === 'md') {
      filename += '.md';
      mimeType = 'text/markdown';
    } else if (format === 'txt') {
      filename += '.txt';
    } else if (format === 'pdf') {
      // PDF Mock download as text file mapping PDF looks
      filename += '.pdf.txt';
      mimeType = 'text/plain';
      const heading = `=========================================\n DEVMIND AI - REPORT EXPORT\n=========================================\n`;
      const doc = heading + `Generated: ${new Date().toLocaleString()}\nTool: ${this.selectedTool()}\nLanguage: ${this.selectedLanguage}\n\n` + data;
      this.triggerDownload(doc, filename, mimeType);
      return;
    }

    this.triggerDownload(data, filename, mimeType);
    // Reset selector
    (event.target as HTMLSelectElement).value = '';
  }

  private triggerDownload(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private scrollToBottom() {
    if (this.autoScroll && this.scrollContainer) {
      try {
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      } catch (e) {}
    }
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
