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

  assigningUserId: string | null = null;
  selectedTemplateId: string | null = null;
  managerId: string = "";

  constructor(private userService: UserService, private careerPackageService: CareerPackageService) { }


  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(manager => {
      if (!manager?.id) return;
      this.managerId = manager.id;

      this.userService.getUsersByManagerId(manager.id).subscribe(users => {
        this.employees = users;

        // Check enrollment for each user
        users.forEach(user => {
          this.careerPackageService.checkUserEnrollment(user.id).subscribe(status => {
            this.enrollmentStatus[user.id] = status;
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

  closeModal(): void {
    this.assigningUserId = null;
    this.selectedTemplateId = null;
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
        this.closeModal();
      },
      error: (error) => {
        console.error('Error assigning career package:', error);
      }
    });
  }
  toggleUser(userId: string): void {
    this.expandedUsers[userId] = !this.expandedUsers[userId];
  }
}