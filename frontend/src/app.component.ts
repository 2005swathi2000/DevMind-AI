import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans selection:bg-brand-surface selection:text-brand-text antialiased">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  title = 'DevMind AI';
}
