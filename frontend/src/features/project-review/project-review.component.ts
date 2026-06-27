import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../core/services/notification.service';
import { ConfettiService } from '../../core/services/confetti.service';

interface ScanStep {
  label: string;
  status: 'pending' | 'running' | 'done';
}

interface SASTIssue {
  id: string;
  file: string;
  line: number;
  title: string;
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  desc: string;
  fix: string;
  expanded?: boolean;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

@Component({
  selector: 'app-project-review',
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
      <main class="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 flex flex-col gap-6 animate-fade-in relative z-10">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h1 class="text-2xl font-extrabold text-white tracking-wide font-title flex items-center gap-2">
              <span>🧠</span> AI Repository Intelligence
            </h1>
            <p class="text-[11px] text-brand-textMuted/60 uppercase tracking-wider font-semibold mt-1">Audit codebases via ZIP archive or direct GitHub repository URLs</p>
          </div>
          <a routerLink="/dashboard" class="text-xs font-bold text-brand-highlight hover:underline flex items-center gap-1">
            &larr; Back to Dashboard
          </a>
        </div>

        <!-- STATE 1: Uploader Option Selection -->
        @if (currentState() === 'upload') {
          <div class="max-w-2xl mx-auto w-full space-y-6">
            <!-- Mode selectors tabs -->
            <div class="flex border border-white/10 p-1 rounded-xl bg-white/5 shrink-0">
              <button (click)="uploaderMode.set('zip')"
                      [class]="uploaderMode() === 'zip' ? 'bg-white/10 text-white font-bold' : 'text-brand-textMuted hover:text-white'"
                      class="flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition duration-150">
                📦 ZIP Archive Upload
              </button>
              <button (click)="uploaderMode.set('github')"
                      [class]="uploaderMode() === 'github' ? 'bg-white/10 text-white font-bold' : 'text-brand-textMuted hover:text-white'"
                      class="flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition duration-150">
                🐙 GitHub Repo Import
              </button>
            </div>

            <!-- ZIP mode block -->
            @if (uploaderMode() === 'zip') {
              <div class="flex-1 flex flex-col items-center justify-center p-12 bg-white/5 border border-dashed border-white/10 rounded-2xl text-center hover:border-brand-highlight/40 hover:bg-white/7 transition duration-200 shadow-2xl relative overflow-hidden group">
                <div class="absolute -right-24 -bottom-24 w-48 h-48 rounded-full bg-brand-highlight/5 blur-[50px] group-hover:bg-brand-highlight/8 transition duration-300"></div>
                <span class="text-6xl mb-6 block group-hover:scale-105 transition duration-300">📦</span>
                <h3 class="text-lg font-bold text-white font-title mb-1.5">Upload ZIP Archive</h3>
                <p class="text-xs text-brand-textMuted/70 max-w-sm leading-relaxed mb-6">
                  Select a zip archive (.zip) of your source code repository. We support Java Spring, Angular, React, and Python applications.
                </p>
                <div class="flex flex-col items-center gap-3">
                  <label class="btn-primary py-3 px-6 rounded-xl text-xs font-bold shadow-low hover:shadow-medium cursor-pointer transition duration-150">
                    <span>Browse Files</span>
                    <input type="file" accept=".zip" (change)="onFileSelected($event)" class="hidden">
                  </label>
                  <span class="text-[10px] text-brand-textMuted/45 uppercase font-bold tracking-wide">Max size: 50MB &bull; ZIP archives only</span>
                </div>
              </div>
            }

            <!-- GitHub mode block -->
            @if (uploaderMode() === 'github') {
              <div class="flex-1 flex flex-col items-center justify-center p-12 bg-white/5 border border-dashed border-white/10 rounded-2xl text-center hover:border-brand-highlight/40 hover:bg-white/7 transition duration-200 shadow-2xl relative overflow-hidden group">
                <div class="absolute -right-24 -bottom-24 w-48 h-48 rounded-full bg-brand-highlight/5 blur-[50px] group-hover:bg-brand-highlight/8 transition duration-300"></div>
                <span class="text-6xl mb-6 block group-hover:scale-105 transition duration-300">🐙</span>
                <h3 class="text-lg font-bold text-white font-title mb-1.5">GitHub Repository Import</h3>
                <p class="text-xs text-brand-textMuted/70 max-w-sm leading-relaxed mb-6">
                  Paste the public HTTPS URL of your GitHub repository. We will clone it and scan the file structure tree automatically.
                </p>
                <div class="w-full max-w-md flex flex-col gap-3">
                  <input type="text" [(ngModel)]="githubUrl" placeholder="https://github.com/username/project-repo"
                         class="w-full bg-brand-surface border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/35 focus:outline-none focus:border-brand-highlight font-mono">
                  <button (click)="importFromGithub()"
                          [disabled]="!githubUrl.trim().startsWith('https://github.com/')"
                          class="btn-primary py-3 rounded-xl text-xs font-bold shadow-low hover:shadow-medium disabled:opacity-40 select-none">
                    Clone & Analyze Repository
                  </button>
                </div>
                <span class="text-[10px] text-brand-textMuted/45 uppercase font-bold tracking-wide mt-4">Support public repositories only</span>
              </div>
            }
          </div>
        }

        <!-- STATE 2: Loading & Scanning View -->
        @if (currentState() === 'scanning') {
          <div class="glass-panel p-8 rounded-2xl max-w-xl w-full mx-auto shadow-2xl space-y-6 animate-fade-in border border-white/10">
            <div class="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 class="text-xs font-bold text-white uppercase tracking-wider font-title flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-brand-highlight animate-ping"></span>
                Repository Scanner Running
              </h3>
              <span class="text-[10px] font-bold text-brand-textMuted/50 font-mono">{{ scanProgress() }}%</span>
            </div>

            <!-- Shimmer Bar -->
            <div class="w-full bg-white/5 border border-white/5 rounded-full h-2 overflow-hidden animate-shimmer relative">
              <div class="bg-gradient-to-r from-brand-secondary to-brand-highlight h-full rounded-full transition-all duration-300"
                   [style.width.%]="scanProgress()"></div>
            </div>

            <!-- Steps checklist -->
            <div class="space-y-3.5 pt-2">
              @for (step of activeScanSteps(); track step.label) {
                <div class="flex items-center justify-between text-xs font-semibold">
                  <div class="flex items-center gap-2.5">
                    @if (step.status === 'done') {
                      <span class="text-emerald-400">✓</span>
                    } @else if (step.status === 'running') {
                      <span class="text-brand-highlight animate-pulse font-bold">&bull;</span>
                    } @else {
                      <span class="text-white/20 font-bold">&bull;</span>
                    }
                    <span [ngClass]="{ 'text-white font-bold': step.status === 'running', 'text-brand-textMuted/45': step.status === 'pending', 'text-white/70': step.status === 'done' }">
                      {{ step.label }}
                    </span>
                  </div>
                  
                  @if (step.status === 'done') {
                    <span class="text-[9px] font-bold uppercase text-emerald-400">Complete</span>
                  } @else if (step.status === 'running') {
                    <span class="text-[9px] font-bold uppercase text-brand-highlight animate-pulse">Running</span>
                  } @else {
                    <span class="text-[9px] font-bold uppercase text-white/20">Pending</span>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- STATE 3: Report Results View -->
        @if (currentState() === 'report') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            <!-- Sidebar: Grades & Health Indicators -->
            <div class="lg:col-span-1 flex flex-col gap-6">
              <!-- Code quality Grade -->
              <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl text-center relative overflow-hidden">
                <div class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 to-brand-highlight"></div>
                <span class="text-[10px] font-bold text-brand-textMuted block uppercase tracking-wider mb-2">Overall Code Quality</span>
                
                <div class="text-6xl font-black text-white my-3 font-title flex items-center justify-center gap-2">
                  <span>A-</span>
                  <span class="text-2xl text-emerald-400">★</span>
                </div>
                
                <p class="text-[10px] text-brand-textMuted/60 leading-relaxed max-w-[200px] mx-auto mb-6">Excellent structural design with standard OOP separations.</p>
                
                <!-- Indicators -->
                <div class="border-t border-white/5 pt-4 text-left space-y-3 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-brand-textMuted">SAST Score:</span>
                    <strong class="text-white">94%</strong>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-brand-textMuted">Security Level:</span>
                    <strong class="text-emerald-400">Secure</strong>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-brand-textMuted">Maintainability:</span>
                    <strong class="text-brand-highlight">89/100</strong>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-brand-textMuted">Detected Issues:</span>
                    <strong class="text-rose-400">{{ issuesCount() }} SAST warnings</strong>
                  </div>
                </div>
              </div>

              <!-- Tech Stack & Files -->
              <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 font-title">
                  🛠️ Discovered Tech Stack
                </h3>
                
                <div class="flex flex-wrap gap-2">
                  <span class="px-2.5 py-1 bg-brand-highlight/15 text-brand-highlight border border-brand-highlight/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">Java Spring</span>
                  <span class="px-2.5 py-1 bg-white/5 text-white/80 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider">PostgreSQL</span>
                  <span class="px-2.5 py-1 bg-white/5 text-white/80 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider">Maven</span>
                  <span class="px-2.5 py-1 bg-white/5 text-white/80 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider">Spring Security</span>
                  <span class="px-2.5 py-1 bg-white/5 text-white/80 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider">Lombok</span>
                </div>

                <div class="pt-2 border-t border-white/5 text-xs text-brand-textMuted space-y-2">
                  <div class="flex justify-between">
                    <span>Source Files Discovered:</span>
                    <strong class="text-white">12 files</strong>
                  </div>
                  <div class="flex justify-between">
                    <span>Configuration Files:</span>
                    <strong class="text-white">3 files</strong>
                  </div>
                  <div class="flex justify-between">
                    <span>Language Metrics:</span>
                    <strong class="text-white">1,420 lines</strong>
                  </div>
                </div>
              </div>

              <!-- Action triggers -->
              <div class="flex flex-col gap-2.5">
                <button (click)="downloadReport()" class="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-1.5">
                  <span>⬇</span> Download Markdown Audit
                </button>
                <button (click)="resetUploader()" class="btn-secondary w-full py-3 text-xs font-bold">
                  Analyze Another Repository
                </button>
              </div>
            </div>

            <!-- Content Area: Dependency Graph, Bugs & Generated README & Chat Q&A -->
            <div class="lg:col-span-2 flex flex-col gap-6">
              
              <!-- Tabs -->
              <div class="flex border border-white/10 p-1 rounded-xl bg-white/5 shrink-0">
                @for (tab of tabs; track tab.id) {
                  <button (click)="activeTab.set(tab.id)"
                          [ngClass]="activeTab() === tab.id ? 'bg-brand-highlight/15 text-white border-b border-brand-highlight' : 'text-brand-textMuted hover:text-white'"
                          class="flex-1 text-center py-2 text-xs font-bold rounded-lg transition duration-150">
                    {{ tab.label }}
                  </button>
                }
              </div>

              <!-- Tab content 1: Dependency Graph (Mermaid style layout) -->
              @if (activeTab() === 'graph') {
                <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center">
                  <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-2 font-title self-start">💡 Structural Module Mapping</h4>
                  <p class="text-[10px] text-brand-textMuted/65 mb-8 self-start leading-none uppercase">Interactive dependency flow of parsed codebase tiers</p>
                  
                  <!-- CSS Graph -->
                  <div class="flex flex-col items-center w-full gap-8 max-w-md select-none">
                    <!-- Block 1: Controller Layer -->
                    <div class="p-3 bg-brand-highlight/10 border border-brand-highlight/30 rounded-xl text-center w-64 shadow-md transition duration-200 hover:scale-105">
                      <span class="text-[9px] font-bold text-brand-highlight block uppercase tracking-wide">API Endpoint Layer</span>
                      <strong class="text-xs text-white">UserController.java</strong>
                    </div>

                    <div class="w-0.5 h-6 bg-brand-highlight/20 relative">
                      <div class="absolute -bottom-1 -left-1 w-2.5 h-2.5 rotate-45 border-b border-r border-brand-highlight/40"></div>
                    </div>

                    <!-- Block 2: Service Layer -->
                    <div class="p-3 bg-brand-accent/10 border border-brand-accent/30 rounded-xl text-center w-64 shadow-md transition duration-200 hover:scale-105">
                      <span class="text-[9px] font-bold text-brand-accent block uppercase tracking-wide">Business Logic Layer</span>
                      <strong class="text-xs text-white">UserService.java</strong>
                    </div>

                    <div class="w-0.5 h-6 bg-brand-accent/20 relative">
                      <div class="absolute -bottom-1 -left-1 w-2.5 h-2.5 rotate-45 border-b border-r border-brand-accent/40"></div>
                    </div>

                    <!-- Block 3: Repository Layer -->
                    <div class="p-3 bg-brand-primary/20 border border-brand-primary/45 rounded-xl text-center w-64 shadow-md transition duration-200 hover:scale-105">
                      <span class="text-[9px] font-bold text-brand-textMuted block uppercase tracking-wide">Data Repository Access</span>
                      <strong class="text-xs text-white">UserRepository.java</strong>
                    </div>

                    <div class="w-0.5 h-6 bg-white/10 relative">
                      <div class="absolute -bottom-1 -left-1 w-2.5 h-2.5 rotate-45 border-b border-r border-white/20"></div>
                    </div>

                    <!-- Block 4: Database -->
                    <div class="p-3.5 bg-black/45 border border-white/10 rounded-xl text-center w-48 shadow-inner font-mono text-[11px] font-bold text-white flex items-center justify-center gap-1.5">
                      <span>🗄️</span> DATABASE [PostgreSQL]
                    </div>
                  </div>
                </div>
              }

              <!-- Tab content 2: SAST Warnings -->
              @if (activeTab() === 'sast') {
                <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
                  <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-1 font-title">🚨 Security SAST Warnings</h4>
                  <p class="text-[10px] text-brand-textMuted/65 mb-4 leading-none uppercase">Static Application Security Testing defects found inside the code tree</p>
                  
                  <div class="space-y-3.5">
                    @for (issue of sastIssues; track issue.id) {
                      <div class="border border-white/5 rounded-xl bg-black/15 overflow-hidden transition-all duration-200">
                        <div (click)="issue.expanded = !issue.expanded"
                             class="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 select-none gap-4">
                          <div class="flex items-center gap-3">
                            <span class="text-xs">
                              {{ issue.risk === 'HIGH' ? '🚨' : issue.risk === 'MEDIUM' ? '⚠️' : 'ℹ️' }}
                            </span>
                            <div class="min-w-0">
                              <h4 class="text-xs font-bold text-white">{{ issue.title }}</h4>
                              <span class="text-[9px] text-brand-textMuted/50 font-mono mt-0.5 block truncate">
                                {{ issue.file }}:L{{ issue.line }}
                              </span>
                            </div>
                          </div>
                          <div class="flex items-center gap-3 shrink-0">
                            <span [ngClass]="{ 'text-rose-400 bg-rose-500/10 border border-rose-500/25': issue.risk === 'HIGH', 'text-amber-400 bg-amber-500/10 border border-amber-500/25': issue.risk === 'MEDIUM', 'text-blue-400 bg-blue-500/10 border border-blue-500/25': issue.risk === 'LOW' }"
                                  class="text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              {{ issue.risk }}
                            </span>
                            <svg class="w-3.5 h-3.5 text-brand-textMuted/50 transition duration-200"
                                 [ngClass]="{ 'rotate-180': issue.expanded }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        @if (issue.expanded) {
                          <div class="px-4 pb-4 pt-1.5 border-t border-white/5 bg-black/25 text-xs space-y-3 animate-fade-in">
                            <div>
                              <span class="block text-[9px] uppercase font-bold text-white/40 mb-0.5">Defect Description</span>
                              <p class="text-brand-textMuted leading-relaxed">{{ issue.desc }}</p>
                            </div>
                            <div class="p-3 bg-brand-highlight/5 border border-brand-highlight/15 rounded-lg">
                              <span class="block text-[9px] uppercase font-bold text-brand-highlight mb-1">Recommended Quick Fix</span>
                              <code class="font-mono text-[10px] text-white block select-all">{{ issue.fix }}</code>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Tab content 3: Auto README -->
              @if (activeTab() === 'readme') {
                <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
                  <div class="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 class="text-xs font-bold text-white uppercase tracking-wider font-title">📄 Auto-Generated project documentation</h4>
                    <button (click)="copyReadme()" class="text-[10px] font-bold text-brand-highlight hover:underline">Copy README</button>
                  </div>
                  
                  <div class="bg-black/35 rounded-xl p-5 border border-white/5 font-mono text-[11px] text-indigo-200 max-h-[400px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                    {{ generatedReadme }}
                  </div>
                </div>
              }

              <!-- Tab content 4: Repo AI Chat Q&A -->
              @if (activeTab() === 'chat') {
                <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col h-[400px] overflow-hidden">
                  <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-1 font-title">💬 Repository AI Q&A Chat</h4>
                  <p class="text-[10px] text-brand-textMuted/65 mb-4 uppercase leading-none">Ask complex structural questions about this repository</p>
                  
                  <!-- Message History -->
                  <div class="flex-1 overflow-y-auto p-2 space-y-3.5 bg-black/15 border border-white/5 rounded-xl mb-4 text-xs" #chatScrollContainer>
                    @for (msg of chatMessages(); track msg.timestamp) {
                      <div class="flex flex-col gap-1 max-w-[80%]"
                           [ngClass]="msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'">
                        <span class="text-[8px] font-bold uppercase text-white/30">{{ msg.sender === 'user' ? 'You' : 'DevMind AI Engine' }} &bull; {{ msg.timestamp }}</span>
                        <div class="px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap select-text"
                             [ngClass]="msg.sender === 'user' ? 'bg-brand-highlight/20 text-white rounded-tr-none' : 'bg-white/5 text-brand-textMuted rounded-tl-none border border-white/5'">
                          {{ msg.text }}
                        </div>
                      </div>
                    }
                    @if (isChatTyping()) {
                      <div class="mr-auto max-w-[80%] flex flex-col items-start gap-1">
                        <span class="text-[8px] font-bold uppercase text-white/30">DevMind AI Engine</span>
                        <div class="px-3.5 py-2.5 rounded-2xl rounded-tl-none bg-white/5 border border-white/5 flex items-center gap-1">
                          <span class="w-1.5 h-1.5 rounded-full bg-brand-highlight animate-ping"></span>
                          <span class="text-[10px] text-brand-textMuted/60 font-bold uppercase tracking-wide">AI thinking...</span>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Quick prompts or input bar -->
                  <div class="space-y-2 shrink-0 select-none">
                    <div class="flex flex-wrap gap-1.5">
                      @for (q of defaultQuestions; track q) {
                        <button (click)="submitQuestion(q)"
                                [disabled]="isChatTyping()"
                                class="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-bold text-brand-highlight hover:bg-white/10 hover:text-white transition duration-150 disabled:opacity-40">
                          {{ q }}
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }

            </div>

          </div>
        }

      </main>

      <!-- Footer -->
      <footer class="border-t border-brand-border bg-white/5 px-6 py-6 text-center text-xs text-brand-textMuted/60 mt-12 shrink-0">
        &copy; 2026 DevMind AI. Enterprise-grade AI Software Engineer Assistant. All rights reserved.
      </footer>
    </div>
  `
})
export class ProjectReviewComponent implements OnInit {
  private toastr = inject(ToastrService);
  private notif = inject(NotificationService);
  private confetti = inject(ConfettiService);

  currentState = signal<'upload' | 'scanning' | 'report'>('upload');
  uploaderMode = signal<'zip' | 'github'>('zip');
  scanProgress = signal<number>(0);
  activeTab = signal<string>('graph');
  githubUrl = '';

  // AI Chat states
  isChatTyping = signal<boolean>(false);
  chatMessages = signal<ChatMessage[]>([
    { sender: 'ai', text: 'Hello! I have indexed all directories in this codebase. Ask me anything about repositories scopes, configuration dependencies, or JPA controller pathways!', timestamp: new Date().toLocaleTimeString() }
  ]);

  defaultQuestions = [
    'Where is authentication implemented?',
    'How do I configure database connections?',
    'Where are background worker threads defined?'
  ];

  tabs = [
    { id: 'graph', label: 'Architecture Topology' },
    { id: 'sast', label: 'Security Vulnerabilities' },
    { id: 'readme', label: 'Automated README' },
    { id: 'chat', label: 'Repo AI Chat' }
  ];

  // ZIP Scan timeline steps
  zipScanSteps: ScanStep[] = [
    { label: 'Loading project archive', status: 'pending' },
    { label: 'Unpacking file structure tree descriptors', status: 'pending' },
    { label: 'Detecting language stack and package references', status: 'pending' },
    { label: 'Indexing code modules and layout graphs', status: 'pending' },
    { label: 'Scanning source files for security defects (SAST)', status: 'pending' },
    { label: 'Assembling automated report and project specifications', status: 'pending' }
  ];

  // GitHub Scan timeline steps
  githubScanSteps: ScanStep[] = [
    { label: 'Authenticating HTTPS cloning streams', status: 'pending' },
    { label: 'Cloning repository sources locally into memory space', status: 'pending' },
    { label: 'Unpacking file structure tree descriptors', status: 'pending' },
    { label: 'Detecting language stack and package references', status: 'pending' },
    { label: 'Indexing code modules and layout graphs', status: 'pending' },
    { label: 'Scanning source files for security defects (SAST)', status: 'pending' },
    { label: 'Assembling automated report and project specifications', status: 'pending' }
  ];

  activeScanSteps = computed(() => {
    return this.uploaderMode() === 'github' ? this.githubScanSteps : this.zipScanSteps;
  });

  sastIssues: SASTIssue[] = [
    {
      id: 'sast-1',
      file: 'UserRepository.java',
      line: 24,
      title: 'JPQL Direct SQL Injection Risk',
      risk: 'HIGH',
      desc: 'Executing JPQL queries using direct string concatenation. This allows remote users to run arbitrary database queries by entering escape quotes in lookup variables.',
      fix: 'return entityManager.createQuery("SELECT u FROM User u WHERE u.username = :uname", User.class).setParameter("uname", inputName).getSingleResult();',
      expanded: true
    },
    {
      id: 'sast-2',
      file: 'UserController.java',
      line: 58,
      title: 'Potential NoSuchElementException Null Pointer',
      risk: 'MEDIUM',
      desc: 'Invoking Optional.get() directly without validating if isPresent() returned true. This will throw an exception on user lookup calls if the user ID does not exist in database.',
      fix: 'return repo.findById(id).orElseThrow(() -> new UserNotFoundException("User not found: " + id));',
      expanded: false
    },
    {
      id: 'sast-3',
      file: 'FileService.java',
      line: 114,
      title: 'Unclosed InputStream Resource Leak',
      risk: 'LOW',
      desc: 'Creating an InputStream reader but failing to close it in a finally block. This leads to system OS file descriptors leakage under heavy file operations workload.',
      fix: 'try (InputStream in = new FileInputStream(file)) { // use try-with-resources }',
      expanded: false
    }
  ];

  generatedReadme = `# DevMind AI Sample Spring Project ✨

This repository is auto-scanned and verified using DevMind AI repository intelligence.

## 🛠️ Stack Configuration
- **Backend Framework**: Spring Boot v3.2.0
- **Build System**: Maven Wrapper (pom.xml)
- **Database**: PostgreSQL (relational layer)
- **Security**: stateless JWT authentication filter

## 📁 Repository Directory Structure
\`\`\`
├── backend/
│   ├── src/main/java/com/devmind/
│   │   ├── controller/UserController.java (API route definitions)
│   │   ├── service/UserService.java (Business logic controller)
│   │   ├── repository/UserRepository.java (JPA Database repository)
│   │   └── security/JwtFilter.java (Stateless filter)
│   └── pom.xml (Maven config)
└── README.md
\`\`\`

## 🚀 Getting Started
1. Boot up local PostgreSQL database server.
2. Run database migrations: \`mvn flyway:migrate\`.
3. Start spring application server: \`./mvnw spring-boot:run\`.
`;

  // Pre-coded AI replies mapping questions
  private chatAnswers: { [key: string]: string } = {
    'where is authentication implemented?': `Authentication is implemented across these core backend layers:
1. **Controller Layer**: [UserController.java](file:///C:/Users/CHARAN/Downloads/DevMind-AI/backend/src/main/java/com/devmind/controller/UserController.java) routes sign-in, login, and registration payloads.
2. **Security Config**: [SecurityConfig.java](file:///C:/Users/CHARAN/Downloads/DevMind-AI/backend/src/main/java/com/devmind/config/SecurityConfig.java) configures endpoint paths permissions (e.g. bypass /api/auth/**), stateless session managers, and Bcrypt encryptions.
3. **Stateless JWT Filter**: [JwtFilter.java](file:///C:/Users/CHARAN/Downloads/DevMind-AI/backend/src/main/java/com/devmind/security/JwtFilter.java) intercepts request headers, decrypts bearer tokens, and loads user context into Spring Security context mapping.`,
    
    'how do i configure database connections?': `Database connection parameters are handled inside Spring configurations:
1. **Properties File**: Open [application.properties](file:///C:/Users/CHARAN/Downloads/DevMind-AI/backend/src/main/resources/application.properties) or [application.yml](file:///C:/Users/CHARAN/Downloads/DevMind-AI/backend/src/main/resources/application.yml).
2. **Configuration keys**:
   - \`spring.datasource.url=jdbc:postgresql://localhost:5432/devmind\`
   - \`spring.datasource.username=postgres\`
   - \`spring.datasource.password=secret_db_password\`
   - \`spring.jpa.hibernate.ddl-auto=update\``,
    
    'where are background worker threads defined?': `Asynchronous background operations are orchestrated via these modules:
1. **Service Processor**: [JobsService.java](file:///C:/Users/CHARAN/Downloads/DevMind-AI/backend/src/main/java/com/devmind/jobs/service/JobsService.java) creates job records, allocates thread pools, and processes tasks asynchronously.
2. **REST Endpoints**: [JobsController.java](file:///C:/Users/CHARAN/Downloads/DevMind-AI/backend/src/main/java/com/devmind/jobs/controller/JobsController.java) receives submit triggers, checks worker cues, and handles job revocation.`
  };

  issuesCount = computed(() => this.sastIssues.length);

  ngOnInit() {}

  onFileSelected(event: Event): void {
    const el = event.target as HTMLInputElement;
    if (el.files && el.files.length > 0) {
      this.startScanning();
    }
  }

  importFromGithub(): void {
    if (!this.githubUrl.trim().startsWith('https://github.com/')) {
      this.toastr.error('Please enter a valid public GitHub HTTPS URL', 'Error');
      return;
    }
    this.startScanning();
  }

  private startScanning(): void {
    this.currentState.set('scanning');
    this.scanProgress.set(0);
    
    const steps = this.activeScanSteps();
    steps.forEach(s => s.status = 'pending');
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      const progress = this.scanProgress();
      if (progress < 100) {
        this.scanProgress.set(progress + 5);
        
        const nextStepIndex = Math.floor((progress + 5) / (100 / steps.length));
        if (nextStepIndex > stepIndex && stepIndex < steps.length) {
          steps[stepIndex].status = 'done';
          stepIndex = nextStepIndex;
          if (stepIndex < steps.length) {
            steps[stepIndex].status = 'running';
          }
        }
      } else {
        clearInterval(interval);
        steps[steps.length - 1].status = 'done';
        this.completeScanning();
      }
    }, 150);
  }

  private completeScanning(): void {
    this.currentState.set('report');
    this.toastr.success('AI Project Review Complete!', 'Success');
    this.notif.addNotification(
      'Repository Scan Complete 🧠',
      `Audit report generated for: ${this.uploaderMode() === 'github' ? this.githubUrl : 'Uploaded ZIP'}. Grade: A-`,
      'success'
    );
    this.confetti.burst();
  }

  // AI Chat Submit Q&A
  submitQuestion(q: string): void {
    if (this.isChatTyping()) return;

    const time = new Date().toLocaleTimeString();
    // 1. Append User Message
    this.chatMessages.update(msgs => [...msgs, { sender: 'user', text: q, timestamp: time }]);
    
    // 2. Trigger Typing loading delay
    this.isChatTyping.set(true);

    setTimeout(() => {
      this.isChatTyping.set(false);
      const normalized = q.trim().toLowerCase();
      const answer = this.chatAnswers[normalized] || `I'm sorry, I don't have a pre-indexed code pathway file reference for "${q}". Please try standard repository questions.`;
      
      this.chatMessages.update(msgs => [...msgs, { sender: 'ai', text: answer, timestamp: new Date().toLocaleTimeString() }]);
    }, 1000);
  }

  downloadReport(): void {
    const markdown = `# DevMind AI Repository Audit Report
Generated: ${new Date().toLocaleString()}
Quality Grade: A-
Security Score: 94%

## Discovered Stack
- Java Spring Boot + Maven

## SAST Vulnerabilities Detected
${this.sastIssues.map(i => `\n### [${i.risk} RISK] ${i.title}
File: ${i.file} (Line: ${i.line})
Description: ${i.desc}
Recommended Fix:
\`\`\`java
${i.fix}
\`\`\`
`).join('\n')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `devmind-project-audit-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastr.success('Report downloaded!', 'Success');
  }

  copyReadme(): void {
    navigator.clipboard.writeText(this.generatedReadme);
    this.toastr.success('README copied to clipboard!', 'Success');
  }

  resetUploader(): void {
    this.currentState.set('upload');
    this.githubUrl = '';
  }
}
