import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogWikiService } from '../services/blog-wiki.service';
import { UserService } from '../../../../user/user.service';
import { User } from '../../../../user/user.model';
import { LearningDocumentService } from '../services/learning-document.service';
import { AlertService } from '../../../alert/alert.service';

@Component({
  selector: 'app-create-entry',
  templateUrl: './create-entry.component.html',
  styleUrls: ['./create-entry.component.css'],
  standalone: true,
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
    private learningDocumentService: LearningDocumentService,
    private alertService: AlertService
  ) {
    this.form = this.buildForm();
  }

  ngOnInit() {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  buildForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      attachment: [null]
    });
  }

  onTypeChange(type: 'BLOG' | 'WIKI') {
    this.entryType = type;
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.form.patchValue({ attachment: file });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const { title, content, attachment } = this.form.value;

    const payload = (attachmentId?: string) => ({
      title,
      content,
      attachmentId
    });

    const handleSuccess = () => {
      this.alertService.showAlert('success',`${this.entryType} created successfully!`);
      this.form.reset();
    };

    const handleError = () => this.alertService.showAlert('error','Error creating entry.');

    const createEntry = (attachmentId?: string) => {
      this.blogWikiService.createEntry(this.entryType, payload(attachmentId)).subscribe({
        next: handleSuccess,
        error: handleError,
        complete: () => (this.isSubmitting = false)
      });
    };

    if (!attachment) {
      createEntry();
      return;
    }

    if (!this.currentUser) {
      createEntry();
      return;
    }

    this.learningDocumentService.uploadAttachment(attachment, this.currentUser.id, 'content').subscribe({
      next: createEntry,
      error: () => {
        this.alertService.showAlert('error','Failed to upload attachment.');
        this.isSubmitting = false;
      }
    });
  }
}
