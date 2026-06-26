import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.currentUserSignal;

  logout() {
    this.authService.logout();
  }
}
