import { Injectable, signal, computed } from '@angular/core';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  type: 'success' | 'warning' | 'info' | 'danger';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsList = signal<AppNotification[]>([
    {
      id: 'n-1',
      title: 'Code Review Completed ✅',
      description: 'AI code scanner verified index.ts and found 0 security vulnerabilities.',
      timestamp: new Date(Date.now() - 300000), // 5 mins ago
      read: false,
      type: 'success'
    },
    {
      id: 'n-2',
      title: 'Background Job Finished 🚀',
      description: 'Workspace static reviews bundle compiled and archived.',
      timestamp: new Date(Date.now() - 1800000), // 30 mins ago
      read: false,
      type: 'success'
    },
    {
      id: 'n-3',
      title: 'Achievement Unlocked 🎉',
      description: 'Novice Developer milestone achieved. 1st review complete.',
      timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      read: false,
      type: 'info'
    },
    {
      id: 'n-4',
      title: 'Weekly Report Ready 📊',
      description: 'Weekly engineering productivity analytics chart is now available.',
      timestamp: new Date(Date.now() - 3600000 * 6), // 6 hours ago
      read: true,
      type: 'info'
    },
    {
      id: 'n-5',
      title: 'API Limit Near ⚠️',
      description: 'DevMind AI request queries have reached 85% of your free tier limit.',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      read: true,
      type: 'warning'
    }
  ]);

  notifications = this.notificationsList.asReadonly();

  unreadCount = computed(() => {
    return this.notificationsList().filter(n => !n.read).length;
  });

  addNotification(title: string, description: string, type: 'success' | 'warning' | 'info' | 'danger' = 'info'): void {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      description,
      timestamp: new Date(),
      read: false,
      type
    };
    this.notificationsList.update(list => [newNotif, ...list]);
  }

  markAllAsRead(): void {
    this.notificationsList.update(list => 
      list.map(n => ({ ...n, read: true }))
    );
  }

  markAsRead(id: string): void {
    this.notificationsList.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  clearAll(): void {
    this.notificationsList.set([]);
  }
}
