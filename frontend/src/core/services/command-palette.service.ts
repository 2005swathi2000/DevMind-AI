import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommandPaletteService {
  isOpen = signal<boolean>(false);
  actionTriggered = new Subject<string>();

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.set(!this.isOpen());
  }

  triggerAction(action: string): void {
    this.actionTriggered.next(action);
  }
}
