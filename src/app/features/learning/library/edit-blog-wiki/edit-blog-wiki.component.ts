import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BlogWikiService } from '../services/blog-wiki.service';
import { UserService } from '../../../../user/user.service';
import { LearningDocumentService } from '../services/learning-document.service';
import { User } from '../../../../user/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogWikiDTO } from '../models/blog-wiki.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-blog-wiki',
  templateUrl: './edit-blog-wiki.component.html',
  styleUrls: ['./edit-blog-wiki.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class EditBlogWikiComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  entryType: 'BLOG' | 'WIKI' = 'BLOG';
  currentUser: User | null = null;
  entryId!: string;
  previewUrl: string | null = null;
  previewType: string | null = null;
  oldAttachmentId: string | undefined = undefined;

  constructor(
    private fb: FormBuilder,
    private blogWikiService: BlogWikiService,
    private userService: UserService,
    private documentService: LearningDocumentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      attachment: [null]
    });
  }

  ngOnInit(): void {
    this.entryId = this.route.snapshot.paramMap.get('id')!;

    this.userService.getCurrentUser().subscribe(user => this.currentUser = user);

    this.blogWikiService.getEntryById(this.entryId).subscribe(entry => {
      this.oldAttachmentId = entry.attachmentId ?? undefined;

      this.form.patchValue({
        title: entry.title,
        content: entry.content
      });

      if (entry.attachmentId) {
        this.documentService.getAttachmentBlobAndType(entry.attachmentId).subscribe(({ blobUrl, type }) => {
          this.previewUrl = blobUrl;
          this.previewType = type;
        });
      }
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.form.patchValue({ attachment: file });
    this.previewUrl = null;
    this.previewType = null;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.currentUser) return;

    this.isSubmitting = true;
    const { title, content, attachment } = this.form.value;

    const submitWithAttachmentId = (attachmentId: string | undefined) => {
      const payload: BlogWikiDTO = {
        id: this.entryId,
        title,
        content,
        attachmentId,
      };

      this.blogWikiService.updateEntry(payload).subscribe({
        next: () => {
          alert(`${this.entryType} updated successfully!`);
          this.router.navigate(['/edit']);
        },
        error: () => alert('Error updating entry.'),
        complete: () => this.isSubmitting = false
      });
    };

    if (attachment) {
      this.documentService.uploadAttachment(attachment, this.currentUser!.id, 'content').subscribe({
        next: (newAttachmentId) => submitWithAttachmentId(newAttachmentId),
        error: () => {
          alert('Failed to upload new attachment.');
          this.isSubmitting = false;
        }
      });
    } else {
      submitWithAttachmentId(this.oldAttachmentId);
    }
  }
}
