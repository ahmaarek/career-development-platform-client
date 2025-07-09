import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../user/user.service';
import { User } from '../../../user/user.model';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';

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
    EMPLOYEE: false,
    MANAGER: false,
    ADMIN: false,
  };

  selectedEmployee: User | null = null;
  selectedManager: User | null = null;
  selectedUserForRoleEdit: User | null = null;
  selectedRole: 'EMPLOYEE' | 'MANAGER' | 'ADMIN' = 'EMPLOYEE';

  constructor(private userService: UserService) { }

  usersWithImages: { user: any, imageUrl: string }[] = [];

  ngOnInit(): void {
    this.userService.getAllUsers().pipe(
      tap(users => {
        this.users = users;
        this.usersWithImages = [];
      }),
      switchMap(users => {
        return forkJoin(
          users.map(user => {
            if (user.imageId) {
              return this.userService.getProtectedImage(user.imageId).pipe(
                map(blob => ({
                  user,
                  imageUrl: URL.createObjectURL(blob)
                })),
                catchError(() =>
                  of({
                    user,
                    imageUrl: "/user-default-logo.webp"
                  })
                )
              );
            } else {
              return of({
                user,
                imageUrl: "/user-default-logo.webp"
              });
            }
          })
        );
      })
    ).subscribe({
      next: userWithImages => {
        this.usersWithImages = userWithImages;
      }
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

  getImageUrlByUserId(user: User): string {
    const entry = this.usersWithImages.find(u => u.user.id === user.id);
    return entry?.imageUrl || '/user-default-logo.webp';
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
      }

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
      }
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

}
