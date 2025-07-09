import { Component, EventEmitter, Input, Output } from '@angular/core';
import { combineLatest, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LearningMaterialTemplate } from '../models/learning-material-template.model';
import { User } from '../../../../user/user.model';
import { LearningDocumentService } from '../services/learning-document.service';
import { LearningSubmissionService } from '../services/learning-submission.service';
import { LearningSectionResponseDTO, LearningSubmissionDTO } from '../models/learning-submission.model';
import { SubmissionStatus } from '../models/submission-status.model';
import { UserService } from '../../../../user/user.service';
import { AlertService } from '../../../alert/alert.service';

@Component({
  selector: 'app-learning-template-modal',
  templateUrl: './learning-template-modal.component.html',
  styleUrls: ['./learning-template-modal.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LearningTemplateModalComponent {
  @Input() template!: LearningMaterialTemplate;
  @Input() currentUser!: User;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  submissionText: { [sectionId: string]: string } = {};
  submissionFiles: { [sectionId: string]: File | null } = {};
  sectionsAttachmentData: { [index: number]: { url: string, type: 'image' | 'video' | 'document' | null } } = {};

  constructor(
    private documentService: LearningDocumentService,
    private submissionService: LearningSubmissionService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadAttachments();
  }

  convertNewlines(content: string): string {
    return content.replace(/\n/g, '<br/>');
  }

  loadAttachments(): void {
    this.template.sections.forEach((section, i) => {
      if (section.attachmentId) {
        this.documentService.getAttachmentBlobAndType(section.attachmentId).subscribe(data => {
          this.sectionsAttachmentData[i] = {
            url: data.blobUrl,
            type: data.type
          };
        });
      }
    });
  
  }

  onFileSelected(event: Event, sectionId: string) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.submissionFiles[sectionId] = file;
    }
  }

  submit(): void {
    const sections = this.template.sections;
    const uploadObservables = sections.map(section => {
      const file = this.submissionFiles[section.id!] || null;
      return file
        ? this.documentService.uploadAttachment(file, this.currentUser.id, 'submission')
        : of(null);
    });

    combineLatest(uploadObservables).subscribe(attachmentIds => {
      const sectionResponses: LearningSectionResponseDTO[] = sections.map((section, i) => ({
        sectionTemplateId: section.id!,
        userInput: this.submissionText[section.id!] || '',
        documentId: attachmentIds[i] || undefined
      }));

      const payload: LearningSubmissionDTO = {
        userId: this.currentUser.id,
        templateId: this.template.id!,
        sectionResponses,
        status: SubmissionStatus.PENDING,
        managerId: this.currentUser.managerId ?? undefined
      };

      this.submissionService.submitLearningMaterial(payload).subscribe({
        next: () => {
          this.alertService.showAlert('success','Submitted successfully!');
          this.close.emit();
          this.submitted.emit();
        },
        error: () => this.alertService.showAlert('success','Submission failed.')
      });
    });
  }
}
