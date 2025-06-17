import { Component, OnInit } from '@angular/core';
import { User } from '../../user/user.model';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../user/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent implements OnInit {
  user: User | null = null;
  originalUser!: User;
  isEditing = false;
  form!: FormGroup;

  constructor(private userService: UserService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.userService.user$.subscribe((currentUser) => {
      if (currentUser) {
        this.user = { ...currentUser };
        this.originalUser = { ...currentUser };

        this.form = this.fb.group({
          name: [this.user.name, [Validators.required]],
          photoUrl: [this.user.photoUrl],
        });
      }
    });
  }

  enableEdit() {
    if (this.user) {
      this.form.patchValue({
        name: this.user.name,
        photoUrl: this.user.photoUrl,
      });
      this.isEditing = true;
    }
  }

  saveChanges() {
    if (this.user && this.form.valid) {
      const updatedData = {
        name: this.form.value.name,
        photoUrl: this.form.value.photoUrl
      };

      this.userService.updateUser(this.user.id, updatedData).subscribe(updatedUser => {
        this.user = updatedUser;
        this.originalUser = { ...updatedUser };
        this.isEditing = false;
      });
    }
  }

  cancelChanges(): void {
    this.form.patchValue({
      name: this.originalUser.name,
      photoUrl: this.originalUser.photoUrl
    });
    this.isEditing = false;
  }
}
