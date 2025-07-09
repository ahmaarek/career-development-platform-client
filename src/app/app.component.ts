import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { AlertComponent } from './features/alert/alert.component';
import { AlertData, AlertService } from './features/alert/alert.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AlertComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'career-development-platform';
  alert: AlertData | null = null;
    constructor(private authService: AuthService, private alertService: AlertService) {
    this.alertService.alert$.subscribe(alert => {
      this.alert = alert;
    });
  }

  clearAlert() {
    this.alertService.clearAlert();
  }
  ngOnInit() {
    this.authService.autoLogin();
  }
}