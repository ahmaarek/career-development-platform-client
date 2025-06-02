import { Component, inject, NgModule } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginService = inject(LoginService);
  email: string = '';
  password: string = '';

  onLogin() {
    this.loginService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log(response);

      }
    })
  }
}
