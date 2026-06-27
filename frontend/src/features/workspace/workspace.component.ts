import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef, AfterViewChecked, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { WorkspaceService, WorkspaceSessionResponse } from '../../core/services/workspace.service';
import { JobsService } from '../../core/services/jobs.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CommandPaletteService } from '../../core/services/command-palette.service';
import { NotificationService } from '../../core/services/notification.service';

interface WorkspaceTab {
  id: string;
  title: string;
  code: string;
  language: string;
  selectedTool: string;
  responseStream: string;
  activeSessionId: string | null;
}

interface TerminalLog {
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
}

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, MonacoEditorModule, NavbarComponent],
  template: `
    <div class="flex flex-col h-screen bg-brand-bg text-brand-text font-sans overflow-hidden relative select-none">
      <!-- Glow background accents -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-brand-primary/5 blur-[120px]"></div>
        <div class="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-brand-surface/20 blur-[120px]"></div>
      </div>

      <!-- Shared Header Navbar -->
      <app-navbar></app-navbar>

      <!-- Layout Grid -->
      <div class="flex-1 flex overflow-hidden z-10">
        
        <!-- COLUMN 1: Sidebar with Prompts Library & Starter Boilerplates -->
        <aside [style.width.px]="sidebarCollapsed() ? 0 : sidebarWidth()"
               [ngClass]="{ 'hidden': sidebarCollapsed() }"
               class="workspace-sidebar border-r border-brand-border bg-brand-primary text-white flex flex-col overflow-hidden shrink-0 transition-all duration-75">
          
          <!-- Library Tabs & Collapse Button -->
          <div class="flex border-b border-brand-primaryHover bg-black/15 p-1 shrink-0 items-center justify-between gap-1">
            <div class="flex flex-1 gap-1">
              <button (click)="sidebarTab.set('prompts')"
                      [class]="sidebarTab() === 'prompts' ? 'bg-white/10 text-brand-highlight font-bold' : 'text-white/60 hover:text-white'"
                      class="flex-1 text-center py-2 text-[9px] uppercase tracking-wider rounded-lg transition duration-150">
                Prompt Lib
              </button>
              <button (click)="sidebarTab.set('templates')"
                      [class]="sidebarTab() === 'templates' ? 'bg-white/10 text-brand-highlight font-bold' : 'text-white/60 hover:text-white'"
                      class="flex-1 text-center py-2 text-[9px] uppercase tracking-wider rounded-lg transition duration-150">
                Templates
              </button>
              <button (click)="sidebarTab.set('saves')"
                      [class]="sidebarTab() === 'saves' ? 'bg-white/10 text-brand-highlight font-bold' : 'text-white/60 hover:text-white'"
                      class="flex-1 text-center py-2 text-[9px] uppercase tracking-wider rounded-lg transition duration-150">
                Saves
              </button>
            </div>
            <button (click)="toggleSidebar()" class="px-2 py-2 text-white/50 hover:text-white transition duration-150 text-xs font-bold" title="Collapse Sidebar">◀</button>
          </div>

          <!-- Content 1: Prompt Library -->
          @if (sidebarTab() === 'prompts') {
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <span class="text-[9px] font-bold text-white/40 uppercase tracking-wider block mb-2">Select Prompts</span>
                <div class="space-y-2">
                  @for (prompt of promptLibrary; track prompt.title) {
                    <button (click)="applyPrompt(prompt)"
                            class="w-full text-left p-3 rounded-xl border border-brand-primaryHover hover:border-brand-highlight bg-brand-primaryHover/20 hover:bg-brand-primaryHover/55 transition duration-150 flex flex-col gap-1">
                      <div class="flex items-center gap-1.5">
                        <span>{{ prompt.icon }}</span>
                        <span class="text-xs font-bold text-white">{{ prompt.title }}</span>
                      </div>
                      <span class="text-[10px] text-white/60 font-semibold">{{ prompt.desc }}</span>
                    </button>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Content 2: Boilerplate Starter Templates -->
          @if (sidebarTab() === 'templates') {
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <span class="text-[9px] font-bold text-white/40 uppercase tracking-wider block mb-2">Code Boilerplates</span>
                <div class="space-y-2">
                  @for (tpl of boilerplateTemplates; track tpl.name) {
                    <button (click)="applyBoilerplate(tpl)"
                            class="w-full text-left p-3 rounded-xl border border-brand-primaryHover hover:border-brand-highlight bg-brand-primaryHover/20 hover:bg-brand-primaryHover/55 transition duration-150 flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="text-xl">{{ tpl.icon }}</span>
                        <div class="min-w-0">
                          <span class="text-xs font-bold text-white block">{{ tpl.name }}</span>
                          <span class="text-[9px] text-white/60 uppercase font-semibold block mt-0.5">{{ tpl.language }}</span>
                        </div>
                      </div>
                      <span class="text-white/30 text-xs font-bold">&rarr;</span>
                    </button>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Content 3: Saves and History -->
          @if (sidebarTab() === 'saves') {
            <div class="flex-1 flex flex-col overflow-hidden">
              <div class="p-3 border-b border-brand-primaryHover flex items-center justify-between shrink-0">
                <span class="text-[9px] font-bold uppercase tracking-wider text-white/50">History Files</span>
                <button (click)="loadHistory()" class="text-[9px] font-bold text-white/80 hover:text-white">Refresh</button>
              </div>
              <div class="flex-1 overflow-y-auto p-3 space-y-2">
                @if (historyList().length === 0) {
                  <div class="text-center py-8 px-2 border border-dashed border-white/10 rounded-xl text-xs text-white/55">
                    <span class="text-2xl block mb-2">📦</span>
                    <span class="font-bold text-white block">No Saved Sessions</span>
                    <p class="text-[9px] text-brand-textMuted/50 mt-1 max-w-[180px] mx-auto leading-relaxed">Runs save logs automatically.</p>
                  </div>
                }
                @for (item of historyList(); track item.id) {
                  <div [class]="activeSessionId() === item.id ? 'border-brand-highlight bg-white/10' : 'border-brand-primaryHover bg-brand-primaryHover/20 hover:bg-brand-primaryHover/40'"
                       class="group p-3 rounded-xl border flex flex-col gap-1.5 transition duration-200 relative cursor-pointer"
                       (click)="loadSession(item)">
                    <div class="flex items-start justify-between gap-2">
                      <span class="text-xs font-bold text-white truncate pr-6">{{ item.title }}</span>
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
          }
        </aside>
        <div class="workspace-sidebar-backdrop bg-black/60 fixed inset-0 z-40 hidden" onclick="document.querySelector('.workspace-sidebar').classList.remove('mobile-open')"></div>

        <!-- Sidebar Draggable Vertical Handle (Col Resize) -->
        @if (!sidebarCollapsed()) {
          <div (mousedown)="startDrag($event, 'sidebar')"
               (dblclick)="resetSize('sidebar')"
               class="w-1.5 hover:w-2 bg-transparent hover:bg-brand-highlight/30 cursor-col-resize transition-all shrink-0 z-20 h-full border-r border-brand-border select-none">
          </div>
        }

        <!-- COLUMN 2: Workspace tabs & Monaco Editor & collapsible Terminal logs -->
        <div class="flex-1 flex flex-col border-r border-brand-border bg-brand-bg relative overflow-hidden">
          
          <!-- Workspace IDE tabs & Collapse Toggles -->
          <div class="px-4 bg-brand-surface border-b border-brand-border flex items-center gap-1 shrink-0 pt-2 justify-between">
            <div class="flex items-center gap-1">
              @if (sidebarCollapsed()) {
                <button (click)="toggleSidebar()" class="px-2 py-1 text-xs text-brand-highlight bg-brand-primary/20 border border-brand-primaryHover rounded-lg mr-2 select-none" title="Show Sidebar">▶ Sidebar</button>
              }
              @for (tab of workspaceTabs(); track tab.id) {
                <div (click)="selectTab(tab.id)"
                     [class]="activeTabId() === tab.id ? 'bg-brand-bg border-t border-x border-brand-border text-white font-bold' : 'text-brand-textMuted/65 hover:text-white'"
                     class="px-4 py-2 text-xs font-semibold rounded-t-lg flex items-center gap-2 cursor-pointer transition duration-150 select-none">
                  <span>{{ tab.title }}</span>
                  <span class="text-[8px] px-1 bg-white/5 border border-white/5 rounded text-brand-textMuted uppercase font-bold">{{ tab.language }}</span>
                  <button (click)="closeTab($event, tab.id)" class="hover:text-rose-400 transition duration-150 ml-1 text-[9px] font-bold select-none">×</button>
                </div>
              }
              <button (click)="createNewTab()" class="p-1.5 text-white/40 hover:text-white transition duration-150 text-sm font-bold select-none" title="Open New Tab">+</button>
            </div>
            
            @if (rightPanelCollapsed()) {
              <button (click)="toggleRightPanel()" class="px-2 py-1 text-xs text-brand-highlight bg-brand-primary/20 border border-brand-primaryHover rounded-lg select-none" title="Show Response Panel">◀ AI Panel</button>
            }
          </div>

          <!-- Configuration Panel -->
          <div class="px-4 py-2 bg-brand-surface border-b border-brand-border flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <!-- Language -->
              <select [(ngModel)]="selectedLanguage" (change)="onLanguageChange()"
                      class="bg-brand-editorBg border border-brand-border text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-accent text-white">
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
                <option value="cpp">C++</option>
                <option value="sql">SQL</option>
              </select>

              <!-- Theme -->
              <select [(ngModel)]="selectedTheme" (change)="onThemeChange()"
                      class="bg-brand-editorBg border border-brand-border text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-accent text-white">
                <option value="devmind-dark">Brand Dark Theme</option>
                <option value="vs-dark">Monaco Default Dark</option>
                <option value="vs">Monaco Default Light</option>
              </select>

              <!-- LLM Provider -->
              <select [(ngModel)]="selectedProvider"
                      class="bg-brand-editorBg border border-brand-border text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-accent text-white">
                <option value="gemini">Gemini 2.5 Flash</option>
                <option value="openai">OpenAI GPT-5 (Planned)</option>
                <option value="claude">Claude Sonnet (Planned)</option>
              </select>

              <!-- Word Wrap -->
              <label class="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" [(ngModel)]="wordWrap" (change)="onWordWrapChange()" class="rounded border-brand-border bg-brand-editorBg text-brand-accent focus:ring-brand-accent">
                <span class="text-[10px] text-brand-textMuted font-semibold uppercase">Wrap</span>
              </label>
            </div>

            <!-- Operations selector dropdown -->
            <div class="flex items-center gap-2">
              <span class="text-[9px] uppercase font-bold text-brand-textMuted">Active Tool</span>
              <select [ngModel]="selectedTool()" (ngModelChange)="selectTool($event)"
                      class="bg-brand-highlight/15 border border-brand-highlight/30 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none text-brand-highlight uppercase tracking-wide">
                @for (tool of tools; track tool.value) {
                  <option [value]="tool.value" class="bg-[#120A24] text-white">{{ tool.label }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Code Editor Instance -->
          <div class="flex-1 relative bg-brand-editorBg overflow-hidden">
            <ngx-monaco-editor [options]="editorOptions" [(ngModel)]="code" (init)="onEditorInit($event)" class="h-full w-full"></ngx-monaco-editor>
          </div>

          <!-- Actions & Metrics row -->
          <div class="px-4 py-3 bg-brand-surface border-t border-brand-border flex items-center justify-between shrink-0">
            <div class="flex items-center gap-4 text-[10px] text-brand-textMuted font-bold uppercase">
              <span>Chars: <strong class="text-white">{{ charCount() }}</strong></span>
              <span>Lines: <strong class="text-white">{{ lineCount() }}</strong></span>
              <span>Tokens Est: <strong class="text-white">{{ tokenEstimate() }}</strong></span>
            </div>

            <div class="flex items-center gap-2">
              <button (click)="toggleTerminal()" class="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5">
                <span>🖥️</span> Terminal {{ terminalOpen() ? 'Hide' : 'Show' }}
              </button>
              <button (click)="clearEditor()" class="btn-secondary px-3 py-1.5 text-xs">
                Clear
              </button>
              @if (isGenerating()) {
                <button (click)="cancelGeneration()" class="px-4 py-1.5 text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition duration-150 animate-pulse">
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

          <!-- Resizable Terminal Drawer section -->
          @if (terminalOpen()) {
            <!-- Horizontal Drag Resize Handle (Row Resize) -->
            <div (mousedown)="startDrag($event, 'terminal')"
                 (dblclick)="resetSize('terminal')"
                 class="h-1.5 hover:h-2 bg-transparent hover:bg-brand-highlight/30 cursor-row-resize transition-all shrink-0 z-20 w-full border-t border-brand-border select-none">
            </div>

            <!-- Terminal log list wrapper -->
            <div [style.height.px]="terminalHeight() - 6"
                 class="bg-[#0b0518] flex flex-col font-mono text-[11px] text-indigo-300 shrink-0 select-text transition-all duration-75 overflow-hidden">
              <div class="px-4 py-2 border-b border-brand-border bg-black/20 flex items-center justify-between shrink-0 text-white/50 text-[10px] font-bold uppercase select-none">
                <span>🖥️ Developer terminal drawer</span>
                <div class="flex gap-2">
                  <button (click)="clearTerminal()" class="hover:text-white transition duration-150">Clear Logs</button>
                  <button (click)="terminalOpen.set(false)" class="hover:text-white transition duration-150">×</button>
                </div>
              </div>
              <div class="flex-1 p-3 overflow-y-auto space-y-1" #terminalScrollContainer>
                @for (log of terminalLogs(); track log.timestamp) {
                  <div class="flex items-start gap-2">
                    <span class="text-white/30 shrink-0">[{{ log.timestamp }}]</span>
                    <span [ngClass]="{ 'text-emerald-400': log.type === 'SUCCESS', 'text-amber-400 animate-pulse': log.type === 'WARN', 'text-rose-400': log.type === 'ERROR', 'text-brand-highlight': log.type === 'INFO' }"
                          class="shrink-0 font-bold uppercase tracking-wider">[{{ log.type }}]</span>
                    <span class="text-white/80 leading-relaxed font-semibold">{{ log.message }}</span>
                  </div>
                }
                @if (terminalLogs().length === 0) {
                  <div class="text-white/30 text-center py-8">Console idle. Execute AI review tools to record logs.</div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Right Panel Draggable Vertical Handle (Col Resize) -->
        @if (!rightPanelCollapsed()) {
          <div (mousedown)="startDrag($event, 'right')"
               (dblclick)="resetSize('right')"
               class="w-1.5 hover:w-2 bg-transparent hover:bg-brand-highlight/30 cursor-col-resize transition-all shrink-0 z-20 h-full border-l border-brand-border select-none">
          </div>
        }

        <!-- COLUMN 3: AI Response Stream Viewer & Tabs output -->
        <div [style.width.px]="rightPanelCollapsed() ? 0 : rightPanelWidth()"
             [ngClass]="{ 'hidden': rightPanelCollapsed() }"
             class="flex flex-col bg-brand-bg shrink-0 transition-all duration-75">
          
          <!-- Tab selectors output -->
          <div class="px-4 bg-brand-surface border-b border-brand-border flex items-center justify-between shrink-0 pt-2.5">
            <div class="flex flex-1">
              <button (click)="outputTab.set('markdown')"
                      [class]="outputTab() === 'markdown' ? 'bg-brand-bg border-t border-x border-brand-border text-brand-highlight font-bold' : 'text-brand-textMuted/65 hover:text-white'"
                      class="flex-1 py-2 text-xs font-bold rounded-t-lg transition duration-150 select-none">
                Analysis Report
              </button>
              <button (click)="outputTab.set('diff')"
                      [class]="outputTab() === 'diff' ? 'bg-brand-bg border-t border-x border-brand-border text-brand-highlight font-bold' : 'text-brand-textMuted/65 hover:text-white'"
                      class="flex-1 py-2 text-xs font-bold rounded-t-lg transition duration-150 select-none">
                Diff Viewer
              </button>
            </div>
            <button (click)="toggleRightPanel()" class="px-2 py-2 text-white/50 hover:text-white transition duration-150 text-xs font-bold select-none" title="Collapse AI Panel">▶</button>
          </div>

          <!-- Header actions -->
          <div class="px-4 py-2 bg-brand-surface border-b border-brand-border flex items-center justify-between shrink-0">
            <span class="text-[10px] font-bold text-white uppercase tracking-wider">AI Response Output</span>
            
            <div class="flex items-center gap-2">
              <label class="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" [(ngModel)]="autoScroll" class="rounded border-brand-border bg-brand-editorBg text-brand-accent focus:ring-brand-accent">
                <span class="text-[9px] text-brand-textMuted font-bold uppercase">AutoScroll</span>
              </label>

              <button (click)="copyResponse()" [disabled]="!responseStream()" class="p-1 rounded bg-brand-editorBg border border-brand-border hover:text-brand-highlight text-white disabled:opacity-40 text-[10px]" title="Copy to Clipboard">
                📋 Copy
              </button>

              <select (change)="exportResponse($event)" [disabled]="!responseStream()"
                      class="bg-brand-editorBg border border-brand-border text-[10px] font-bold uppercase rounded-lg px-2 py-1 focus:outline-none text-white">
                <option value="">Export</option>
                <option value="md">Markdown (.md)</option>
                <option value="txt">Text (.txt)</option>
                <option value="pdf">PDF Mock (.pdf.txt)</option>
              </select>
            </div>
          </div>

          <!-- Tab Content 1: Markdown Report Viewer -->
          @if (outputTab() === 'markdown') {
            <div class="flex-1 overflow-y-auto p-6 bg-brand-editorBg border-l-[6px] border-brand-accent relative select-text" #scrollContainer>
              @if (!responseStream() && !isGenerating()) {
                <div class="flex flex-col items-center justify-center h-full text-center p-6 text-brand-textMuted select-none">
                  <div class="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-xl mb-4 shadow-low animate-bounce">
                    💡
                  </div>
                  <h4 class="text-sm font-extrabold text-white font-title">Workspace Assistant Guide</h4>
                  <div class="text-[11px] max-w-xs mt-3 text-brand-textMuted/70 space-y-2 border border-white/5 bg-white/5 rounded-xl p-3.5 text-left font-semibold">
                    <div class="flex items-start gap-1.5">
                      <span class="text-brand-highlight">1.</span>
                      <span>Paste your source code in the editor.</span>
                    </div>
                    <div class="flex items-start gap-1.5">
                      <span class="text-brand-highlight">2.</span>
                      <span>Select an operations tool from the config menu.</span>
                    </div>
                    <div class="flex items-start gap-1.5">
                      <span class="text-brand-highlight">3.</span>
                      <span>Click <strong class="text-white">Run Analysis</strong> to stream results.</span>
                    </div>
                  </div>
                  <p class="text-[10px] mt-4 text-brand-textMuted/55">Or use prompt templates to quickly prefill layouts.</p>
                </div>
              }

              <!-- Shimmer skeleton when generating and stream hasn't started yet -->
              @if (isGenerating() && !responseStream()) {
                <!-- AI Thinking checklist timeline -->
                <div class="space-y-4 py-2 border-b border-white/5 mb-6 select-none">
                  <span class="text-[10px] uppercase font-bold text-white/40 block mb-2 font-mono">Running AI steps checklist...</span>
                  @for (step of thinkingSteps; track step.label) {
                    <div class="flex items-center gap-2 text-xs font-semibold">
                      @if (step.status === 'done') {
                        <span class="text-emerald-400">✓</span>
                      } @else if (step.status === 'running') {
                        <span class="text-brand-highlight animate-pulse font-black">&bull;</span>
                      } @else {
                        <span class="text-white/20 font-bold">&bull;</span>
                      }
                      <span [ngClass]="step.status === 'running' ? 'text-white' : 'text-brand-textMuted/50'">{{ step.label }}</span>
                    </div>
                  }
                </div>

                <div class="space-y-4 animate-pulse-slow">
                  <div class="h-4 bg-white/10 rounded w-3/4 animate-shimmer"></div>
                  <div class="h-4 bg-white/10 rounded w-5/6 animate-shimmer"></div>
                  <div class="h-4 bg-white/10 rounded w-2/3 animate-shimmer"></div>
                  <div class="h-4 bg-white/10 rounded w-1/2 animate-shimmer"></div>
                </div>
              }

              <!-- Streaming results -->
              <div class="prose prose-slate text-sm max-w-none text-brand-text leading-relaxed break-words"
                   [innerHTML]="renderedMarkdown()">
              </div>

              <!-- Typing cursor block -->
              @if (isGenerating() && responseStream()) {
                <span class="inline-block w-2.5 h-4 ml-1 bg-brand-highlight animate-pulse align-middle"></span>
              }
            </div>
          }

          <!-- Tab Content 2: Original vs Suggested Diff View -->
          @if (outputTab() === 'diff') {
            <div class="flex-1 flex flex-col gap-2.5 p-4 bg-brand-editorBg overflow-y-auto select-none">
              @if (!fixedCode()) {
                <div class="flex flex-col items-center justify-center h-full text-center p-6 text-brand-textMuted">
                  <span class="text-4xl mb-3">🔀</span>
                  <h4 class="text-xs font-extrabold text-white uppercase tracking-wider font-title">No AI code fixes parsed yet</h4>
                  <p class="text-[10px] max-w-xs mt-1.5 leading-relaxed text-brand-textMuted/60">
                    Run reviews or bug checkers that generate code changes. We will extract them and display them in a side-by-side comparative layout.
                  </p>
                </div>
              } @else {
                <div class="flex flex-col h-full gap-3 overflow-hidden">
                  <!-- Original Box -->
                  <div class="flex-1 flex flex-col border border-white/5 bg-[#120A24] rounded-xl overflow-hidden min-h-[180px]">
                    <div class="px-3.5 py-1.5 bg-black/35 text-[9px] font-bold text-white/55 uppercase border-b border-white/5 flex items-center justify-between">
                      <span>Original Code</span>
                      <span class="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1 py-0.5 rounded text-[8px]">Unmodified</span>
                    </div>
                    <div class="flex-1 relative">
                      <ngx-monaco-editor [options]="diffReadOnlyOptions" [ngModel]="code" class="h-full w-full"></ngx-monaco-editor>
                    </div>
                  </div>

                  <!-- Fixed / Suggestion Box -->
                  <div class="flex-1 flex flex-col border border-brand-highlight/20 bg-[#120A24] rounded-xl overflow-hidden min-h-[180px]">
                    <div class="px-3.5 py-1.5 bg-brand-highlight/10 text-[9px] font-bold text-brand-highlight uppercase border-b border-brand-highlight/25 flex items-center justify-between">
                      <span>Suggested Fixes</span>
                      <span class="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded text-[8px] animate-pulse">Modified</span>
                    </div>
                    <div class="flex-1 relative">
                      <ngx-monaco-editor [options]="diffReadOnlyOptions" [ngModel]="fixedCode()" class="h-full w-full"></ngx-monaco-editor>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
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
  private route = inject(ActivatedRoute);
  private commandPaletteService = inject(CommandPaletteService);
  private notifService = inject(NotificationService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('terminalScrollContainer') private terminalScrollContainer!: ElementRef;

  // Sizing Signals (Resizable panel heights and widths)
  sidebarWidth = signal<number>(280);
  rightPanelWidth = signal<number>(450);
  terminalHeight = signal<number>(176);

  sidebarCollapsed = signal<boolean>(false);
  rightPanelCollapsed = signal<boolean>(false);

  private activeDrag: 'sidebar' | 'right' | 'terminal' | null = null;

  // Active Workspace signal state
  user = this.authService.currentUserSignal;
  historyList = signal<WorkspaceSessionResponse[]>([]);
  selectedTool = signal<string>('CODE_REVIEW');
  isGenerating = signal<boolean>(false);
  responseStream = signal<string>('');
  activeSessionId = signal<string | null>(null);

  // Tab views toggle signals
  sidebarTab = signal<string>('prompts');
  outputTab = signal<string>('markdown');
  terminalOpen = signal<boolean>(true);

  // IDE Multi-Tabs configurations
  activeTabId = signal<string>('tab-1');
  workspaceTabs = signal<WorkspaceTab[]>([
    { id: 'tab-1', title: 'Bug Reviewer', code: 'public class Calculator {\n    public int divide(int a, int b) {\n        return a / b; // Bug: Potential division by zero\n    }\n}', language: 'java', selectedTool: 'BUG_FINDER', responseStream: '', activeSessionId: null },
    { id: 'tab-2', title: 'Explainer', code: 'def fibonacci(n):\n    if n <= 0:\n        return []\n    elif n == 1:\n        return [0]\n    fib = [0, 1]\n    while len(fib) < n:\n        fib.append(fib[-1] + fib[-2])\n    return fib', language: 'python', selectedTool: 'EXPLAIN_CODE', responseStream: '', activeSessionId: null },
    { id: 'tab-3', title: 'Unit Creator', code: 'import React, { useState, useEffect } from \'react\';\n\nexport const Timer = () => {\n  const [seconds, setSeconds] = useState(0);\n  useEffect(() => {\n    const interval = setInterval(() => setSeconds(s => s + 1), 1000);\n    return () => clearInterval(interval);\n  }, []);\n  return <div>Seconds: {seconds}</div>;\n};', language: 'typescript', selectedTool: 'UNIT_TEST', responseStream: '', activeSessionId: null }
  ]);

  // Terminal Logs signal
  terminalLogs = signal<TerminalLog[]>([
    { timestamp: new Date().toLocaleTimeString(), type: 'INFO', message: 'DevMind AI workspace initialized. Terminal Resizable.' },
    { timestamp: new Date().toLocaleTimeString(), type: 'INFO', message: 'External Monaco dependencies loaded successfully.' }
  ]);

  // AI Thinking Steps
  thinkingSteps = [
    { id: 'parse', label: 'Parsing code blocks structures', status: 'done' as const },
    { id: 'lang', label: 'Detecting source language scopes', status: 'done' as const },
    { id: 'prompt', label: 'Building context model prompts', status: 'done' as const },
    { id: 'reason', label: 'Streaming AI query analysis vectors', status: 'running' as const },
    { id: 'format', label: 'Formatting response markdown text', status: 'pending' as const }
  ];

  // Form states mapping current tab
  code = '';
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

  diffReadOnlyOptions = {
    theme: 'devmind-dark',
    readOnly: true,
    fontSize: 12,
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

  // Extract Code blocks to populate comparative Diff views
  fixedCode = computed(() => {
    const stream = this.responseStream();
    if (!stream) return '';
    const match = stream.match(/```(?:\w*)\n([\s\S]*?)```/);
    return match ? match[1].trim() : '';
  });

  promptLibrary = [
    { icon: '👁️', title: 'Audit Code Review', desc: 'Scan variables, structures, and class separations for OOP design flaws.', instructions: 'Examine code logic and design choices.' },
    { icon: '🐛', title: 'Bug & Leak Finder', desc: 'Trace SQL injections, thread safety locks, and unclosed resources.', instructions: 'Identify potential issues, division errors, and leaks.' },
    { icon: '🧠', title: 'Complexity Deconstruction', desc: 'Analyze time-space complexities and algorithm nesting depths.', instructions: 'Deconstruct complexity and provide walkthroughs.' },
    { icon: '🧪', title: 'Generate Mock Assertions', desc: 'Create test classes using standard frameworks and parameter mocks.', instructions: 'Write assertions, mocks, and edge-case covers.' },
    { icon: '📝', title: 'Construct Documentation', desc: 'Produce clean docs, parameters, and exception tags.', instructions: 'Write professional Javadoc/Docstrings for current script.' }
  ];

  boilerplateTemplates = [
    { icon: '🌱', name: 'Spring Controller', language: 'java', tool: 'CODE_REVIEW', code: `@RestController\n@RequestMapping("/api/v1/users")\npublic class UserController {\n    @Autowired\n    private UserService userService;\n\n    @GetMapping\n    public ResponseEntity<List<User>> getAll() {\n        return ResponseEntity.ok(userService.findAll());\n    }\n}` },
    { icon: '⚛️', name: 'React State Hook', language: 'typescript', tool: 'EXPLAIN_CODE', code: `import { useState, useEffect } from 'react';\n\nexport function useLocalStorage<T>(key: string, initialValue: T) {\n  const [value, setValue] = useState<T>(() => {\n    const saved = localStorage.getItem(key);\n    return saved ? JSON.parse(saved) : initialValue;\n  });\n  useEffect(() => {\n    localStorage.setItem(key, JSON.stringify(value));\n  }, [key, value]);\n  return [value, setValue] as const;\n}` },
    { icon: '🟢', name: 'Express API Route', language: 'typescript', tool: 'BUG_FINDER', code: `import express, { Request, Response } from 'express';\nconst router = express.Router();\n\nrouter.post('/login', async (req: Request, res: Response) => {\n  const { username, password } = req.body;\n  if (!username || !password) {\n    return res.status(400).json({ error: 'Missing credentials' });\n  }\n  res.json({ success: true });\n});` },
    { icon: '🐳', name: 'Dockerfile Layer', language: 'sql', tool: 'COMPLEXITY', code: `FROM maven:3.8-openjdk-17 AS build\nCOPY src /home/app/src\nCOPY pom.xml /home/app\nRUN mvn -f /home/app/pom.xml clean package\n\nFROM openjdk:17-slim\nCOPY --from=build /home/app/target/*.jar app.jar\nEXPOSE 8080\nENTRYPOINT ["java","-jar","/app.jar"]` }
  ];

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

  private editorInstance: any = null;

  onEditorInit(editor: any) {
    this.editorInstance = editor;
    const monaco = (window as any).monaco;
    if (monaco) {
      monaco.editor.setTheme(this.selectedTheme);
    }
    const model = editor.getModel();
    if (model) {
      editor.setModelLanguage(model, this.selectedLanguage.toLowerCase());
    }
  }

  @HostListener('window:keydown.control.enter', ['$event'])
  onCtrlEnter(event: KeyboardEvent): void {
    if (this.code.trim() && !this.isGenerating()) {
      event.preventDefault();
      this.runAnalysis();
    }
  }

  // Draggable Resize calculation listeners
  @HostListener('document:mousemove', ['$event'])
  onMouseMoveResize(event: MouseEvent): void {
    if (!this.activeDrag) return;

    if (this.activeDrag === 'sidebar') {
      const newWidth = Math.max(220, Math.min(500, event.clientX));
      this.sidebarWidth.set(newWidth);
      localStorage.setItem('devmind_sidebar_width', String(newWidth));
    } else if (this.activeDrag === 'right') {
      const newWidth = Math.max(320, Math.min(700, window.innerWidth - event.clientX));
      this.rightPanelWidth.set(newWidth);
      localStorage.setItem('devmind_right_width', String(newWidth));
    } else if (this.activeDrag === 'terminal') {
      const maxHeight = window.innerHeight * 0.6;
      const newHeight = Math.max(40, Math.min(maxHeight, window.innerHeight - event.clientY));
      this.terminalHeight.set(newHeight);
      localStorage.setItem('devmind_terminal_height', String(newHeight));
    }
  }

  @HostListener('document:mouseup')
  onMouseUpResize(): void {
    if (this.activeDrag) {
      this.activeDrag = null;
      document.body.style.cursor = '';
    }
  }

  ngOnInit() {
    this.loadHistory();

    // Restore sizing configurations from LocalStorage
    const cachedSidebar = localStorage.getItem('devmind_sidebar_width');
    if (cachedSidebar) this.sidebarWidth.set(Number(cachedSidebar));

    const cachedRight = localStorage.getItem('devmind_right_width');
    if (cachedRight) this.rightPanelWidth.set(Number(cachedRight));

    const cachedTerminal = localStorage.getItem('devmind_terminal_height');
    if (cachedTerminal) this.terminalHeight.set(Number(cachedTerminal));

    // Restore Tab 1 active values initially
    this.restoreTabValues('tab-1');

    // Listen to query params
    this.route.queryParams.subscribe(params => {
      if (params['sessionId']) {
        this.workspaceService.getSession(params['sessionId']).subscribe({
          next: (res) => {
            if (res.data) {
              this.loadSession(res.data);
            }
          },
          error: () => this.toastr.error('Failed to load session details', 'Error')
        });
      }
      if (params['toolType']) {
        this.selectedTool.set(params['toolType']);
      }
      if (params['applyTpl']) {
        const found = this.templates.find(t => t.name === params['applyTpl']);
        if (found) this.applyTemplate(found);
      }
    });

    // Listen to palette actions
    this.commandPaletteService.actionTriggered.subscribe(action => {
      if (['CODE_REVIEW', 'BUG_FINDER', 'EXPLAIN_CODE', 'UNIT_TEST', 'DOCUMENTATION', 'COMPLEXITY', 'COMMIT_GENERATOR'].includes(action)) {
        this.selectedTool.set(action);
      }
      
      else if (action === 'TOGGLE_WORD_WRAP') {
        this.wordWrap = !this.wordWrap;
        this.onWordWrapChange();
      } else if (action === 'INCREASE_FONT_SIZE') {
        this.fontSize = Math.min(24, this.fontSize + 1);
        this.onFontSizeChange();
      } else if (action === 'DECREASE_FONT_SIZE') {
        this.fontSize = Math.max(10, this.fontSize - 1);
        this.onFontSizeChange();
      } else if (action === 'CLEAR_EDITOR') {
        this.clearEditor();
      } else if (action === 'SWITCH_PROVIDER_GEMINI') {
        this.selectedProvider = 'gemini';
      } else if (action === 'SWITCH_PROVIDER_OPENAI') {
        this.selectedProvider = 'openai';
      } else if (action === 'SWITCH_PROVIDER_CLAUDE') {
        this.selectedProvider = 'claude';
      } else if (action === 'CHANGE_THEME_BRAND') {
        this.selectedTheme = 'devmind-dark';
        this.onThemeChange();
      } else if (action === 'CHANGE_THEME_VS_DARK') {
        this.selectedTheme = 'vs-dark';
        this.onThemeChange();
      } else if (action === 'CHANGE_THEME_VS') {
        this.selectedTheme = 'vs';
        this.onThemeChange();
      }

      else if (action.startsWith('APPLY_TEMPLATE_')) {
        const tplName = action.replace('APPLY_TEMPLATE_', '').replace(/_/g, ' ');
        const found = this.templates.find(t => t.name.toLowerCase() === tplName.toLowerCase());
        if (found) this.applyTemplate(found);
      }

      else if (action === 'TRIGGER_ANALYSIS') {
        this.runAnalysis();
      } else if (action === 'TRIGGER_BACKGROUND_JOB') {
        this.runBackground();
      } else if (action === 'COPY_RESPONSE') {
        this.copyResponse();
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
    this.scrollTerminalToBottom();
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

  // Sizing operations
  startDrag(event: MouseEvent, panel: 'sidebar' | 'right' | 'terminal'): void {
    event.preventDefault();
    this.activeDrag = panel;
    document.body.style.cursor = panel === 'terminal' ? 'row-resize' : 'col-resize';
  }

  resetSize(panel: 'sidebar' | 'right' | 'terminal'): void {
    if (panel === 'sidebar') {
      this.sidebarWidth.set(280);
      localStorage.removeItem('devmind_sidebar_width');
    } else if (panel === 'right') {
      this.rightPanelWidth.set(450);
      localStorage.removeItem('devmind_right_width');
    } else if (panel === 'terminal') {
      this.terminalHeight.set(176);
      localStorage.removeItem('devmind_terminal_height');
    }
    this.addTerminalLog('INFO', `Reset panel dimension to default settings for: ${panel}`);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  toggleRightPanel(): void {
    this.rightPanelCollapsed.set(!this.rightPanelCollapsed());
  }

  // Workspace IDE Tabs logic
  selectTab(id: string): void {
    if (this.activeTabId() === id) return;
    this.backupTabValues(this.activeTabId());
    this.activeTabId.set(id);
    this.restoreTabValues(id);
    this.addTerminalLog('INFO', `Switched active workspace session to tab "${id}"`);
  }

  closeTab(event: Event, id: string): void {
    event.stopPropagation();
    const tabs = this.workspaceTabs();
    if (tabs.length <= 1) {
      this.toastr.warning('Cannot close the last remaining editor tab.', 'Tab Controller');
      return;
    }

    const index = tabs.findIndex(t => t.id === id);
    this.workspaceTabs.update(list => list.filter(t => t.id !== id));
    
    if (this.activeTabId() === id) {
      const nextTab = tabs[index === 0 ? 1 : index - 1];
      this.activeTabId.set(nextTab.id);
      this.restoreTabValues(nextTab.id);
    }
    this.addTerminalLog('WARN', `Closed editor tab "${id}"`);
  }

  createNewTab(): void {
    const id = `tab-${Math.random().toString(36).substring(2, 9)}`;
    const newTab: WorkspaceTab = {
      id,
      title: `Snippet ${this.workspaceTabs().length + 1}`,
      code: '// Write code here',
      language: 'java',
      selectedTool: 'CODE_REVIEW',
      responseStream: '',
      activeSessionId: null
    };

    this.workspaceTabs.update(list => [...list, newTab]);
    this.selectTab(id);
    this.addTerminalLog('INFO', `Created new workspace editor tab "${id}"`);
  }

  private backupTabValues(id: string): void {
    this.workspaceTabs.update(list => list.map(t => {
      if (t.id === id) {
        return {
          ...t,
          code: this.code,
          language: this.selectedLanguage,
          selectedTool: this.selectedTool(),
          responseStream: this.responseStream(),
          activeSessionId: this.activeSessionId()
        };
      }
      return t;
    }));
  }

  private restoreTabValues(id: string): void {
    const found = this.workspaceTabs().find(t => t.id === id);
    if (found) {
      this.code = found.code;
      this.selectedLanguage = found.language;
      this.selectedTool.set(found.selectedTool);
      this.responseStream.set(found.responseStream);
      this.activeSessionId.set(found.activeSessionId);
      this.onLanguageChange();
    }
  }

  // Prompt actions
  applyPrompt(prompt: any): void {
    this.addTerminalLog('INFO', `Applied custom prompt template: ${prompt.title}`);
    this.notifService.addNotification('Prompt Applied 👁️', `Prompt selected: "${prompt.title}"`, 'info');
    this.code = `/* AI Directive: ${prompt.instructions} */\n` + this.code;
  }

  // Boilerplate actions
  applyBoilerplate(tpl: any): void {
    this.selectedLanguage = tpl.language;
    this.selectedTool.set(tpl.tool);
    this.code = tpl.code;
    this.onLanguageChange();
    this.addTerminalLog('INFO', `Boilerplate boilerplate loaded: ${tpl.name}`);
    this.notifService.addNotification('Starter Template Inserted 📝', `Successfully loaded standard boilerplate ${tpl.name}`, 'info');
  }

  applyTemplate(tpl: any) {
    this.selectedLanguage = tpl.language;
    this.selectedTool.set(tpl.tool);
    this.code = tpl.code;
    this.onLanguageChange();
    this.notifService.addNotification('Template Loaded 📝', `Loaded standard review template for: ${tpl.name}`, 'info');
  }

  onLanguageChange() {
    this.editorOptions = { ...this.editorOptions, language: this.selectedLanguage };
  }

  onThemeChange() {
    this.editorOptions = { ...this.editorOptions, theme: this.selectedTheme };
    this.diffReadOnlyOptions = { ...this.diffReadOnlyOptions, theme: this.selectedTheme };
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
    this.addTerminalLog('WARN', 'Monaco code editor cleared.');
  }

  cancelGeneration() {
    if (this.abortController) {
      this.abortController.abort();
      this.isGenerating.set(false);
      this.toastr.info('AI analysis generation cancelled.', 'Cancelled');
      this.notifService.addNotification('Analysis Cancelled ⚠️', 'User aborted the streaming response engine execution.', 'warning');
      this.addTerminalLog('ERROR', 'AI analysis query process cancelled by client host.');
    }
  }

  // Terminal logging logic
  addTerminalLog(type: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR', message: string): void {
    const time = new Date().toLocaleTimeString();
    this.terminalLogs.update(logs => [...logs, { timestamp: time, type, message }]);
  }

  clearTerminal(): void {
    this.terminalLogs.set([]);
  }

  toggleTerminal(): void {
    this.terminalOpen.set(!this.terminalOpen());
  }

  runAnalysis() {
    if (!this.code.trim()) return;

    this.isGenerating.set(true);
    this.responseStream.set('');
    this.activeSessionId.set(null);
    this.abortController = new AbortController();

    this.addTerminalLog('INFO', `$ devmind-ai analyze --tool=${this.selectedTool()} --language=${this.selectedLanguage} --provider=${this.selectedProvider}`);
    this.addTerminalLog('INFO', 'Connecting to LLM registry stream endpoints...');

    // Progress scanning checkpoints
    this.thinkingSteps.forEach((s, idx) => {
      s.status = idx === 0 ? 'running' as const : 'pending' as const;
    });

    // Simulate thinking steps ticks prior to response stream chunks arrivals
    setTimeout(() => {
      if (this.isGenerating()) {
        this.thinkingSteps[0].status = 'done';
        this.thinkingSteps[1].status = 'running';
        this.addTerminalLog('INFO', 'Successfully detected source scope maps.');
      }
    }, 400);

    setTimeout(() => {
      if (this.isGenerating()) {
        this.thinkingSteps[1].status = 'done';
        this.thinkingSteps[2].status = 'running';
        this.addTerminalLog('INFO', 'Model prompt context successfully constructed.');
      }
    }, 800);

    setTimeout(() => {
      if (this.isGenerating()) {
        this.thinkingSteps[2].status = 'done';
        this.thinkingSteps[3].status = 'running';
        this.addTerminalLog('INFO', 'Receiving chunk buffers. Streaming output...');
      }
    }, 1200);

    const payload = {
      code: this.code,
      toolType: this.selectedTool(),
      language: this.selectedLanguage,
      provider: this.selectedProvider
    };

    this.workspaceService.analyzeStream(
      payload,
      (chunk) => {
        let text = chunk;
        if (text.startsWith('"') && text.endsWith('"')) {
          text = text.substring(1, text.length - 1);
        }
        text = text.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t');
        this.responseStream.update(s => s + text);
      },
      () => {
        this.isGenerating.set(false);
        this.thinkingSteps[3].status = 'done';
        this.thinkingSteps[4].status = 'done';
        
        this.toastr.success('AI analysis complete!', 'Success');
        this.addTerminalLog('SUCCESS', 'AI query returned code 200. Review completed successfully.');
        this.notifService.addNotification(
          'Analysis Completed ✅',
          `Successfully processed ${this.selectedTool().replace(/_/g, ' ')} operation on ${this.selectedLanguage} script.`,
          'success'
        );
        this.loadHistory();
      },
      (err) => {
        this.isGenerating.set(false);
        const errMsg = err.message || 'Error occurred during streaming.';
        this.toastr.error(errMsg, 'Error');
        this.addTerminalLog('ERROR', `Stream error: ${errMsg}`);
        this.notifService.addNotification('Analysis Failed 🚨', `Error: ${errMsg}`, 'danger');
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

    this.addTerminalLog('INFO', `Submitting background worker job for async execution...`);

    this.jobsService.submitJob(payload).subscribe({
      next: (res) => {
        this.toastr.success('Background job submitted successfully!', 'Success');
        this.addTerminalLog('SUCCESS', 'Asynchronous job queued under ID: ' + res.data.id);
        this.notifService.addNotification(
          'Job Queued 🚀',
          `Asynchronous task successfully submitted to the worker backlog queue.`,
          'success'
        );
        this.router.navigate(['/jobs']);
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to submit background job';
        this.toastr.error(msg, 'Error');
        this.addTerminalLog('ERROR', `Job submission failed: ${msg}`);
        this.notifService.addNotification('Job Submission Failed 🚨', `Error: ${msg}`, 'danger');
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
    this.notifService.addNotification('Workspace Loaded 📝', `Restored session history: "${item.title}"`, 'info');
    this.addTerminalLog('INFO', `Restored database session ID: ${item.id}`);
  }

  toggleFavorite(event: Event, item: WorkspaceSessionResponse) {
    event.stopPropagation();
    this.workspaceService.toggleFavorite(item.id).subscribe({
      next: () => {
        const nextState = !item.favorite;
        this.toastr.success('Favorite status updated.', 'Success');
        this.notifService.addNotification(
          nextState ? 'Session Starred ⭐' : 'Session Unstarred ☆',
          `Updated favorites ranking index for "${item.title}".`,
          'info'
        );
        this.loadHistory();
      }
    });
  }

  togglePin(event: Event, item: WorkspaceSessionResponse) {
    event.stopPropagation();
    this.workspaceService.togglePin(item.id).subscribe({
      next: () => {
        const nextState = !item.pinned;
        this.toastr.success('Pin status updated.', 'Success');
        this.notifService.addNotification(
          nextState ? 'Session Pinned 📌' : 'Session Unpinned 📍',
          `Saved pinned session state for "${item.title}".`,
          'info'
        );
        this.loadHistory();
      }
    });
  }

  deleteSession(event: Event, id: string) {
    event.stopPropagation();
    this.workspaceService.deleteSession(id).subscribe({
      next: () => {
        this.toastr.success('Session deleted successfully.', 'Success');
        this.notifService.addNotification('Session Deleted 🗑️', 'Removed historical audit record from logs.', 'warning');
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
      filename += '.pdf.txt';
      mimeType = 'text/plain';
      const heading = `=========================================\n DEVMIND AI - REPORT EXPORT\n=========================================\n`;
      const doc = heading + `Generated: ${new Date().toLocaleString()}\nTool: ${this.selectedTool()}\nLanguage: ${this.selectedLanguage}\n\n` + data;
      this.triggerDownload(doc, filename, mimeType);
      return;
    }

    this.triggerDownload(data, filename, mimeType);
    if (event.target) {
      (event.target as HTMLSelectElement).value = '';
    }
  }

  private triggerDownload(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.notifService.addNotification('Report Exported 💾', `Downloaded report data block as file: ${filename}`, 'success');
  }

  private scrollToBottom() {
    if (this.autoScroll && this.scrollContainer) {
      try {
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      } catch (e) {}
    }
  }

  private scrollTerminalToBottom() {
    if (this.terminalScrollContainer) {
      try {
        const el = this.terminalScrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      } catch (e) {}
    }
  }

  parseMarkdown(text: string): string {
    if (!text) return '';
    let html = text;

    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    html = html.replace(codeBlockRegex, (match, lang, codeCode) => {
      const cleanCode = codeCode.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      return `<div class="my-4 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 font-mono text-sm">
        <div class="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400 font-bold">
          <span>${lang || 'code'}</span>
          <button onclick="navigator.clipboard.writeText(\`${cleanCode}\`)" class="hover:text-white transition duration-150 font-semibold bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700">Copy</button>
        </div>
        <pre class="p-4 overflow-x-auto text-indigo-300"><code>${codeCode}</code></pre>
      </div>`;
    });

    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-900/60 border border-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs font-medium">$1</code>');

    html = html.replace(/^\s*###\s+(.+)$/gm, '<h3 class="text-sm font-bold text-indigo-400 mt-4 mb-2 uppercase tracking-wide border-b border-slate-900/50 pb-1">$1</h3>');
    html = html.replace(/^\s*##\s+(.+)$/gm, '<h2 class="text-base font-bold text-indigo-300 mt-5 mb-2.5">$1</h2>');
    html = html.replace(/^\s*#\s+(.+)$/gm, '<h1 class="text-lg font-extrabold text-white mt-6 mb-3 border-b border-slate-800 pb-1.5">$1</h1>');

    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-200">$1</strong>');

    html = html.replace(/^\s*-\s+(.+)$/gm, '<li class="ml-4 list-disc text-slate-300 my-1 font-medium">$1</li>');

    html = html.replace(/\n/g, '<br>');

    return html;
  }
}
