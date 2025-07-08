import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

import { CareerPackageService } from './career-package.service';
import { UserService } from '../../user/user.service';
import { UserCareerPackage } from './models/user-career-package.interface';
import { UserSectionSubmission } from './models/user-section-submission.interface';
import { UserFieldSubmission } from './models/user-field-submission.interface';
import { SectionTemplate } from './models/section-template.interface';
import { PackageStatus } from './enums/package-status.enum';
import { CommonModule } from '@angular/common';
import { LearningSubmissionService } from '../learning/library/services/learning-submission.service';
import { LearningMaterialTemplate } from '../learning/library/models/learning-material-template.model';
import { SubmissionStatus } from '../learning/library/models/submission-status.model';


@Component({
  selector: 'app-career-package',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './career-package.component.html',
  styleUrls: ['./career-package.component.css']
})
export class CareerPackageComponent implements OnInit {
  currentUserId!: string;
  isLoading: boolean = false;
  isEnrolled: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  userCareerPackage: UserCareerPackage | null = null;
  sectionForms: { [sectionId: string]: FormGroup } = {};

  expandedSections: { [sectionId: string]: boolean } = {};

  learningTemplates: {
    template: LearningMaterialTemplate;
    status: SubmissionStatus;
  }[] = [];


  constructor(
    private careerPackageService: CareerPackageService,
    private userService: UserService,
    private learningSubmissionService: LearningSubmissionService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        console.log('current user id:', this.currentUserId);
        this.checkEnrollmentAndLoadData();

      },
      error: () => {
        this.isLoading = false;
      }
    });

  }



  private checkEnrollmentAndLoadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.careerPackageService.checkUserEnrollment(this.currentUserId).subscribe({
      next: (isEnrolled) => {
        this.isEnrolled = isEnrolled;

        if (isEnrolled) {

          this.loadUserCareerPackage();
        }
        else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.log('User is enrolled in a career package');
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
  }


  private loadUserCareerPackage(): void {
    this.careerPackageService.getUserCareerPackage(this.currentUserId).subscribe({
      next: (userPackage) => {
        this.userCareerPackage = userPackage;
        this.loadLearningTemplates();
        console.log('User Career Package:', this.userCareerPackage);
        this.initializeSectionForms();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
  }

  loadLearningTemplates(): void {
    if (!this.userCareerPackage) return;

    const userId = this.userCareerPackage.userId;
    const careerPackageId = this.userCareerPackage.template.id;

    this.learningSubmissionService.getSubmittedAndUnsubmittedTemplates(userId, careerPackageId)
      .subscribe(({ submittedTemplates, unsubmittedTemplates, allTemplates }) => {
        const result: {
          template: LearningMaterialTemplate;
          status: SubmissionStatus;
        }[] = [];

        for (const template of unsubmittedTemplates) {
          result.push({ template, status: SubmissionStatus.PENDING });
        }

        for (const submission of submittedTemplates) {
          const matchedTemplate = allTemplates.find(t => t.id === submission.templateId);
          if (matchedTemplate) {
            result.push({
              template: matchedTemplate,
              status: submission.status ?? SubmissionStatus.PENDING
            });
          }
        }

        this.learningTemplates = result;
      });
  }


  private initializeSectionForms(): void {
    if (!this.userCareerPackage) return;

    this.userCareerPackage.template.sections.forEach(section => {
      const formControls: { [key: string]: FormControl } = {};

      section.fields.forEach(field => {
        const existingSubmission = this.getExistingFieldSubmission(section.id, field.id);
        const initialValue = existingSubmission ? existingSubmission.value : '';

        const validators = [];
        validators.push(Validators.required);

        switch (field.fieldType) {
          case 'email':
            validators.push(Validators.email);
            break;
          case 'number':
            validators.push(Validators.pattern(/^\d+$/));
            break;
          case 'text':
            if (field.required) {
              validators.push(Validators.minLength(1));
            }
            break;
          case 'textarea':
            if (field.required) {
              validators.push(Validators.minLength(10));
            }
            break;
        }

        formControls[field.fieldKey] = new FormControl(initialValue, validators);
      });

      this.sectionForms[section.id] = this.formBuilder.group(formControls);
    });
  }


  getExistingFieldSubmission(sectionId: string, fieldId: string): UserFieldSubmission | null {
    if (!this.userCareerPackage) return null;

    const sectionSubmission = this.userCareerPackage.sectionSubmissions.find(
      sr => sr.sectionTemplateId === sectionId
    );

    if (!sectionSubmission) return null;

    return sectionSubmission.fieldSubmissions.find(
      fr => fr.fieldTemplateId === fieldId
    ) || null;
  }


  toggleSection(sectionId: string): void {
    this.expandedSections[sectionId] = !this.expandedSections[sectionId];
  }

  isSectionExpanded(sectionId: string): boolean {
    return !!this.expandedSections[sectionId];
  }

  getSectionCompletionPercentage(section: SectionTemplate): number {
    if (!this.userCareerPackage) return 0;

    const sectionSubmission = this.userCareerPackage.sectionSubmissions.find(
      sr => sr.sectionTemplateId === section.id
    );

    if (!sectionSubmission) return 0;

    const totalFields = section.fields.length;
    const completedFields = sectionSubmission.fieldSubmissions.filter(fr => fr.value.trim() !== '').length;

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  }

  getLearningSectionCompletionPercentage(): number {
    if (!this.learningTemplates || this.learningTemplates.length === 0) {
      return 0;
    }

    const approvedCount = this.learningTemplates.filter(
      lt => lt.status === SubmissionStatus.APPROVED
    ).length;

    return Math.round((approvedCount / this.learningTemplates.length) * 100);
  }



  getOverallCompletionPercentage(): number {
    if (!this.userCareerPackage) return 0;

    const nonLearningSections = this.userCareerPackage.template.sections.filter(
      section => section.type !== 'LEARNING'
    );

    const sectionCount = nonLearningSections.length + (this.learningTemplates?.length ? 1 : 0);
    if (sectionCount === 0) return 0;

    const totalSectionPercentage = nonLearningSections.reduce((sum, section) => {
      return sum + this.getSectionCompletionPercentage(section);
    }, 0);

    const learningPercentage = this.learningTemplates?.length
      ? this.getLearningSectionCompletionPercentage()
      : 0;

    const totalPercentage = totalSectionPercentage + learningPercentage;

    return Math.round(totalPercentage / sectionCount);
  }


  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  submitSection(section: SectionTemplate): void {
    if (!this.userCareerPackage) return;

    const form = this.sectionForms[section.id];
    if (!form) return;

    if (form.invalid) {
      this.errorMessage = 'Please fill in all required fields before submitting.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const existingSectionSubmission = this.userCareerPackage.sectionSubmissions?.find(
      resp => resp.sectionTemplateId === section.id
    );

    if (existingSectionSubmission && existingSectionSubmission.id) {
      const existingSubmissionsMap: Record<string, string | undefined> = Object.fromEntries(
        existingSectionSubmission.fieldSubmissions.map(resp => [resp.fieldTemplateId, resp.id])
      );

      const fieldSubmissions: UserFieldSubmission[] = [];
      const newFieldSubmissions: UserFieldSubmission[] = [];

      section.fields.forEach(field => {
        const value = form.get(field.fieldKey)?.value || '';
        const existingId = existingSubmissionsMap[field.id];

        const submission: UserFieldSubmission = {
          fieldTemplateId: field.id,
          value
        };

        if (existingId) {
          submission.id = existingId;
          fieldSubmissions.push(submission);
        } else {
          newFieldSubmissions.push(submission);
        }
      });

      this.careerPackageService.updateSectionSubmission(
        existingSectionSubmission.id,
        {
          userCareerPackageId: this.userCareerPackage.id,
          sectionTemplateId: section.id,
          fieldSubmissions: fieldSubmissions,
          newFieldSubmissions: newFieldSubmissions
        }
      ).subscribe({
        next: updatedSubmission => {
          const sectionSubmissionIndex = this.userCareerPackage!.sectionSubmissions.findIndex(
            sr => sr.sectionTemplateId === section.id
          );

          if (sectionSubmissionIndex !== -1) {
            this.userCareerPackage!.sectionSubmissions[sectionSubmissionIndex] = updatedSubmission;
          }

          this.successMessage = `${section.title} section updated successfully!`;
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: error => {
          this.errorMessage = error.message;
          this.isLoading = false;
        }
      });

    } else {
      // First-time submission
      const fieldSubmissions: UserFieldSubmission[] = section.fields.map(field => {
        const value = form.get(field.fieldKey)?.value || '';
        return {
          fieldTemplateId: field.id,
          value
        };
      });
      console.log(fieldSubmissions);
      this.careerPackageService.submitCompleteSection(
        this.userCareerPackage.id,
        section.id,
        fieldSubmissions
      ).subscribe({
        next: newSectionSubmission => {
          const existingIndex = this.userCareerPackage!.sectionSubmissions.findIndex(
            sr => sr.sectionTemplateId === newSectionSubmission.sectionTemplateId
          );

          if (existingIndex !== -1) {
            this.userCareerPackage!.sectionSubmissions[existingIndex] = newSectionSubmission;
          } else {
            this.userCareerPackage!.sectionSubmissions.push(newSectionSubmission);
          }

          this.successMessage = `${section.title} section submitted successfully!`;
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: error => {
          this.errorMessage = error.message;
          this.isLoading = false;
        }
      });
    }

    this.ngOnInit();
  }

  isSectionSubmitDisabled(sectionId: string): boolean {
    if (this.isLoading) return true;

    const form = this.sectionForms[sectionId];
    if (!form) return true;

    const section = this.userCareerPackage?.template.sections.find(s => s.id === sectionId);
    if (!section) return true;

    const hasRequiredEmptyFields = section.fields.some(field => {
      if (!field.required) return false;
      const control = form.get(field.fieldKey);
      return !control || !control.value || control.value.trim() === '';
    });

    return hasRequiredEmptyFields;
  }


  getSectionSubmitButtonText(section: SectionTemplate): string {
    if (!this.userCareerPackage) return 'Submit Section';

    const existingSectionSubmission = this.userCareerPackage.sectionSubmissions.find(
      sr => sr.sectionTemplateId === section.id
    );

    return existingSectionSubmission && existingSectionSubmission.id ? 'Update Section' : 'Submit Section';
  }

  isFieldInvalid(sectionId: string, fieldKey: string): boolean {
    const form = this.sectionForms[sectionId];
    if (!form) return false;

    const control = form.get(fieldKey);
    return !!(control && control.invalid && control.touched);
  }


  canSubmitCompletePackage(): boolean {
    if (!this.userCareerPackage || this.isLoading) return false;

    if (this.userCareerPackage.status === PackageStatus.UNDER_REVIEW) {
      return false;
    }

    const allSectionsComplete = this.userCareerPackage.template.sections.every(section => {
      if (section.type === 'LEARNING') return true;

      const sectionSubmission = this.userCareerPackage!.sectionSubmissions.find(
        sr => sr.sectionTemplateId === section.id
      );

      if (!sectionSubmission) return false;

      return sectionSubmission.fieldSubmissions.every(fr => fr.value.trim() !== '');
    });


    const allLearningApproved = this.learningTemplates?.every(
      lt => lt.status === SubmissionStatus.APPROVED
    );

    return allSectionsComplete && allLearningApproved;
  }



  submitCompleteCareerPackage(): void {
    if (!this.userCareerPackage || !this.canSubmitCompletePackage()) return;

    this.isLoading = true;
    this.errorMessage = '';

    console.log(this.userCareerPackage);
    // Submit the complete package
    this.careerPackageService.submitCompleteCareerPackage(this.userCareerPackage).subscribe({
      next: (updatedPackage) => {
        this.userCareerPackage = updatedPackage;
        this.successMessage = 'Career package submitted successfully for review!';
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
    this.ngOnInit();
  }

  getSubmissionStatusMessage(): string {
    if (!this.userCareerPackage) return '';

    switch (this.userCareerPackage.status) {

      case PackageStatus.IN_PROGRESS:
        return 'Package in progress';
      case PackageStatus.UNDER_REVIEW:
        return 'Package submitted and under review';
      case PackageStatus.APPROVED:
        return 'Package completed';
      case PackageStatus.REJECTED:
        return 'Package rejected';
      default:
        return '';
    }
  }

  isPackageSubmitted(): boolean {
    if (!this.userCareerPackage) return false;
    return this.userCareerPackage.status === PackageStatus.UNDER_REVIEW
  }
  isPackageApproved(): boolean {
    if (!this.userCareerPackage) return false;
    return this.userCareerPackage.status === PackageStatus.APPROVED
  }
  isPackageRejected(): boolean {
    if (!this.userCareerPackage) return false;
    return this.userCareerPackage.status === PackageStatus.REJECTED
  }
}

