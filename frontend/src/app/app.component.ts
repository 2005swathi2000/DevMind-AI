import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommandPaletteComponent } from '../shared/components/command-palette/command-palette.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommandPaletteComponent],
  template: `
    <div class="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans selection:bg-brand-surface selection:text-brand-text antialiased">
      <router-outlet></router-outlet>
      <app-command-palette></app-command-palette>
    </div>
  `
})
export class AppComponent implements OnInit {
  title = 'DevMind AI';

  ngOnInit() {
    this.restoreTheme();
  }

  private restoreTheme() {
    if (typeof window === 'undefined') return;
    const theme = localStorage.getItem('devmind_current_theme') || 'theme-purple';
    this.applyTheme(theme);
  }

  private applyTheme(theme: string) {
    const root = document.documentElement;
    if (theme === 'theme-blue') {
      root.style.setProperty('--primary', '#0284C7');
      root.style.setProperty('--primary-hover', '#0369A1');
      root.style.setProperty('--secondary', '#0369A1');
      root.style.setProperty('--accent', '#38BDF8');
      root.style.setProperty('--highlight', '#38BDF8');
      root.style.setProperty('--background', '#0B132B');
      root.style.setProperty('--surface', '#1C2541');
      root.style.setProperty('--editor-bg', '#1C2541');
      root.style.setProperty('--text', '#F8FAFC');
      root.style.setProperty('--text-muted', '#94A3B8');
      root.style.setProperty('--border', 'rgba(255, 255, 255, 0.08)');
    } else if (theme === 'theme-orange') {
      root.style.setProperty('--primary', '#EA580C');
      root.style.setProperty('--primary-hover', '#D97706');
      root.style.setProperty('--secondary', '#C2410C');
      root.style.setProperty('--accent', '#FDBA74');
      root.style.setProperty('--highlight', '#FDBA74');
      root.style.setProperty('--background', '#180F0A');
      root.style.setProperty('--surface', '#26160F');
      root.style.setProperty('--editor-bg', '#26160F');
      root.style.setProperty('--text', '#F8FAFC');
      root.style.setProperty('--text-muted', '#94A3B8');
      root.style.setProperty('--border', 'rgba(255, 255, 255, 0.08)');
    } else if (theme === 'theme-green') {
      root.style.setProperty('--primary', '#059669');
      root.style.setProperty('--primary-hover', '#047857');
      root.style.setProperty('--secondary', '#047857');
      root.style.setProperty('--accent', '#34D399');
      root.style.setProperty('--highlight', '#34D399');
      root.style.setProperty('--background', '#061A14');
      root.style.setProperty('--surface', '#0E2C22');
      root.style.setProperty('--editor-bg', '#0E2C22');
      root.style.setProperty('--text', '#F8FAFC');
      root.style.setProperty('--text-muted', '#94A3B8');
      root.style.setProperty('--border', 'rgba(255, 255, 255, 0.08)');
    } else if (theme === 'theme-midnight') {
      root.style.setProperty('--primary', '#312E81');
      root.style.setProperty('--primary-hover', '#1E1B4B');
      root.style.setProperty('--secondary', '#1E1B4B');
      root.style.setProperty('--accent', '#818CF8');
      root.style.setProperty('--highlight', '#818CF8');
      root.style.setProperty('--background', '#03001C');
      root.style.setProperty('--surface', '#0B0033');
      root.style.setProperty('--editor-bg', '#0B0033');
      root.style.setProperty('--text', '#F8FAFC');
      root.style.setProperty('--text-muted', '#94A3B8');
      root.style.setProperty('--border', 'rgba(255, 255, 255, 0.08)');
    } else if (theme === 'theme-light') {
      root.style.setProperty('--primary', '#4F46E5');
      root.style.setProperty('--primary-hover', '#4338CA');
      root.style.setProperty('--secondary', '#7C3AED');
      root.style.setProperty('--accent', '#0284C7');
      root.style.setProperty('--highlight', '#0284C7');
      root.style.setProperty('--background', '#F8FAFC');
      root.style.setProperty('--surface', '#FFFFFF');
      root.style.setProperty('--editor-bg', '#FFFFFF');
      root.style.setProperty('--text', '#0F172A');
      root.style.setProperty('--text-muted', '#64748B');
      root.style.setProperty('--border', 'rgba(0, 0, 0, 0.08)');
    } else {
      root.style.setProperty('--primary', '#4F46E5');
      root.style.setProperty('--primary-hover', '#4338CA');
      root.style.setProperty('--secondary', '#7C3AED');
      root.style.setProperty('--accent', '#06B6D4');
      root.style.setProperty('--highlight', '#22D3EE');
      root.style.setProperty('--background', '#09090B');
      root.style.setProperty('--surface', '#111827');
      root.style.setProperty('--editor-bg', '#111827');
      root.style.setProperty('--text', '#F8FAFC');
      root.style.setProperty('--text-muted', '#94A3B8');
      root.style.setProperty('--border', 'rgba(255, 255, 255, 0.08)');
    }
  }
}
