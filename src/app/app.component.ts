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
   constructor (private authService: AuthService) {}

  ngOnInit() {
    this.authService.autoLogin();
  }
}