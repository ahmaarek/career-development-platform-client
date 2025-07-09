import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AlertData {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new BehaviorSubject<AlertData | null>(null);
  alert$ = this.alertSubject.asObservable();

  showAlert(type: AlertData['type'], message: string) {
    this.alertSubject.next({ type, message });
  }

  clearAlert() {
    this.alertSubject.next(null);
  }
}
