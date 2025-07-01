import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../user/user.service';
import { User } from '../../../user/user.model';
import { CareerPackageService } from '../../career-package/career-package.service';
import { CareerPackageTemplate } from '../../career-package/models/career-package-template.interface';
import { FormsModule } from '@angular/forms';
import { UserCareerPackage } from '../../career-package/models/user-career-package.interface';

@Component({
  selector: 'app-career-package-review',
  imports: [CommonModule, FormsModule],
  templateUrl: './career-package-review.component.html',
  styleUrls: ['./career-package-review.component.css']
})
export class CareerPackageReviewComponent implements OnInit {
  employees: User[] = [];
  expandedUsers: Record<string, boolean> = {};
  enrollmentStatus: Record<string, boolean> = {};
  careerPackageTemplates: CareerPackageTemplate[] = [];
  userPackages: Record<string, UserCareerPackage> = {};
  reviewingUserId: string | null = null;
  viewingUserId: string | null = null;

  assigningUserId: string | null = null;
  selectedTemplateId: string | null = null;
  managerId: string = "";

  commentDraft: Record<string, string> = {};
  savedComments: Record<string, string> = {};
  showCommentBox: Record<string, boolean> = {};

  constructor(private userService: UserService, private careerPackageService: CareerPackageService) { }


  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(manager => {
      if (!manager?.id) return;
      this.managerId = manager.id;

      this.userService.getUsersByManagerId(manager.id).subscribe(users => {
        this.employees = users;

        // Check enrollment for each user
        users.forEach(user => {
          this.careerPackageService.getUserCareerPackage(user.id).subscribe(pkg => {
            if (pkg.status !== 'APPROVED') {
              this.enrollmentStatus[user.id] = true;
              this.userPackages[user.id] = pkg;
            }
          }, err => {
            if (err.status === 404) {
              this.enrollmentStatus[user.id] = false;
            }
          });
        });
      });
    });

    this.careerPackageService.getAllCareerPackageTemplates().subscribe(templates => {
      this.careerPackageTemplates = templates;
    });

    console.log(this.enrollmentStatus);
  }

  openAssignModal(userId: string): void {
    this.assigningUserId = userId;
    const defaultTemplate = this.careerPackageTemplates.find(t => t.title === 'Associate Software Engineer');
    this.selectedTemplateId = defaultTemplate?.id || this.careerPackageTemplates[0]?.id;
  }

  closeAssignModal(): void {
    this.assigningUserId = null;
    this.selectedTemplateId = null;
  }

  openReviewModal(userId: string): void {
    this.reviewingUserId = userId;
  }

  closeReviewModal(): void {
    this.reviewingUserId = null;
  }

  openViewModal(userId: string): void {
    this.viewingUserId = userId;
  }

  closeViewModal(): void {
    this.viewingUserId = null;
  }

  addComment(userId: string): void {
    this.showCommentBox[userId] = true;
    if (!this.commentDraft[userId]) {
      this.commentDraft[userId] = '';
    }
  }

  submitComment(userId: string): void {
    this.savedComments[userId] = this.commentDraft[userId];
    this.userPackages[userId].reviewerComment = this.savedComments[userId];
    this.showCommentBox[userId] = false;
  }


  approveSubmission(userId: string): void {
    this.careerPackageService.ApproveCareerPackage(this.userPackages[userId]).subscribe({
      next: (response: UserCareerPackage) => {
        delete this.userPackages[userId];
        this.enrollmentStatus[userId] = false;
        this.closeReviewModal();
      },
      error: (error) => {
        console.error('Error approving career package:', error);
      }
    });
  }

  rejectSubmission(userId: string): void {
    this.careerPackageService.RejectCareerPackage(this.userPackages[userId]).subscribe({
      next: (response: UserCareerPackage) => {
        this.userPackages[userId] = response;
        this.enrollmentStatus[userId] = true;
        this.closeReviewModal();
      },
      error: (error) => {
        console.error('Error rejecting career package:', error);
      }
    });

  }

  confirmAssign(): void {
    if (!this.selectedTemplateId || !this.assigningUserId) return;

    const request = {
      userId: this.assigningUserId,
      reviewerId: this.managerId,
      templateId: this.selectedTemplateId,
      status: 'IN_PROGRESS'
    };

    this.careerPackageService.assignCareerPackage(request).subscribe({
      next: (response: UserCareerPackage) => {
        this.enrollmentStatus[this.assigningUserId!] = true;
        this.closeAssignModal();
      },
      error: (error) => {
        console.error('Error assigning career package:', error);
      }
    });
  }
  toggleUser(userId: string): void {
    this.expandedUsers[userId] = !this.expandedUsers[userId];
  }

  getSectionTitle(sectionTemplateId: string): string {
    for (const template of this.careerPackageTemplates) {
      const found = template.sections.find(section => section.id === sectionTemplateId);
      if (found) return found.title;
    }
    return 'Untitled Section';
  }

  getFieldLabel(sectionTemplateId: string, fieldTemplateId: string): string {
    for (const template of this.careerPackageTemplates) {
      const section = template.sections.find(s => s.id === sectionTemplateId);
      if (section) {
        const field = section.fields.find(f => f.id === fieldTemplateId);
        if (field) return field.label;
      }
    }
    return 'Unnamed Field';
  }
}