import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../user/user.service';
import { User } from '../../../user/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent {
  users: User[] = [];
  roleVisibility: Record<string, boolean> = {
    EMPLOYEE: true,
    MANAGER: true,
    ADMIN: true,
  };

  selectedEmployee: User | null = null;
  selectedManager: User | null = null;
  selectedUserForRoleEdit: User | null = null;
  selectedRole: 'EMPLOYEE' | 'MANAGER' | 'ADMIN' = 'EMPLOYEE';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error('Failed to fetch users:', err)
    });
  }

  get employees(): User[] {
    return this.users.filter(user => user.role !== 'ADMIN');
  }

  get managers(): User[] {
    return this.users.filter(user => user.role === 'MANAGER');
  }

  get admins(): User[] {
    return this.users.filter(user => user.role === 'ADMIN');
  }

  get employeesManagedBySelected(): User[] {
    if (!this.selectedManager) return [];
    return this.users.filter(user => user.managerId === this.selectedManager!.id);
  }

  toggle(role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN') {
    this.roleVisibility[role] = !this.roleVisibility[role];
  }

  assignManager(user: User) {
    this.selectedEmployee = user;
  }

  selectManager(manager: User) {
    if (!this.selectedEmployee) return;

    const updatedData = { managerId: manager.id };

    this.userService.updateUser(this.selectedEmployee.id, updatedData).subscribe({
      next: () => {
        this.selectedEmployee = null;
        this.ngOnInit();
      },
      error: (err) => console.error('Failed to assign manager:', err)
    });
  }

  viewEmployees(manager: User) {
    this.selectedManager = manager;
  }

  editUser(user: User) {
    this.selectedUserForRoleEdit = user;
    this.selectedRole = user.role;
  }

  saveRoleChange() {
    if (!this.selectedUserForRoleEdit) return;

    const updatedUser: Partial<User> = { role: this.selectedRole };

    this.userService.updateUser(this.selectedUserForRoleEdit.id, updatedUser).subscribe({
      next: () => {
        this.selectedUserForRoleEdit = null;
        this.ngOnInit();
      },
      error: (err) => console.error('Failed to update role:', err)
    });
  }

  cancelRoleEdit() {
    this.selectedUserForRoleEdit = null;
  }

  closeEmployeeModal() {
    this.selectedEmployee = null;
  }

  closeManagerModal() {
    this.selectedManager = null;
  }

  deleteUser(user: User) {
    console.log(`Delete user ${user.name}`);
  }
}
