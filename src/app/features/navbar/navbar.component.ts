import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { Notification } from '../notification/notification.model';
import { MatIconModule } from '@angular/material/icon';
import { LearningScoreService } from '../learning/score/learning.score.service';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

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
  imageUrl: string | null = "/user-default-logo.webp";

  constructor(
    private router: Router,
    private authService: AuthService,
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
        if (user.imageId) {
          this.loadImagePreview(user.imageId);
        }
      }),
      switchMap(user => this.learningScoreService.getUserScore(user.id)),
    ).subscribe({
      next: (score) => {
        this.currentPoints = score.points;
        this.fetchNotifications();
      }
    });
  }

  private loadImagePreview(imageId: string): void {
    this.userService.getProtectedImage(imageId).subscribe({
      next: (blob) => {
        this.imageUrl = URL.createObjectURL(blob);
      },
      error: (err) => {

        this.imageUrl = "/user-default-logo.webp";
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

        return forkJoin(
          uniqueSenderIds.map(senderId =>
            this.userService.getUserById(senderId).pipe(
              catchError(err => {
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
      }
    });
  }


  markAsRead(notification: any) {
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.unreadCount = this.notifications.filter(n => !n.read).length;
      }

    });
  }

  removeNotification(notification: any) {
    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
        this.unreadCount = this.notifications.filter(n => !n.read).length;
      }

    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleNotificationDropdown() {
    this.notificationDropdownOpen = !this.notificationDropdownOpen;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.dropdownOpen = false;
  }

  logout() {
    this.authService.logout();
  }
}
