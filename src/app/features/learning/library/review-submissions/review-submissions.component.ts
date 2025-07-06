import { Component, OnInit } from '@angular/core';
import { LearningSubmissionService } from '../services/learning-submission.service';
import { LearningMaterialTemplateService } from '../services/learning-material-template.service';
import { LearningDocumentService } from '../services/learning-document.service';
import { LearningSubmissionDTO } from '../models/learning-submission.model';
import { LearningMaterialTemplate } from '../models/learning-material-template.model';
import { SubmissionStatus } from '../models/submission-status.model';
import { UserService } from '../../../../user/user.service';
import { User } from '../../../../user/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-review-submissions',
  templateUrl: './review-submissions.component.html',
  styleUrls: ['./review-submissions.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ReviewSubmissionsComponent implements OnInit {
  submissions: LearningSubmissionDTO[] = [];
  templates: { [templateId: string]: LearningMaterialTemplate } = {};
  currentUser: User | null = null;
  templateFilter = '';
  statusFilter: SubmissionStatus | 'ALL' = 'ALL';

  attachments: {
    [submissionId: string]: {
      [sectionId: string]: { url: string; type: 'image' | 'video' | 'document' | null };
    };
  } = {};

  users: {
    [submissionId: string]:
    { user: User | null };
  } = {};


  constructor(
    private submissionService: LearningSubmissionService,
    private templateService: LearningMaterialTemplateService,
    private documentService: LearningDocumentService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (user?.role === 'MANAGER') {
        this.submissionService.getSubmissionsByManager(user.id).subscribe(subs => {
          this.submissions = subs;

          const templateIds = Array.from(new Set(subs.map(s => s.templateId)));
          templateIds.forEach(id => {
            this.templateService.getTemplateById(id).subscribe(template => {
              this.templates[template.id!] = template;
            });
          });

          subs.forEach(submission => {
            this.attachments[submission.id!] = {};
            if (submission.userId) {
              this.userService.getUserById(submission.userId).subscribe(user => {
                this.users[submission.id!] = { user: user };
              });
            }
            submission.sectionResponses.forEach(response => {
              if (response.documentId) {
                this.documentService.getAttachmentBlobAndType(response.documentId).subscribe(data => {
                  this.attachments[submission.id!][response.sectionTemplateId] = {
                    url: data.blobUrl,
                    type: data.type
                  };
                });
              }
            });
          });
        });
      }
    });
  }

  getFilteredSubmissions(): LearningSubmissionDTO[] {
    return this.submissions.filter(s => {
      const matchesStatus = this.statusFilter === 'ALL' || s.status === this.statusFilter;
      const template = this.templates[s.templateId];
      const matchesTemplate = !this.templateFilter || template?.title?.toLowerCase().includes(this.templateFilter.toLowerCase());

      return matchesStatus && matchesTemplate;
    });
  }

  getSectionTitle(templateId: string, sectionId: string): string {
    return this.templates[templateId]?.sections.find(s => s.id === sectionId)?.title || sectionId;
  }

  reviewSubmission(id: string, accepted: boolean) {
    this.submissionService.reviewSubmission(id, accepted).subscribe(() => {
      const submission = this.submissions.find(s => s.id === id);
      if (submission) {
        submission.status = accepted ? SubmissionStatus.APPROVED : SubmissionStatus.REJECTED;
      }
    });
  }
}
