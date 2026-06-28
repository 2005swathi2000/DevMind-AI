import { Component, OnInit, signal, HostListener, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { getApiBaseUrl } from '../../core/services/api-config';

interface FAQItem {
  question: string;
  answer: string;
  open: boolean;
}

interface SupportMessage {
  sender: 'bot' | 'user';
  text: string;
  timestamp?: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-landing-gradient text-slate-100 font-sans overflow-x-hidden relative select-none">
      
      <!-- Mouse Glow Radial Overlay (follows cursor) -->
      <div class="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 hidden md:block"
           [style.background]="'radial-gradient(550px at ' + mouseX + 'px ' + mouseY + 'px, rgba(99, 102, 241, 0.05), transparent 80%)'">
      </div>

      <!-- Ambient Glow Blobs & Subtle Grid Overlay -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute top-[10%] left-[8%] w-[600px] h-[600px] rounded-full bg-[#7C3AED]/10 blur-[130px]"></div>
        <div class="absolute top-[30%] right-[5%] w-[700px] h-[700px] rounded-full bg-[#4F46E5]/10 blur-[140px]"></div>
        <div class="absolute bottom-[15%] left-[15%] w-[600px] h-[600px] rounded-full bg-[#06B6D4]/10 blur-[120px]"></div>
        <div class="absolute inset-0 grid-bg opacity-5"></div>
      </div>

      <!-- Glowing Pink/Purple Space Nebula Spark Line (SVG Bezier Path) -->
      <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg class="w-full h-full opacity-55" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100,420 Q350,80 820,400 T1600,150" stroke="url(#pink-spark-grad)" stroke-width="26" stroke-linecap="round" filter="url(#glow-blur)" />
          <defs>
            <linearGradient id="pink-spark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FF70BF" stop-opacity="0.9" />
              <stop offset="45%" stop-color="#D552A3" stop-opacity="1" />
              <stop offset="75%" stop-color="#7C3AED" stop-opacity="0.8" />
              <stop offset="100%" stop-color="#06B6D4" stop-opacity="0.5" />
            </linearGradient>
            <filter id="glow-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="38" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      <!-- Transparent Sticky Glass Navbar -->
      <header class="w-full border-b border-white/5 bg-[#09090B]/55 backdrop-blur-xl sticky top-0 z-50 transition duration-300">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] flex items-center justify-center font-bold text-white text-lg shadow-md transition duration-300 hover:rotate-6">
              D
            </div>
            <span class="font-bold text-white tracking-wide text-lg font-title flex items-center gap-1.5">
              DEVMIND <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#FF70BF] to-[#D552A3]">AI</span>
            </span>
          </div>

          <!-- Links -->
          <nav class="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-wider text-slate-300/80">
            <a href="#features" class="hover:text-white transition duration-150">Features</a>
            <a href="#demo" class="hover:text-white transition duration-150">Interactive Demo</a>
            <a href="#pricing" class="hover:text-white transition duration-150">Pricing</a>
            <a href="#stats" class="hover:text-white transition duration-150">Stats</a>
            <a href="#faq" class="hover:text-white transition duration-150">FAQ</a>
          </nav>

          <!-- Buttons -->
          <div class="flex items-center gap-6">
            <a routerLink="/login" class="text-xs font-bold text-slate-300 hover:text-white transition duration-150">
              Sign In
            </a>
            <a routerLink="/register" class="px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:scale-[1.03] transition duration-150 shadow-md">
              Get Started
            </a>
          </div>
        </div>
      </header>

      <!-- Cinematic Hero Section -->
      <section class="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center relative z-10">
        
        <!-- Center Top Tag -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-amber-300 tracking-wide uppercase mb-6 shadow-sm">
          <span>✨</span> Introducing DevMind-AI v2.0
        </div>

        <div class="w-full grid grid-cols-1 lg:grid-cols-4 gap-8 items-center mt-2">
          
          <!-- Left Column: 4 Feature Cards -->
          <div class="lg:col-span-1 flex flex-col gap-6 text-left order-2 lg:order-1">
            
            <div class="glass-card p-5 flex items-start gap-4">
              <div class="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-sm shrink-0 font-bold">
                ⚡
              </div>
              <div>
                <h4 class="text-[11px] font-extrabold text-white uppercase tracking-wider">AI Code Review</h4>
                <p class="text-[10px] text-slate-400 mt-1">Instant, intelligent code reviews</p>
              </div>
            </div>

            <div class="glass-card p-5 flex items-start gap-4">
              <div class="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 text-sm shrink-0 font-bold">
                👾
              </div>
              <div>
                <h4 class="text-[11px] font-extrabold text-white uppercase tracking-wider">Bug Finder</h4>
                <p class="text-[10px] text-slate-400 mt-1">Detect issues early and automatically</p>
              </div>
            </div>

            <div class="glass-card p-5 flex items-start gap-4">
              <div class="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-sm shrink-0 font-bold">
                📄
              </div>
              <div>
                <h4 class="text-[11px] font-extrabold text-white uppercase tracking-wider">Docs Generator</h4>
                <p class="text-[10px] text-slate-400 mt-1">Generate clean and accurate docs</p>
              </div>
            </div>

            <div class="glass-card p-5 flex items-start gap-4">
              <div class="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#06B6D4] text-sm shrink-0 font-bold">
                🧪
              </div>
              <div>
                <h4 class="text-[11px] font-extrabold text-white uppercase tracking-wider">Test Generator</h4>
                <p class="text-[10px] text-slate-400 mt-1">Auto-generate unit and integration tests</p>
              </div>
            </div>

          </div>

          <!-- Center Columns: Main Title & CTAs -->
          <div class="lg:col-span-2 flex flex-col items-center text-center px-4 order-1 lg:order-2">
            <h1 class="text-5xl md:text-[66px] font-black text-white leading-[1.08] font-title tracking-tight max-w-lg">
              Code Smarter.<br>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] via-[#FF70BF] to-[#D552A3]">
                Review Faster.
              </span><br>
              Build Better.
            </h1>
            
            <p class="text-xs md:text-sm text-slate-400 max-w-md mt-7 leading-relaxed font-medium">
              The asynchronous, multi-provider AI workspace for modern software engineers. Submit complex projects, capture diagnostics, detect bugs, and auto-generate tests and documentation — in real-time.
            </p>

            <div class="flex flex-col sm:flex-row items-center gap-4 mt-9 w-full justify-center">
              <a routerLink="/register" class="px-8 py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF70BF] to-[#7C3AED] hover:scale-[1.03] hover:shadow-lg hover:shadow-[#FF70BF]/15 transition duration-200 select-none">
                Launch Console Free
              </a>
              <a href="#demo" class="px-8 py-3.5 rounded-xl text-xs font-bold text-white border border-white/10 bg-white/5 hover:bg-white/10 transition duration-200 select-none">
                Try Live Demo
              </a>
            </div>
          </div>

          <!-- Right Column: 3 Feature Cards -->
          <div class="lg:col-span-1 flex flex-col gap-6 text-left order-3">
            
            <div class="glass-card p-5 flex items-start gap-4">
              <div class="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-sm shrink-0 font-bold">
                🧠
              </div>
              <div>
                <h4 class="text-[11px] font-extrabold text-white uppercase tracking-wider">Code Explainer</h4>
                <p class="text-[10px] text-slate-400 mt-1">Explain complex code in simple terms</p>
              </div>
            </div>

            <div class="glass-card p-5 flex items-start gap-4">
              <div class="w-9 h-9 rounded-xl bg-[#FF70BF]/10 border border-[#FF70BF]/30 flex items-center justify-center text-[#FF70BF] text-sm shrink-0 font-bold">
                📈
              </div>
              <div>
                <h4 class="text-[11px] font-extrabold text-white uppercase tracking-wider">Real-time Analysis</h4>
                <p class="text-[10px] text-slate-400 mt-1">Streaming AI insights as you code</p>
              </div>
            </div>

            <div class="glass-card p-5 flex items-start gap-4">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm shrink-0 font-bold">
                🛡️
              </div>
              <div>
                <h4 class="text-[11px] font-extrabold text-white uppercase tracking-wider">Enterprise Ready</h4>
                <p class="text-[10px] text-slate-400 mt-1">Secure, scalable & privacy-focused</p>
              </div>
            </div>

          </div>

        </div>

        <!-- Floating Laptop Mockup Box -->
        <div class="max-w-5xl mx-auto mt-16 relative px-4">
          <!-- Laptop Body wrapper -->
          <div class="relative mx-auto rounded-2xl bg-[#111827] border-4 border-slate-700/30 p-2.5 shadow-2xl">
            <div class="rounded-xl overflow-hidden bg-[#09090B] border border-white/5 relative aspect-video flex flex-col text-left">
              
              <!-- Editor Titlebar -->
              <div class="bg-[#111827] px-4 py-2.5 flex items-center justify-between border-b border-white/5 shrink-0">
                <div class="flex items-center gap-1.5 bg-black/10 px-2 py-1 rounded-lg">
                  <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Source Code</span>
                </div>
                <span class="text-xs text-slate-400 font-mono">Java</span>
                <div class="w-12"></div>
              </div>

              <!-- Editor Inner Split -->
              <div class="flex-1 flex overflow-hidden font-mono text-[9px] md:text-[11px] leading-relaxed">
                <!-- Left panel: Code -->
                <div class="w-1/2 p-5 border-r border-white/5 bg-[#09090B] text-slate-400 select-none">
                  <span class="text-indigo-400 font-bold">public class</span> <span class="text-white">Calculator</span> &#123;
                  <br>&nbsp;&nbsp;<span class="text-indigo-400 font-bold">public int</span> <span class="text-cyan-400">add</span>(<span class="text-indigo-400">int</span> a, <span class="text-indigo-400">int</span> b) &#123;
                  <br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-indigo-400">return</span> a + b;
                  <br>&nbsp;&nbsp;&#125;
                  <br>
                  <br>&nbsp;&nbsp;<span class="text-indigo-400 font-bold">public int</span> <span class="text-cyan-400">divide</span>(<span class="text-indigo-400">int</span> a, <span class="text-indigo-400">int</span> b) &#123;
                  <br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-indigo-400">if</span> (b == 0) &#123;
                  <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-indigo-400">throw new</span> <span class="text-white">IllegalArgumentException</span>("Cannot divide by zero");
                  <br>&nbsp;&nbsp;&nbsp;&nbsp;&#125;
                  <br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-indigo-400">return</span> a / b;
                  <br>&nbsp;&nbsp;&#125;
                  <br>&#125;
                </div>
                
                <!-- Right panel: AI analysis mock -->
                <div class="w-1/2 p-5 bg-[#111827]/40 text-slate-300 flex flex-col gap-2.5">
                  <div class="flex items-center justify-between border-b border-white/5 pb-1">
                    <span class="text-white font-extrabold uppercase text-[9px] tracking-widest flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      AI Analysis (Streaming)
                    </span>
                    <span class="text-[9px] text-slate-500 font-bold uppercase">Active</span>
                  </div>
                  
                  <span class="font-bold text-cyan-400 mt-2 text-[10px] uppercase tracking-wider block">🔍 Issues Found</span>
                  <div class="space-y-2 text-[10px]">
                    <div class="flex items-start gap-1.5">
                      <span class="text-indigo-400">1</span>
                      <span class="text-slate-300">Potential division by zero. Add validation before dividing.</span>
                    </div>
                    <div class="flex items-start gap-1.5">
                      <span class="text-indigo-400">2</span>
                      <span class="text-slate-300">Missing input validation. Consider validating null or invalid inputs.</span>
                    </div>
                  </div>

                  <span class="font-bold text-cyan-400 mt-3 text-[10px] uppercase tracking-wider block">💡 Suggestions</span>
                </div>
              </div>

            </div>
          </div>

          <!-- Floating Widgets -->
          <div class="absolute -top-6 -left-4 glass-card p-4 flex items-center gap-3 animate-bounce" style="animation-duration: 4s;">
            <div class="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg">
              📊
            </div>
            <div class="text-left">
              <span class="text-[10px] block text-slate-400 font-bold uppercase tracking-wider">Total Reviews</span>
              <span class="text-xs font-extrabold text-white">+1,280 Daily</span>
            </div>
          </div>

          <div class="absolute top-[40%] -right-8 glass-card p-4 flex items-center gap-3 animate-bounce" style="animation-duration: 5s;">
            <div class="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[#06B6D4] text-lg">
              🎯
            </div>
            <div class="text-left">
              <span class="text-[10px] block text-slate-400 font-bold uppercase tracking-wider">Accuracy Rate</span>
              <span class="text-xs font-extrabold text-white">99.4% Verified</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Trusted By Section -->
      <section class="border-t border-b border-white/5 bg-[#111827]/10 py-10 relative z-10">
        <div class="max-w-7xl mx-auto px-6 text-center">
          <span class="text-[10px] block text-slate-400 uppercase font-bold tracking-widest mb-6">Trusted by developers at forward-thinking teams</span>
          <div class="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-60">
            <span class="text-lg font-bold text-white font-title">Vercel AI</span>
            <span class="text-lg font-bold text-white font-title">Notion Labs</span>
            <span class="text-lg font-bold text-white font-title">Linear</span>
            <span class="text-lg font-bold text-white font-title">Replicate</span>
            <span class="text-lg font-bold text-white font-title">Supabase</span>
          </div>
        </div>
      </section>

      <!-- Features Showcase Section -->
      <section id="features" class="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <h2 class="text-3xl md:text-5xl font-extrabold text-white font-title tracking-tight">Supercharged AI Capabilities</h2>
          <p class="text-sm text-slate-400 mt-4">
            Everything you need to review syntax, isolate code bottlenecks, and generate comprehensive test structures.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (f of featuresList; track f.title) {
            <div class="glass-card p-6 flex flex-col gap-4">
              <div class="w-12 h-12 rounded-xl bg-indigo-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl shadow">
                {{ f.icon }}
              </div>
              <h3 class="text-lg font-bold text-white font-title">{{ f.title }}</h3>
              <p class="text-xs text-slate-400 leading-relaxed">{{ f.desc }}</p>
              <div class="mt-auto pt-4 flex items-center text-xs font-bold text-cyan-400 cursor-pointer hover:underline gap-1">
                Explore tool <span>&rarr;</span>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Live Demo Section -->
      <section id="demo" class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <span class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25">Sandbox Playground</span>
          <h2 class="text-3xl md:text-5xl font-extrabold text-white font-title tracking-tight mt-4">Interactive SSE Sandbox</h2>
          <p class="text-sm text-slate-400 mt-2">
            Write code on the left and see real-time, token-by-token streaming reviews load instantly.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <!-- Editor Console -->
          <div class="rounded-2xl overflow-hidden bg-[#111827] border border-white/10 shadow-xl flex flex-col h-[380px]">
            <div class="bg-[#1F2937] px-4 py-3 flex items-center justify-between border-b border-white/10 shrink-0">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-rose-500"></span>
                <span class="text-xs text-slate-300 font-semibold font-mono">DemoClass.java</span>
              </div>
              <button (click)="runSimulatedDemo()" [disabled]="demoGenerating()"
                      class="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#FF70BF] to-[#7C3AED] disabled:opacity-40 shadow-md">
                {{ demoGenerating() ? 'Streaming...' : 'Analyze Code' }}
              </button>
            </div>

            <!-- Code input screen -->
            <div class="flex-1 p-5 overflow-y-auto font-mono text-xs text-indigo-200 leading-relaxed bg-[#09090B]">
              <span class="text-indigo-400">public class</span> <span class="text-white">Calculator</span> &#123;
              <br>&nbsp;&nbsp;<span class="text-indigo-400">public int</span> <span class="text-[#06B6D4]">divide</span>(int a, int b) &#123;
              <br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-slate-500">// Bug to find:</span>
              <br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-indigo-400">return</span> a / b;
              <br>&nbsp;&nbsp;&#125;
              <br>&#125;
            </div>
          </div>

          <!-- Simulated Output Console -->
          <div class="rounded-2xl overflow-hidden bg-[#111827] border border-white/10 shadow-xl flex flex-col h-[380px]">
            <div class="bg-[#1F2937] px-4 py-3 border-b border-white/10 shrink-0">
              <span class="text-xs font-bold text-white uppercase tracking-wider">AI Streaming Output</span>
            </div>
            
            <div class="flex-1 p-6 overflow-y-auto font-mono text-xs leading-relaxed bg-[#09090B] relative">
              @if (!demoOutput() && !demoGenerating()) {
                <div class="flex flex-col items-center justify-center h-full text-center text-slate-500">
                  <span class="text-3xl mb-2">⚡</span>
                  <span class="font-bold text-white">Click "Analyze Code" above</span>
                  <p class="text-[10px] mt-1 max-w-[250px]">Watch the SSE engine process this code snippet in real-time.</p>
                </div>
              }

              <!-- Output streaming rendering -->
              <div class="text-slate-300 whitespace-pre-wrap font-medium" [innerHTML]="demoOutput()"></div>

              @if (demoGenerating()) {
                <span class="inline-block w-2.5 h-4 ml-1 bg-cyan-400 animate-pulse align-middle"></span>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Workflow Timeline Section -->
      <section class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <h2 class="text-3xl md:text-5xl font-extrabold text-white font-title tracking-tight">Simple Modern Workflow</h2>
          <p class="text-sm text-slate-400 mt-4">Review code and export audits in four easy steps.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          @for (step of steps; track step.num) {
            <div class="glass-card p-6 flex flex-col gap-3 relative overflow-hidden">
              <div class="absolute -top-3 -right-3 text-7xl font-extrabold text-white/5 select-none font-title">
                {{ step.num }}
              </div>
              <div class="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-cyan-400 text-sm font-bold font-title">
                {{ step.num }}
              </div>
              <h3 class="text-base font-bold text-white font-title">{{ step.title }}</h3>
              <p class="text-xs text-slate-400 leading-relaxed">{{ step.desc }}</p>
            </div>
          }
        </div>
      </section>

      <!-- Statistics Section -->
      <section id="stats" class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center max-w-5xl mx-auto">
          @for (s of stats; track s.label) {
            <div class="glass-card p-6 flex flex-col gap-2">
              <span class="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 font-title">
                {{ s.value }}
              </span>
              <span class="text-xs text-white font-bold uppercase tracking-wider font-title">{{ s.label }}</span>
              <span class="text-[10px] text-slate-400 font-medium">{{ s.sub }}</span>
            </div>
          }
        </div>
      </section>

      <!-- Pricing Tier Section -->
      <section id="pricing" class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <h2 class="text-3xl md:text-5xl font-extrabold text-white font-title tracking-tight">Simple, Clear Pricing</h2>
          <p class="text-sm text-slate-400 mt-4">No hidden developer taxes. Start reviewing immediately.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <!-- Free Tier -->
          <div class="glass-card p-8 flex flex-col gap-6 relative">
            <h3 class="text-xl font-bold text-white font-title">Hobbyist Tier</h3>
            <p class="text-xs text-slate-400 font-medium">Perfect for self-learning developers and builders.</p>
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-extrabold text-white font-title">$0</span>
              <span class="text-xs text-slate-400">free forever</span>
            </div>
            <hr class="border-white/5">
            <ul class="space-y-3 text-xs text-slate-300 font-semibold">
              <li class="flex items-center gap-2">🟢 Limitless Interactive Reviews</li>
              <li class="flex items-center gap-2">🟢 24-Hour Cache Refresh</li>
              <li class="flex items-center gap-2">🟢 Gemini Provider Support</li>
              <li class="flex items-center gap-2">🟢 Asynchronous Job Threads</li>
            </ul>
            <a routerLink="/register" class="px-5 py-2.5 text-xs font-bold mt-auto text-center border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl transition duration-150">
              Create Account
            </a>
          </div>

          <!-- Pro Tier -->
          <div class="glass-card p-8 flex flex-col gap-6 relative border-cyan-500/30">
            <div class="absolute -top-3 right-6 px-3 py-1 rounded-full bg-[#111827] border border-cyan-500/30 text-[9px] font-bold text-white uppercase tracking-wider">
              Best Seller
            </div>
            <h3 class="text-xl font-bold text-white font-title">Enterprise Suite</h3>
            <p class="text-xs text-slate-400 font-medium">Tailored for teams requiring security auditing databases.</p>
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-extrabold text-white font-title">$19</span>
              <span class="text-xs text-slate-400">/ month</span>
            </div>
            <hr class="border-white/5">
            <ul class="space-y-3 text-xs text-slate-300 font-semibold">
              <li class="flex items-center gap-2">🔮 Unlimited Interactive Reviews</li>
              <li class="flex items-center gap-2">🔮 Extended Cache & Analytics Grid</li>
              <li class="flex items-center gap-2">🔮 GPT-5 & Claude Sonnet integration</li>
              <li class="flex items-center gap-2">🔮 Direct PDF/Markdown Exports</li>
            </ul>
            <a routerLink="/register" class="px-5 py-2.5 text-xs font-bold mt-auto text-center text-white bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:scale-[1.02] rounded-xl transition duration-150 shadow-md">
              Upgrade to Pro
            </a>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section id="faq" class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <h2 class="text-3xl md:text-5xl font-extrabold text-white font-title tracking-tight">Frequently Asked Questions</h2>
          <p class="text-sm text-slate-400 mt-4">Clear responses regarding backend pipelines, AI scopes, and code privacy.</p>
        </div>

        <div class="max-w-3xl mx-auto space-y-4">
          @for (faq of faqs(); track faq.question) {
            <div class="glass-card p-5 cursor-pointer select-none transition duration-200" (click)="toggleFaq(faq)">
              <div class="flex items-center justify-between gap-4">
                <h3 class="text-sm font-bold text-white font-title">{{ faq.question }}</h3>
                <span class="text-base text-cyan-400 font-bold transition duration-200">
                  {{ faq.open ? '−' : '+' }}
                </span>
              </div>
              @if (faq.open) {
                <p class="text-xs text-slate-400 mt-3 leading-relaxed animate-fadeIn">
                  {{ faq.answer }}
                </p>
              }
            </div>
          }
        </div>
      </section>

      <!-- CTA Banner -->
      <section class="max-w-5xl mx-auto px-6 py-20 z-10 relative">
        <div class="rounded-3xl bg-gradient-to-tr from-[#111827] via-[#1E1B4B] to-[#312E81] p-12 text-center border border-white/10 shadow-2xl relative overflow-hidden">
          <div class="absolute inset-0 grid-bg opacity-5"></div>
          <div class="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
            <h2 class="text-3xl md:text-5xl font-extrabold text-white font-title leading-tight">Ready to build smarter?</h2>
            <p class="text-sm text-white/80 leading-relaxed">
              Create an account now, connect your AI endpoints, and secure your code pipelines in seconds. No credit card required.
            </p>
            <a routerLink="/register" class="px-8 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:scale-[1.03] transition duration-200 shadow-md">
              Get Started Free
            </a>
          </div>
        </div>
      </section>

      <!-- Floating Real-Time Support AI Assistant Chat Widget -->
      <div class="fixed bottom-6 right-6 z-50">
        <!-- Chat trigger bubble -->
        <button (click)="toggleSupportChat()"
                class="px-5 py-3.5 rounded-full bg-gradient-to-r from-[#FF70BF] to-[#7C3AED] text-white text-xs font-bold shadow-2xl hover:scale-105 active:scale-95 transition duration-150 flex items-center gap-2 border border-[#FF70BF]/30 select-none">
          <span class="text-base">💬</span>
          <span>Ask DevMind AI</span>
        </button>

        <!-- Support Popup Box -->
        @if (showSupportChat()) {
          <div class="absolute bottom-16 right-0 w-80 bg-[#09090B]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[380px] backdrop-blur-xl animate-slide-up select-text">
            <div class="bg-gradient-to-r from-[#FF70BF]/20 to-[#7C3AED]/20 px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#FF70BF] animate-pulse"></span>
                AI Support Bot
              </span>
              <div class="flex items-center gap-2.5">
                <button (click)="resetChat()" class="text-[9px] font-extrabold text-[#FF70BF] hover:underline uppercase select-none">New Chat</button>
                <button (click)="toggleSupportChat()" class="text-slate-400 hover:text-white transition duration-150 text-sm font-bold select-none">&times;</button>
              </div>
            </div>
            
            <div class="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-[11px]" #supportScrollContainer>
              @for (msg of supportMessages(); track msg.text) {
                <div class="flex flex-col gap-1 max-w-[85%]"
                     [ngClass]="msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'">
                  <span class="text-[8px] font-bold text-slate-500">{{ msg.sender === 'user' ? 'You' : 'DevMind Bot' }}</span>
                  <div class="px-3.5 py-2 rounded-xl leading-relaxed whitespace-pre-wrap select-text font-medium"
                       [ngClass]="msg.sender === 'user' ? 'bg-[#FF70BF]/10 text-white border border-[#FF70BF]/20 rounded-tr-none' : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/5'">
                    {{ msg.text }}
                  </div>
                </div>
              }
              @if (isSupportTyping()) {
                <div class="mr-auto max-w-[85%] flex flex-col items-start gap-1">
                  <span class="text-[8px] font-bold text-slate-500">DevMind Bot</span>
                  <div class="px-3 py-2 bg-white/5 border border-white/5 rounded-xl rounded-tl-none flex items-center gap-1">
                    <span class="w-1 h-1 rounded-full bg-cyan-400 animate-ping"></span>
                    <span class="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Bot is thinking...</span>
                  </div>
                </div>
              }
            </div>

            <!-- Input Bar -->
            <div class="p-3 border-t border-white/5 bg-black/25 flex items-center gap-2">
              <input type="text" [(ngModel)]="chatInput" (keydown.enter)="submitChat()" placeholder="Ask DevMind AI..."
                     [disabled]="isSupportTyping()"
                     class="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/35 focus:outline-none focus:border-cyan-400">
              <button (click)="submitChat()" [disabled]="isSupportTyping() || !chatInput.trim()"
                      class="px-3 py-2 bg-gradient-to-r from-[#FF70BF] to-[#7C3AED] rounded-xl text-xs font-bold text-white shadow disabled:opacity-40">
                Send
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Footer -->
      <footer class="w-full border-t border-white/5 bg-[#09090B] py-12 relative z-10">
        <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 rounded bg-gradient-to-tr from-[#FF70BF] to-[#7C3AED] flex items-center justify-center font-bold text-white text-sm">
              D
            </div>
            <span class="font-bold text-white font-title">DEVMIND AI</span>
          </div>
          
          <div class="flex items-center gap-8 font-semibold">
            <a href="https://github.com/2005swathi2000/DevMind-AI" target="_blank" class="hover:text-white transition duration-150">GitHub</a>
            <a href="#" class="hover:text-white transition duration-150">Privacy Policy</a>
            <a href="#" class="hover:text-white transition duration-150">Terms of Service</a>
            <a href="#" class="hover:text-white transition duration-150">Contact Support</a>
          </div>

          <div>
            &copy; 2026 DevMind AI. Built with Space Gradient Redesign.
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .glass-card {
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .glass-card:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 20px 40px -15px rgba(255, 112, 191, 0.12);
      border-color: rgba(255, 112, 191, 0.25);
    }
  `]
})
export class LandingComponent implements OnInit, AfterViewChecked {
  @ViewChild('supportScrollContainer') private supportScrollContainer!: ElementRef;

  demoGenerating = signal<boolean>(false);
  demoOutput = signal<string>('');

  // Mouse cursor tracking coordinates
  mouseX = 0;
  mouseY = 0;

  // Floating Support chatbot states
  showSupportChat = signal<boolean>(false);
  isSupportTyping = signal<boolean>(false);
  chatInput = '';
  supportMessages = signal<SupportMessage[]>([
    { sender: 'bot', text: 'Hello! I am your DevMind AI assistant bot. Ask me anything about our platform reviews or workspace configs!' }
  ]);

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  faqs = signal<FAQItem[]>([
    {
      question: 'Is my source code secure and private?',
      answer: 'Yes. DevMind-AI processes requests statelessly. Standard reviews are evaluated inside sandbox threads and never stored or used to train public AI models.',
      open: false
    },
    {
      question: 'How do asynchronous background jobs work?',
      answer: 'Asynchronous background jobs queue code queries onto backend workers. This prevents HTTP request timeouts, enabling deep analysis (e.g. documentation, full test suites) to run in the background while you navigate the site.',
      open: false
    },
    {
      question: 'Can I connect multiple AI providers?',
      answer: 'Yes! DevMind-AI supports programmatic provider registries. Gemini 2.5 Flash is configured out of the box, with integrations for GPT-5 and Claude Sonnet readily available.',
      open: false
    },
    {
      question: 'What coding languages are supported?',
      answer: 'Out of the box, the workspace provides highlighting, tokens, and parsing support for Java, Spring Boot, Python, C++, TypeScript, SQL, and general HTML/CSS structures.',
      open: false
    }
  ]);

  featuresList = [
    {
      icon: '✨',
      title: 'AI Code Review',
      desc: 'Verify syntax structure, logical loops, and style rules directly using customizable templates.'
    },
    {
      icon: '🐞',
      title: 'Bug Detection',
      desc: 'Identify logical vulnerabilities, null pointers, memory leaks, and arithmetic exceptions dynamically.'
    },
    {
      icon: '📚',
      title: 'Documentation Generator',
      desc: 'Parse code files and generate inline comments, Javadocs, docstrings, and complete Readme descriptions.'
    },
    {
      icon: '🧪',
      title: 'Unit Test Generator',
      desc: 'Auto-generate executable unit test suites across JUnit, PyTest, Jest, and other standard compiler frameworks.'
    },
    {
      icon: '⚡',
      title: 'Complexity Analysis',
      desc: 'Evaluate time and space complexity with Big-O notation, looping limits, and stack execution limits.'
    },
    {
      icon: '💬',
      title: 'Explain Code',
      desc: 'Decompile complex loops and nested logic blocks into clear, clean developer walkthrough notes.'
    }
  ];

  steps = [
    { num: '01', title: 'Paste Code', desc: 'Paste your project snippets or files into our mockup editor.' },
    { num: '02', title: 'Select Tool', desc: 'Choose a tool like Bug Finder, Test Generator, or explainers.' },
    { num: '03', title: 'Stream Output', desc: 'Observe results streaming token-by-token or queued in background.' },
    { num: '04', title: 'Export Report', desc: 'Export completed reports as PDF, Markdown, or raw text files.' }
  ];

  stats = [
    { value: '0', targetValue: 1200, label: 'Active Analyses', sub: 'Completed daily', counter: 0 },
    { value: '0', targetValue: 99.4, label: 'Success Rate', sub: 'Zero execution fails', counter: 0 },
    { value: '0', targetValue: 320, label: 'Avg Latency ms', sub: 'Sub-second streams', counter: 0 },
    { value: '0', targetValue: 15, label: 'AI Operations', sub: 'Custom workflows', counter: 0 }
  ];

  testimonials = [
    {
      quote: 'DevMind-AI saved me hours of manual syntax debugging. The asynchronous background workers let me queue code reviews while refactoring.',
      author: 'Aarav Kumar',
      role: 'Staff Software Engineer'
    },
    {
      quote: 'The SSE streaming code output is extremely fast, and the custom dark theme fits my workspace cleanly. Highly recommended!',
      author: 'Sophia Chen',
      role: 'Frontend Developer'
    }
  ];

  ngOnInit() {
    this.animateCounters();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleFaq(item: FAQItem) {
    this.faqs.update(list => 
      list.map(f => f.question === item.question ? { ...f, open: !f.open } : f)
    );
  }

  toggleSupportChat(): void {
    this.showSupportChat.set(!this.showSupportChat());
  }

  resetChat(): void {
    this.supportMessages.set([
      { sender: 'bot', text: 'Hello! I am your DevMind AI assistant bot. Ask me anything about our platform reviews or workspace configs!' }
    ]);
    this.chatInput = '';
  }

  async submitChat() {
    const text = this.chatInput.trim();
    if (!text || this.isSupportTyping()) return;

    this.chatInput = '';
    // Append user message
    this.supportMessages.update(msgs => [...msgs, { sender: 'user', text }]);
    this.isSupportTyping.set(true);

    // Format historical messages for prompt context
    const historyPayload = this.supportMessages().slice(1, -1).map(m => ({
      sender: m.sender === 'user' ? 'user' : 'ai',
      text: m.text
    }));

    const maxAttempts = 3;
    let attempt = 0;
    let response: Response | null = null;
    let lastError: any = null;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

        response = await fetch(`${getApiBaseUrl()}/api/auth/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: text,
            history: historyPayload,
            provider: 'gemini'
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Server returned status: ${response.status}`);
        }

        // Request succeeded, break the retry loop
        break;
      } catch (e: any) {
        lastError = e;
        console.warn(`Chatbot connection attempt ${attempt} failed:`, e);
        if (attempt < maxAttempts) {
          // Wait 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    if (!response || !response.ok) {
      console.error('All chatbot connection attempts failed.', lastError);
      this.isSupportTyping.set(false);
      this.supportMessages.update(msgs => [
        ...msgs, 
        { sender: 'bot', text: 'I am experiencing connection issues. Please check your network and try again.' }
      ]);
      return;
    }

    try {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported by response body');
      }

      this.isSupportTyping.set(false);
      // Append an empty bot message bubble to stream into
      this.supportMessages.update(msgs => [...msgs, { sender: 'bot', text: '' }]);

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            let dataContent = trimmed.substring(5).trim();
            if (dataContent) {
              if (dataContent.startsWith('"') && dataContent.endsWith('"')) {
                dataContent = dataContent.substring(1, dataContent.length - 1);
              }
              dataContent = dataContent.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t');
              
              this.supportMessages.update(msgs => {
                const updated = [...msgs];
                const last = updated[updated.length - 1];
                if (last && last.sender === 'bot') {
                  last.text += dataContent;
                }
                return updated;
              });
            }
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      this.isSupportTyping.set(false);
      this.supportMessages.update(msgs => [...msgs, { sender: 'bot', text: 'Connection interrupted. Please try again.' }]);
    }
  }

  animateCounters() {
    this.stats.forEach((s, idx) => {
      const target = s.targetValue;
      const isFloat = !Number.isInteger(target);
      let current = 0;
      const step = target / 40;
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        
        let displayVal = '';
        if (isFloat) {
          displayVal = current.toFixed(1) + '%';
        } else {
          displayVal = Math.round(current).toLocaleString();
          if (idx === 0) displayVal += '+';
          if (idx === 2) displayVal += 'ms';
        }
        
        this.stats[idx] = { ...s, value: displayVal };
      }, 30);
    });
  }

  runSimulatedDemo() {
    if (this.demoGenerating()) return;
    this.demoGenerating.set(true);
    this.demoOutput.set('');

    const lines = [
      '⚡ AWAITING ANALYSIS RESPONSE FROM DEVMIND SSE ENGINE...\n',
      '🔍 ANALYZING divide(int a, int b) METHOD PATHWAY...\n',
      '⚠️ WARNING: POTENTIAL DIVISION BY ZERO ERROR DETECTED ON LINE 4.\n',
      '💡 EXPLANATION: If variable b is passed as 0, this method throws java.lang.ArithmeticException: / by zero.\n',
      '🛠️ RECOMMENDED REFRACTORING:\n',
      '```java\n',
      'public int divide(int a, int b) {\n',
      '    if (b == 0) {\n',
      '        throw new IllegalArgumentException("Division by zero not allowed");\n',
      '    }\n',
      '    return a / b;\n',
      '}\n',
      '```\n',
      '✅ RUN COMPLETED SUCCESSFULLY. SPEED: 12ms/token.'
    ];

    let currentLine = 0;
    const streamInterval = setInterval(() => {
      if (currentLine >= lines.length) {
        clearInterval(streamInterval);
        this.demoGenerating.set(false);
        return;
      }
      this.demoOutput.update(out => out + lines[currentLine]);
      currentLine++;
    }, 450);
  }

  private scrollToBottom() {
    if (this.supportScrollContainer) {
      try {
        const el = this.supportScrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      } catch (e) {}
    }
  }
}
