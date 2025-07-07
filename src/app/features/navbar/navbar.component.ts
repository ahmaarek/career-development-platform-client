import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { Notification } from '../notification/notification.model';
import { MatIconModule } from '@angular/material/icon';
import { LearningScoreService } from '../learning/score/learning.score.service';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
  dropdownOpen = false;
  notificationDropdownOpen = false;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN' = null as any;
  userName: string = 'John Doe';
  currentPoints: number = 0;

  notifications: Notification[] = [];
  unreadCount: number = 0;
  userId!: string;
  senderNames: Record<string, string> = {};

  constructor(
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService,
    private learningScoreService: LearningScoreService
  ) { }

  ngOnInit(): void {
  const userString = sessionStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const token = user?._token || "";

  if (!token) return;

  this.userService.getCurrentUser().pipe(
    tap(user => {
      this.role = user.role;
      this.userName = user.name;
      this.userId = user.id;
    }),
    switchMap(user => this.learningScoreService.getUserScore(user.id)),
    tap(score => {
      this.currentPoints = score.points;
      this.fetchNotifications(); 
    })
  ).subscribe({
    error: (err) => {
      console.error('Initialization failed:', err);
    }
  });
}


  fetchNotifications(): void {
  this.notificationService.getNotifications(this.userId).pipe(
    tap(notifications => {
      this.notifications = notifications;
      this.unreadCount = notifications.filter(n => !n.read).length;
    }),
    switchMap(notifications => {
      const uniqueSenderIds = [...new Set(notifications.map(n => n.senderId))];
      const missingSenderIds = uniqueSenderIds.filter(id => !this.senderNames[id]);

      if (missingSenderIds.length === 0) {
        return of([]);
      }

      return forkJoin(
        missingSenderIds.map(senderId =>
          this.userService.getUserById(senderId).pipe(
            catchError(err => {
              console.error(`Failed to fetch sender name for ID ${senderId}`, err);
              return of({ id: senderId, name: 'Unknown' });
            }),
            map(user => ({ id: senderId, name: user.name }))
          )
        )
      );
    })
  ).subscribe({
    next: (senderDataArray) => {
      senderDataArray.forEach(data => {
        this.senderNames[data.id] = data.name;
      });
    },
    error: (err) => {
      console.error('Error loading notifications:', err);
    }
  });
}



  markAsRead(notification: any) {
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.unreadCount = this.notifications.filter(n => !n.read).length;
      },
      error: err => {
        console.error('Failed to mark notification as read:', err);
      }
    });
  }

  removeNotification(notification: any) {
    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
        this.unreadCount = this.notifications.filter(n => !n.read).length;
      },
      error: err => {
        console.error('Failed to delete notification:', err);
      }
    });
  }


  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleNotificationDropdown() {
    this.notificationDropdownOpen = !this.notificationDropdownOpen;

  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
