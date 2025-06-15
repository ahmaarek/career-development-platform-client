import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UserService } from '../../user.service';

interface User {
  id: number;
  name: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'USER';
  photoUrl: string;
}

@Component({
  selector: 'app-user-management',
  imports: [CommonModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent {
  users: User[] = [];
  showEmployees = true;
  showManagers = true;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Failed to fetch users:', err)
    });
  }

  toggle(role: 'EMPLOYEE' | 'MANAGER') {
    if (role === 'EMPLOYEE') this.showEmployees = !this.showEmployees;
    else this.showManagers = !this.showManagers;
  }

  assignManager(user: User) {
    console.log(`Assign manager to ${user.name}`);
  }

  editUser(user: User) {
    console.log(`Edit user ${user.name}`);
  }

  deleteUser(user: User) {
    console.log(`Delete user ${user.name}`);
  }
}
