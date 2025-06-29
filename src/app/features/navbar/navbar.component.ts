import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink,MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
  dropdownOpen = false;
  notificationDropdownOpen = false;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN' = 'ADMIN';
  userName: string = 'John Doe';

  notifications: any[] = [];
  unreadCount: number = 0;
  userId!: string;

  constructor(
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const userString = sessionStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?._token || "";

    if (token) {
      this.userService.getCurrentUser().subscribe({
        next: (user) => {
          this.role = user.role;
          this.userName = user.name;
          this.userId = user.id;

          this.fetchNotifications();
        },
        error: (err) => {
          console.error('Failed to fetch current user:', err);
        }
      });
    }
  }

  fetchNotifications() {
    this.notificationService.getNotifications(this.userId).subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.filter((n: any) => !n.read).length;
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

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleNotificationDropdown() {
    this.notificationDropdownOpen = !this.notificationDropdownOpen;
    // Optionally mark all as read when opened
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
