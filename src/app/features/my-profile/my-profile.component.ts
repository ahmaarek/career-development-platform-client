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

  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  uploadedImageId: string | null = null;

  constructor(private userService: UserService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.userService.user$.subscribe((currentUser) => {
      if (currentUser) {
      
        this.user = { ...currentUser };
        this.originalUser = { ...currentUser };

        this.form = this.fb.group({
          name: [this.user.name, [Validators.required]]
        });

        if (this.user.imageId) {
          this.loadImagePreview(this.user.imageId);
        }
      }
    });
  }

  enableEdit(): void {
    if (this.user) {
      this.form.patchValue({
        name: this.user.name
      });
      this.isEditing = true;
    }
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  saveChanges(): void {
    if (this.user && this.form.valid) {
      const updateUser = (imageId?: string) => {
        const updatedData = {
          name: this.form.value.name,
          imageId: imageId || this.user!.imageId
        };

        this.userService.updateUser(this.user!.id, updatedData).subscribe(updatedUser => {
          this.user = updatedUser;
          this.originalUser = { ...updatedUser };
          this.isEditing = false;
          this.selectedFile = null;

          if (this.user.imageId) {
            this.loadImagePreview(this.user.imageId);
          }
        });
      };

      if (this.selectedFile) {
        this.userService.uploadImage(this.selectedFile, this.user.id).subscribe({
          next: (response) => {
            this.uploadedImageId = response.imageId;
            updateUser(this.uploadedImageId);
          },
          error: (err) => console.error('Failed to upload image:', err)
        });
      } else {
        updateUser();
      }
    }
  }

  cancelChanges(): void {
    this.form.patchValue({
      name: this.originalUser.name
    });

    this.selectedFile = null;
    this.uploadedImageId = null;
    this.isEditing = false;

    if (this.originalUser.imageId) {
      this.loadImagePreview(this.originalUser.imageId);
    } else {
      this.imagePreviewUrl = null;
    }
  }

  private loadImagePreview(imageId: string): void {
    this.userService.getProtectedImage(imageId).subscribe({
      next: (blob) => {
        this.imagePreviewUrl = URL.createObjectURL(blob);
      },
      error: (err) => {
        console.error('Failed to load image preview:', err);
        this.imagePreviewUrl = null;
      }
    });
  }
}
