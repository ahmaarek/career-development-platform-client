import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogWikiService } from '../services/blog-wiki.service';
import { UserService } from '../../../../user/user.service';
import { User } from '../../../../user/user.model';
import { LearningDocumentService } from '../services/learning-document.service';

@Component({
  selector: 'app-create-entry',
  templateUrl: './create-entry.component.html',
  styleUrls: ['./create-entry.component.css'],
  imports: [ReactiveFormsModule]
})
export class CreateEntryComponent {
  form: FormGroup;
  isSubmitting = false;
  entryType: 'BLOG' | 'WIKI' = 'BLOG';
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private blogWikiService: BlogWikiService,
    private userService: UserService,
    private learningDocumentService: LearningDocumentService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      attachment: [null]
    });
  }

  ngOnInit() {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    })
  }

  onTypeChange(type: 'BLOG' | 'WIKI') {
    this.entryType = type;
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.form.patchValue({ attachment: file });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting = true;

    const { title, content, attachment } = this.form.value;

    const createEntry = (attachmentId?: string) => {
      const payload = { title, content, attachmentId };
      this.blogWikiService.createEntry(this.entryType, payload).subscribe({
        next: () => {
          alert(`${this.entryType} created successfully!`);
          this.form.reset();
        },
        error: () => alert('Error creating entry.'),
        complete: () => this.isSubmitting = false
      });
    };

    if (attachment) {
      if (this.currentUser) {
        this.learningDocumentService.uploadAttachment(attachment, this.currentUser?.id, 'content').subscribe({
          next: (res) => createEntry(res),
          error: (error) => {
            alert('Failed to upload attachment.');
            console.log(error)
            this.isSubmitting = false;
          }
        });
      } else {
        createEntry();
      }
    }
  }


}
