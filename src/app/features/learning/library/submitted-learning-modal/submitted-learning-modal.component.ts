import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LearningDocumentService } from '../services/learning-document.service';
import { LearningSubmissionDTO } from '../models/learning-submission.model';
import { LearningMaterialTemplate } from '../models/learning-material-template.model';
import { CommonModule } from '@angular/common';
import { LearningMaterialTemplateService } from '../services/learning-material-template.service';

@Component({
  selector: 'app-submitted-learning-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './submitted-learning-modal.component.html',
  styleUrls: ['./submitted-learning-modal.component.css']
})
export class SubmittedLearningModalComponent implements OnInit {
  @Input() submission!: LearningSubmissionDTO;
  @Output() close = new EventEmitter<void>();

  template: LearningMaterialTemplate | null = null;
  attachmentUrls: { [sectionId: string]: { url: string; type: 'image' | 'video' | 'document' | null } } = {};

  constructor(private documentService: LearningDocumentService,
    private learningMaterialTemplateService: LearningMaterialTemplateService) { }

  ngOnInit(): void {
    this.submission.sectionResponses.forEach(response => {
      console.log('Processing response for section:', response);
      if (response.documentId) {
        this.documentService.getAttachmentBlobAndType(response.documentId).subscribe(data => {
          this.attachmentUrls[response.sectionTemplateId] = {
            url: data.blobUrl,
            type: data.type
          };
        });
      }
    });

    if (this.submission.templateId) {
      this.learningMaterialTemplateService.getTemplateById(this.submission.templateId).subscribe(template => {
        this.template = template;
      });
    }
  }



  onCloseClicked() {
    this.close.emit();
  }

  getResponseForSection(sectionId: string) {
    return this.submission.sectionResponses.find(r => r.sectionTemplateId === sectionId);
  }

}
