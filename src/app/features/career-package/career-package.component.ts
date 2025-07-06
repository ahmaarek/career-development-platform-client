import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

import { CareerPackageService } from './career-package.service';
import { UserService } from '../../user/user.service';
import { UserCareerPackage } from './models/user-career-package.interface';
import { CareerPackageTemplate } from './models/career-package-template.interface';
import { UserSectionResponse } from './models/user-section-response.interface';
import { UserFieldResponse } from './models/user-field-response.interface';
import { SectionFieldTemplate } from './models/section-field-template.interface';
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




  private checkEnrollmentAndLoadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.careerPackageService.checkUserEnrollment(this.currentUserId).subscribe({
      next: (isEnrolled) => {
        this.isEnrolled = isEnrolled;

        if (isEnrolled) {

          this.loadUserCareerPackage();
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


  private initializeSectionForms(): void {
    if (!this.userCareerPackage) return;

    this.userCareerPackage.template.sections.forEach(section => {
      const formControls: { [key: string]: FormControl } = {};

      section.fields.forEach(field => {
        const existingResponse = this.getExistingFieldResponse(section.id, field.id);
        const initialValue = existingResponse ? existingResponse.value : '';

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


  getExistingFieldResponse(sectionId: string, fieldId: string): UserFieldResponse | null {
    if (!this.userCareerPackage) return null;

    const sectionResponse = this.userCareerPackage.sectionSubmissions.find(
      sr => sr.sectionTemplateId === sectionId
    );

    if (!sectionResponse) return null;

    return sectionResponse.fieldSubmissions.find(
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

    const sectionResponse = this.userCareerPackage.sectionSubmissions.find(
      sr => sr.sectionTemplateId === section.id
    );

    if (!sectionResponse) return 0;

    const totalFields = section.fields.length;
    const completedFields = sectionResponse.fieldSubmissions.filter(fr => fr.value.trim() !== '').length;

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

    const existingSectionResponse = this.userCareerPackage.sectionSubmissions?.find(
      resp => resp.sectionTemplateId === section.id
    );

    if (existingSectionResponse && existingSectionResponse.id) {
      const existingResponsesMap: Record<string, string | undefined> = Object.fromEntries(
        existingSectionResponse.fieldSubmissions.map(resp => [resp.fieldTemplateId, resp.id])
      );

      const fieldResponses: UserFieldResponse[] = [];
      const newFieldResponses: UserFieldResponse[] = [];

      section.fields.forEach(field => {
        const value = form.get(field.fieldKey)?.value || '';
        const existingId = existingResponsesMap[field.id];

        const response: UserFieldResponse = {
          fieldTemplateId: field.id,
          value
        };

        if (existingId) {
          response.id = existingId;
          fieldResponses.push(response);
        } else {
          newFieldResponses.push(response);
        }
      });

      this.careerPackageService.updateSectionResponse(
        existingSectionResponse.id,
        {
          userCareerPackageId: this.userCareerPackage.id,
          sectionTemplateId: section.id,
          fieldSubmissions: fieldResponses,
          newFieldSubmissions: newFieldResponses
        }
      ).subscribe({
        next: updatedResponse => {
          this.updateLocalSectionResponse(section.id, updatedResponse);
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
      const fieldResponses: UserFieldResponse[] = section.fields.map(field => {
        const value = form.get(field.fieldKey)?.value || '';
        return {
          fieldTemplateId: field.id,
          value
        };
      });

      console.log(fieldResponses);
      this.careerPackageService.submitCompleteSection(
        this.userCareerPackage.id,
        section.id,
        fieldResponses
      ).subscribe({
        next: newSectionResponse => {
          this.addLocalSectionResponse(newSectionResponse);
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

    const existingSectionResponse = this.userCareerPackage.sectionSubmissions.find(
      sr => sr.sectionTemplateId === section.id
    );

    return existingSectionResponse && existingSectionResponse.id ? 'Update Section' : 'Submit Section';
  }


  private updateLocalSectionResponse(sectionId: string, updatedSectionResponse: UserSectionResponse): void {
    if (!this.userCareerPackage) return;

    const sectionResponseIndex = this.userCareerPackage.sectionSubmissions.findIndex(
      sr => sr.sectionTemplateId === sectionId
    );

    if (sectionResponseIndex !== -1) {
      this.userCareerPackage.sectionSubmissions[sectionResponseIndex] = updatedSectionResponse;
    }
  }


  private addLocalSectionResponse(newSectionResponse: UserSectionResponse): void {
    if (!this.userCareerPackage) return;

    const existingIndex = this.userCareerPackage.sectionSubmissions.findIndex(
      sr => sr.sectionTemplateId === newSectionResponse.sectionTemplateId
    );

    if (existingIndex !== -1) {
      this.userCareerPackage.sectionSubmissions[existingIndex] = newSectionResponse;
    } else {

      this.userCareerPackage.sectionSubmissions.push(newSectionResponse);
    }
  }


  isFieldInvalid(sectionId: string, fieldKey: string): boolean {
    const form = this.sectionForms[sectionId];
    if (!form) return false;

    const control = form.get(fieldKey);
    return !!(control && control.invalid && control.touched);
  }


  canSubmitCompletePackage(): boolean {
    if (!this.userCareerPackage || this.isLoading) return false;

    // Prevent submission if package is already under review
    if (this.userCareerPackage.status === PackageStatus.UNDER_REVIEW) {
      return false;
    }

    // Ensure all required sections are filled
    const allSectionsComplete = this.userCareerPackage.template.sections.every(section => {
      // Skip LEARNING sections from this check
      if (section.type === 'LEARNING') return true;

      const sectionResponse = this.userCareerPackage!.sectionSubmissions.find(
        sr => sr.sectionTemplateId === section.id
      );

      if (!sectionResponse) return false;

      // Check if all fields have non-empty values
      return sectionResponse.fieldSubmissions.every(fr => fr.value.trim() !== '');
    });

    // Ensure all learning templates are approved
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

