import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../notification/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  constructor(private http: HttpClient) {}

  getNotifications(userId: string): Observable<Notification[]> {
    return this.http.get<any[]>(`${environment.notificationBaseUrl}/${userId}`);
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.http.patch<void>(`${environment.notificationBaseUrl}/${notificationId}/read`, {});
  }

  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(`${environment.notificationBaseUrl}/${notificationId}`);
  }
}
