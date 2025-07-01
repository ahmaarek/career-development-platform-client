import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  constructor(private http: HttpClient) {}

  getNotifications(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.notificationBaseUrl}/${userId}`);
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.http.patch<void>(`${environment.notificationBaseUrl}/${notificationId}/read`, {});
  }
}
