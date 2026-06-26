import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface FAQItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-landing-gradient text-brand-text font-sans overflow-x-hidden relative">
      <!-- Glow blobs and Grid overlay -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute top-[5%] left-[10%] w-[500px] h-[500px] blob blob-pink animate-pulse"></div>
        <div class="absolute top-[25%] right-[5%] w-[600px] h-[600px] blob blob-purple"></div>
        <div class="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] blob blob-blue"></div>
        <div class="absolute inset-0 grid-bg opacity-10"></div>
      </div>

      <!-- Header Navbar -->
      <header class="w-full border-b border-white/10 bg-black/25 backdrop-blur-xl sticky top-0 z-50 transition duration-300">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-secondary to-brand-highlight flex items-center justify-center font-bold text-white text-lg shadow shadow-brand-accent/30 transition duration-300 hover:rotate-6">
              D
            </div>
            <span class="font-bold text-white tracking-wide text-lg font-title">DEVMIND AI</span>
          </div>

          <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-brand-textMuted">
            <a href="#features" class="hover:text-white transition duration-150">Features</a>
            <a href="#demo" class="hover:text-white transition duration-150">Interactive Demo</a>
            <a href="#stats" class="hover:text-white transition duration-150">Stats</a>
            <a href="#pricing" class="hover:text-white transition duration-150">Pricing</a>
            <a href="#faq" class="hover:text-white transition duration-150">FAQ</a>
          </nav>

          <div class="flex items-center gap-4">
            <a routerLink="/login" class="text-sm font-semibold text-brand-textMuted hover:text-white transition duration-150">
              Sign In
            </a>
            <a routerLink="/register" class="btn-primary py-2 px-4 text-xs font-bold rounded-lg shadow-medium">
              Get Started
            </a>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center relative z-10">
        <div class="max-w-3xl mx-auto flex flex-col items-center">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-brand-highlight tracking-wide uppercase mb-6 animate-bounce">
            ✨ Introducing DevMind-AI v2.0
          </div>
          
          <h1 class="text-5xl md:text-7xl font-extrabold text-white leading-tight font-title tracking-tight">
            Code Smarter.<br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-highlight via-brand-accent to-brand-secondary">
              Review Faster.
            </span><br>
            Build Better.
          </h1>
          
          <p class="text-lg text-brand-textMuted max-w-2xl mt-6 leading-relaxed">
            The asynchronous, multi-provider AI workspace designed for modern software engineers. Submit complex projects, capture diagnostics, detect security bugs, and auto-generate test suites in real-time.
          </p>

          <div class="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <a routerLink="/register" class="btn-primary py-3.5 px-8 text-sm font-bold shadow-medium hover:scale-105 transition duration-200">
              Launch Console Free
            </a>
            <a href="#demo" class="btn-secondary py-3.5 px-8 text-sm font-bold transition duration-200">
              Try Live Demo
            </a>
          </div>
        </div>

        <!-- Laptop Mockup & Floating Cards -->
        <div class="max-w-5xl mx-auto mt-20 relative px-4">
          <!-- Laptop Body wrapper -->
          <div class="relative mx-auto rounded-2xl bg-slate-900 border-4 border-slate-700/50 p-3 shadow-2xl">
            <div class="rounded-xl overflow-hidden bg-[#1E1E2E] border border-white/5 relative aspect-video flex flex-col text-left">
              
              <!-- Editor Titlebar -->
              <div class="bg-[#181825] px-4 py-2 flex items-center justify-between border-b border-white/5">
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span class="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
                </div>
                <span class="text-xs text-brand-textMuted font-mono">Calculator.java — DevMind Workspace</span>
                <div class="w-12"></div>
              </div>

              <!-- Editor Inner Split -->
              <div class="flex-1 flex overflow-hidden font-mono text-[11px] md:text-xs">
                <!-- Left panel: Code -->
                <div class="w-1/2 p-4 border-r border-white/5 bg-[#1E1E2E] text-brand-textMuted select-none">
                  <span class="text-[#FF70BF] font-bold">public class</span> <span class="text-[#F5EFFF]">Calculator</span> &#123;
                  <br>&nbsp;&nbsp;<span class="text-[#FF70BF] font-bold">public int</span> <span class="text-emerald-400">divide</span>(<span class="text-[#FF70BF]">int</span> a, <span class="text-[#FF70BF]">int</span> b) &#125;
                  <br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-slate-500">// Bug: Potential division by zero</span>
                  <br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#FF70BF]">return</span> a / b;
                  <br>&nbsp;&nbsp;&#125;
                  <br>&#125;
                </div>
                <!-- Right panel: AI analysis mock -->
                <div class="w-1/2 p-4 bg-[#130926]/40 text-[#F5EFFF] flex flex-col gap-2">
                  <span class="text-[#FF70BF] font-bold uppercase text-[9px] tracking-widest">✨ AI Analysis Report</span>
                  <span class="font-bold text-amber-300">⚠️ Bug Detected (ArithmeticException)</span>
                  <p class="text-[10px] text-brand-textMuted leading-relaxed">
                    Division by zero is possible when input <code class="bg-white/5 border border-white/10 rounded px-1 text-brand-highlight">b = 0</code>.
                  </p>
                  <div class="mt-2 p-2 rounded bg-white/5 border border-white/5">
                    <span class="text-emerald-400 font-bold block">💡 Suggestion:</span>
                    <span class="text-slate-400 text-[10px]">Add a zero-check validator.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Floating Widgets -->
          <!-- Widget 1: Total Reviews -->
          <div class="absolute -top-6 -left-4 glass-card p-4 flex items-center gap-3 animate-bounce" style="animation-duration: 4s;">
            <div class="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg">
              📊
            </div>
            <div class="text-left">
              <span class="text-[10px] block text-brand-textMuted font-bold uppercase tracking-wider">Total Reviews</span>
              <span class="text-sm font-extrabold text-white">+1,280 Daily</span>
            </div>
          </div>

          <!-- Widget 2: Accuracy Rate -->
          <div class="absolute top-[40%] -right-8 glass-card p-4 flex items-center gap-3 animate-bounce" style="animation-duration: 5s;">
            <div class="w-9 h-9 rounded-lg bg-brand-accent/20 flex items-center justify-center text-brand-highlight text-lg">
              🎯
            </div>
            <div class="text-left">
              <span class="text-[10px] block text-brand-textMuted font-bold uppercase tracking-wider">Accuracy Rate</span>
              <span class="text-sm font-extrabold text-white">99.4% Verified</span>
            </div>
          </div>

          <!-- Widget 3: Live Connection -->
          <div class="absolute -bottom-8 left-12 glass-card p-3.5 flex items-center gap-3">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span class="text-xs font-bold text-white">SSE Real-Time Stream Online</span>
          </div>
        </div>
      </section>

      <!-- Trusted By Section -->
      <section class="border-t border-b border-white/10 bg-black/10 py-10 relative z-10">
        <div class="max-w-7xl mx-auto px-6 text-center">
          <span class="text-[10px] block text-brand-textMuted uppercase font-bold tracking-widest mb-6">Trusted by developers at forward-thinking teams</span>
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
          <p class="text-sm text-brand-textMuted mt-4">
            Everything you need to review syntax, isolate code bottlenecks, and generate comprehensive test structures.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (f of featuresList; track f.title) {
            <div class="glass-card p-6 flex flex-col gap-4">
              <div class="w-12 h-12 rounded-xl bg-brand-primary/20 border border-brand-accent/30 flex items-center justify-center text-2xl shadow">
                {{ f.icon }}
              </div>
              <h3 class="text-lg font-bold text-white font-title">{{ f.title }}</h3>
              <p class="text-xs text-brand-textMuted leading-relaxed">{{ f.desc }}</p>
              <div class="mt-auto pt-4 flex items-center text-xs font-bold text-brand-highlight cursor-pointer hover:underline gap-1">
                Explore tool <span>&rarr;</span>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Live Demo Section -->
      <section id="demo" class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <span class="text-[10px] font-bold text-brand-highlight uppercase tracking-wider px-2.5 py-1 rounded bg-brand-accent/20 border border-brand-accent/30">Sandbox Playground</span>
          <h2 class="text-3xl md:text-5xl font-extrabold text-white font-title tracking-tight mt-4">Interactive SSE Sandbox</h2>
          <p class="text-sm text-brand-textMuted mt-2">
            Write code on the left and see real-time, token-by-token streaming reviews load instantly.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <!-- Editor Console -->
          <div class="rounded-2xl overflow-hidden bg-[#1E1E2E] border border-white/10 shadow-xl flex flex-col h-[380px]">
            <div class="bg-[#181825] px-4 py-3 flex items-center justify-between border-b border-white/10 shrink-0">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-rose-500"></span>
                <span class="text-xs text-brand-text font-semibold font-mono">DemoClass.java</span>
              </div>
              <button (click)="runSimulatedDemo()" [disabled]="demoGenerating()"
                      class="btn-primary py-1.5 px-4 text-xs font-bold shadow-low disabled:opacity-40">
                {{ demoGenerating() ? 'Streaming...' : 'Analyze Code' }}
              </button>
            </div>

            <!-- Code input screen -->
            <div class="flex-1 p-4 overflow-y-auto font-mono text-xs text-[#E9D5FF] leading-relaxed bg-[#1E1E2E]">
              <span class="text-brand-accent">public class</span> <span class="text-white">Calculator</span> &#123;
              <br>&nbsp;&nbsp;<span class="text-brand-accent">public int</span> <span class="text-emerald-400">divide</span>(int a, int b) &#123;
              <br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-slate-500">// Bug to find:</span>
              <br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-brand-accent">return</span> a / b;
              <br>&nbsp;&nbsp;&#125;
              <br>&#125;
            </div>
          </div>

          <!-- Simulated Output Console -->
          <div class="rounded-2xl overflow-hidden bg-brand-surface border border-white/10 shadow-xl flex flex-col h-[380px]">
            <div class="bg-black/20 px-4 py-3 border-b border-white/10 shrink-0">
              <span class="text-xs font-bold text-white uppercase tracking-wider">AI Streaming Output</span>
            </div>
            
            <div class="flex-1 p-6 overflow-y-auto font-mono text-xs leading-relaxed bg-[#130926]/40 relative">
              @if (!demoOutput() && !demoGenerating()) {
                <div class="flex flex-col items-center justify-center h-full text-center text-brand-textMuted">
                  <span class="text-3xl mb-2">⚡</span>
                  <span class="font-bold text-white">Click "Analyze Code" above</span>
                  <p class="text-[10px] mt-1 max-w-[250px]">Watch the SSE engine process this code snippet in real-time.</p>
                </div>
              }

              <!-- Output streaming rendering -->
              <div class="text-brand-text whitespace-pre-wrap font-medium" [innerHTML]="demoOutput()"></div>

              @if (demoGenerating()) {
                <span class="inline-block w-2.5 h-4 ml-1 bg-brand-highlight animate-pulse align-middle"></span>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Workflow Timeline Section -->
      <section class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <h2 class="text-3xl md:text-5xl font-extrabold text-white font-title tracking-tight">Simple Modern Workflow</h2>
          <p class="text-sm text-brand-textMuted mt-4">Review code and export audits in four easy steps.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          @for (step of steps; track step.num) {
            <div class="glass-card p-6 flex flex-col gap-3 relative overflow-hidden">
              <div class="absolute -top-3 -right-3 text-7xl font-extrabold text-white/5 select-none font-title">
                {{ step.num }}
              </div>
              <div class="w-8 h-8 rounded-lg bg-brand-accent/20 flex items-center justify-center text-brand-highlight text-sm font-bold font-title">
                {{ step.num }}
              </div>
              <h3 class="text-base font-bold text-white font-title">{{ step.title }}</h3>
              <p class="text-xs text-brand-textMuted leading-relaxed">{{ step.desc }}</p>
            </div>
          }
        </div>
      </section>

      <!-- Statistics Section -->
      <section id="stats" class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center max-w-5xl mx-auto">
          @for (s of stats; track s.label) {
            <div class="glass-card p-6 flex flex-col gap-2">
              <span class="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-highlight to-brand-accent font-title">
                {{ s.value }}
              </span>
              <span class="text-xs text-white font-bold uppercase tracking-wider font-title">{{ s.label }}</span>
              <span class="text-[10px] text-brand-textMuted font-medium">{{ s.sub }}</span>
            </div>
          }
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <h2 class="text-3xl md:text-5xl font-extrabold text-white font-title tracking-tight">Approved by Engineers</h2>
          <p class="text-sm text-brand-textMuted mt-4">See how teams use DevMind-AI to optimize their development loops.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          @for (t of testimonials; track t.author) {
            <div class="glass-card p-6 flex flex-col gap-4">
              <div class="text-brand-highlight text-lg">⭐⭐⭐⭐⭐</div>
              <p class="text-sm italic text-brand-text font-medium">"{{ t.quote }}"</p>
              <div class="flex items-center gap-3 mt-4">
                <div class="w-8 h-8 rounded-full bg-brand-accent/20 border border-brand-accent flex items-center justify-center text-xs font-bold text-white">
                  {{ t.author.charAt(0) }}
                </div>
                <div class="text-left">
                  <span class="text-xs font-bold text-white block">{{ t.author }}</span>
                  <span class="text-[10px] text-brand-textMuted block">{{ t.role }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Pricing Tier Section -->
      <section id="pricing" class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <h2 class="text-3xl md:text-5xl font-extrabold text-white font-title tracking-tight">Simple, Clear Pricing</h2>
          <p class="text-sm text-brand-textMuted mt-4">No hidden developer taxes. Start reviewing immediately.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <!-- Free Tier -->
          <div class="glass-card p-8 flex flex-col gap-6 relative border-white/10">
            <h3 class="text-xl font-bold text-white font-title">Hobbyist Tier</h3>
            <p class="text-xs text-brand-textMuted">Perfect for self-learning developers and builders.</p>
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-extrabold text-white font-title">$0</span>
              <span class="text-xs text-brand-textMuted">free forever</span>
            </div>
            <hr class="border-white/5">
            <ul class="space-y-3 text-xs text-brand-text font-medium">
              <li class="flex items-center gap-2">🟢 Limitless Interactive Reviews</li>
              <li class="flex items-center gap-2">🟢 24-Hour Cache Refresh</li>
              <li class="flex items-center gap-2">🟢 Gemini Provider Support</li>
              <li class="flex items-center gap-2">🟢 Asynchronous Job Threads</li>
            </ul>
            <a routerLink="/register" class="btn-secondary w-full py-2.5 text-xs font-bold mt-auto text-center">
              Create Account
            </a>
          </div>

          <!-- Pro Tier -->
          <div class="glass-card p-8 flex flex-col gap-6 relative border-brand-accent/50 shadow-brand-accent/5">
            <div class="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-brand-primary border border-brand-accent text-[9px] font-bold text-white uppercase tracking-wider">
              Best Seller
            </div>
            <h3 class="text-xl font-bold text-white font-title">Enterprise Suite</h3>
            <p class="text-xs text-brand-textMuted">Tailored for teams requiring security auditing databases.</p>
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-extrabold text-white font-title">$19</span>
              <span class="text-xs text-brand-textMuted">/ month</span>
            </div>
            <hr class="border-white/5">
            <ul class="space-y-3 text-xs text-brand-text font-medium">
              <li class="flex items-center gap-2">🔮 Unlimited Interactive Reviews</li>
              <li class="flex items-center gap-2">🔮 Extended Cache & Analytics Grid</li>
              <li class="flex items-center gap-2">🔮 GPT-5 & Claude Sonnet integration</li>
              <li class="flex items-center gap-2">🔮 Direct PDF/Markdown Exports</li>
            </ul>
            <a routerLink="/register" class="btn-primary w-full py-2.5 text-xs font-bold mt-auto text-center shadow-low">
              Upgrade to Pro
            </a>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section id="faq" class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <h2 class="text-3xl md:text-5xl font-extrabold text-white font-title tracking-tight">Frequently Asked Questions</h2>
          <p class="text-sm text-brand-textMuted mt-4">Clear responses regarding backend pipelines, AI scopes, and code privacy.</p>
        </div>

        <div class="max-w-3xl mx-auto space-y-4">
          @for (faq of faqs(); track faq.question) {
            <div class="glass-card p-5 cursor-pointer select-none transition duration-200" (click)="toggleFaq(faq)">
              <div class="flex items-center justify-between gap-4">
                <h3 class="text-sm font-bold text-white font-title">{{ faq.question }}</h3>
                <span class="text-base text-brand-highlight font-bold transition duration-200">
                  {{ faq.open ? '−' : '+' }}
                </span>
              </div>
              @if (faq.open) {
                <p class="text-xs text-brand-textMuted mt-3 leading-relaxed animate-fadeIn">
                  {{ faq.answer }}
                </p>
              }
            </div>
          }
        </div>
      </section>

      <!-- CTA Banner -->
      <section class="max-w-5xl mx-auto px-6 py-20 z-10 relative">
        <div class="rounded-3xl bg-gradient-to-tr from-brand-primary via-brand-secondary to-brand-accent p-12 text-center border border-white/10 shadow-2xl relative overflow-hidden">
          <div class="absolute inset-0 grid-bg opacity-5"></div>
          <div class="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
            <h2 class="text-3xl md:text-5xl font-extrabold text-white font-title leading-tight">Ready to build smarter?</h2>
            <p class="text-sm text-white/80 leading-relaxed">
              Create an account now, connect your AI endpoints, and secure your code pipelines in seconds. No credit card required.
            </p>
            <a routerLink="/register" class="btn-primary py-3.5 px-8 text-sm font-bold shadow-medium mt-4">
              Get Started Free
            </a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="w-full border-t border-white/5 bg-black/35 py-12 relative z-10">
        <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-brand-textMuted">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 rounded bg-brand-primary flex items-center justify-center font-bold text-white text-sm">
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
  `]
})
export class LandingComponent implements OnInit {
  demoGenerating = signal<boolean>(false);
  demoOutput = signal<string>('');

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

  toggleFaq(item: FAQItem) {
    this.faqs.update(list => 
      list.map(f => f.question === item.question ? { ...f, open: !f.open } : f)
    );
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
}
