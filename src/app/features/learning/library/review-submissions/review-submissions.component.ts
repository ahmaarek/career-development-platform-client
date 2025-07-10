import { Component, OnInit } from '@angular/core';
import { forkJoin, of, switchMap } from 'rxjs';
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
import { AlertService } from '../../../alert/alert.service';

@Component({
  selector: 'app-review-submissions',
  templateUrl: './review-submissions.component.html',
  styleUrls: ['./review-submissions.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ReviewSubmissionsComponent implements OnInit {
  submissions: LearningSubmissionDTO[] = [];
  templates: Record<string, LearningMaterialTemplate> = {};
  attachments: Record<string, Record<string, { url: string; type: 'image' | 'video' | 'document' | null }>> = {};
  users: Record<string, { user: User | null }> = {};
  currentUser: User | null = null;

  templateFilter = '';
  statusFilter: SubmissionStatus | 'ALL' = 'ALL';

  constructor(
    private submissionService: LearningSubmissionService,
    private templateService: LearningMaterialTemplateService,
    private documentService: LearningDocumentService,
    private userService: UserService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.userService.getCurrentUser().pipe(
      switchMap(user => {
        this.currentUser = user;
        if (user?.role !== 'MANAGER') return of([]);
        return this.submissionService.getSubmissionsByManager(user.id);
      })
    ).subscribe(subs => {
      this.submissions = subs;
      this.loadTemplates(subs);
      this.loadUsersAndAttachments(subs);
    });
  }

  private loadTemplates(subs: LearningSubmissionDTO[]) {
    const templateIds = Array.from(new Set(subs.map(s => s.templateId)));
    forkJoin(
      templateIds.map(id => this.templateService.getTemplateById(id))
    ).subscribe(results => {
      results.forEach(t => this.templates[t.id!] = t);
    });
  }

  private loadUsersAndAttachments(subs: LearningSubmissionDTO[]) {
    subs.forEach(sub => {
      this.attachments[sub.id!] = {};

      if (sub.userId) {
        this.userService.getUserById(sub.userId).subscribe(user => {
          this.users[sub.id!] = { user };
        });
      }

      sub.sectionResponses.forEach(resp => {
        if (resp.documentId) {
          this.documentService.getAttachmentBlobAndType(resp.documentId).subscribe(data => {
            this.attachments[sub.id!][resp.sectionTemplateId] = {
              url: data.blobUrl,
              type: data.type
            };
          });
        }
      });
    });
  }

  getFilteredSubmissions(): LearningSubmissionDTO[] {
    return this.submissions.filter(sub => {
      const matchesStatus = this.statusFilter === 'ALL' || sub.status === this.statusFilter;
      const matchesTemplate = !this.templateFilter ||
        this.templates[sub.templateId]?.title?.toLowerCase().includes(this.templateFilter.toLowerCase());
      return matchesStatus && matchesTemplate;
    });
  }

  getSectionTitle(templateId: string, sectionId: string): string {
    return this.templates[templateId]?.sections.find(s => s.id === sectionId)?.title || sectionId;
  }

  reviewSubmission(id: string, accepted: boolean) {
    this.submissionService.reviewSubmission(id, accepted).subscribe({
      next: () => {
        const sub = this.submissions.find(s => s.id === id);
        if (sub) {
          sub.status = accepted ? SubmissionStatus.APPROVED : SubmissionStatus.REJECTED;
        }

        this.alertService.showAlert(
          'success',
          `Submission ${accepted ? 'approved' : 'rejected'} successfully.`
        );

        this.ngOnInit();
      },
      error: () => {
        this.alertService.showAlert('error', 'Review failed. Please try again.');
      }
    });
  }

}
