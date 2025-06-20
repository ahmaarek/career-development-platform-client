import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  dropdownOpen = false;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN' = 'ADMIN';
  userName: string = 'John Doe';

  constructor(private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    console.log('NavbarComponent initialized');
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?._token || "";


    if (token) {
      console.log('Token found, fetching current user');
      this.userService.getCurrentUser().subscribe({
        next: (user) => {
          this.role = user.role;
          this.userName = user.name;
        },
        error: (err) => {
          console.error('Failed to fetch current user:', err);
          // this.router.navigate(['/login']);
        }
      });
    }
  }
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}