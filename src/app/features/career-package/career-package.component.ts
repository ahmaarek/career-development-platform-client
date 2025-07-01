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

  constructor(
    private careerPackageService: CareerPackageService,
    private userService: UserService,
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
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
  }

  
  private loadUserCareerPackage(): void {
    this.careerPackageService.getUserCareerPackage(this.currentUserId).subscribe({
      next: (userPackage) => {
        this.userCareerPackage = userPackage;
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

    const sectionResponse = this.userCareerPackage.sectionResponses.find(
      sr => sr.sectionTemplateId === sectionId
    );

    if (!sectionResponse) return null;

    return sectionResponse.fieldResponses.find(
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

    const sectionResponse = this.userCareerPackage.sectionResponses.find(
      sr => sr.sectionTemplateId === section.id
    );

    if (!sectionResponse) return 0;

    const totalFields = section.fields.length;
    const completedFields = sectionResponse.fieldResponses.filter(fr => fr.value.trim() !== '').length;

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  }

  
  getOverallCompletionPercentage(): number {
    if (!this.userCareerPackage) return 0;

    const sections = this.userCareerPackage.template.sections;
    if (sections.length === 0) return 0;

    const totalPercentage = sections.reduce((sum, section) => {
      return sum + this.getSectionCompletionPercentage(section);
    }, 0);

    return Math.round(totalPercentage / sections.length);
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

    // Check if section response already exists
    const existingSectionResponse = this.userCareerPackage.sectionResponses?.find(
      resp => resp.sectionTemplateId === section.id
    );

    if (existingSectionResponse && existingSectionResponse.id) {

      let existingResponsesMap: Record<string, string | undefined> = {};
      existingResponsesMap = Object.fromEntries(
        existingSectionResponse.fieldResponses.map(resp => [resp.fieldTemplateId, resp.id])
      );

      const fieldResponses: UserFieldResponse[] = section.fields.map(field => {
        const value = form.get(field.fieldKey)?.value || '';
        const id = existingResponsesMap[field.id]; // field.id is fieldTemplateId

        return {
          id,
          fieldTemplateId: field.id,
          value
        };
      });
      // Update existing section response
      this.careerPackageService.updateSectionResponse(
        existingSectionResponse.id,
        {
          userCareerPackageId: this.userCareerPackage.id,
          sectionTemplateId: section.id,
          fieldResponses: fieldResponses
        }
      ).subscribe({
        next: (updatedResponse) => {
          this.updateLocalSectionResponse(section.id, updatedResponse);
          this.successMessage = `${section.title} section updated successfully!`;
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.isLoading = false;
        }
      });

    } else {

      const fieldResponses: UserFieldResponse[] = section.fields.map(field => {
        const value = form.get(field.fieldKey)?.value || '';
        return {
          fieldTemplateId: field.id,
          value
        };
      });

      // Create new section response
      this.careerPackageService.submitCompleteSection(
        this.userCareerPackage.id,
        section.id,
        fieldResponses
      ).subscribe({
        next: (newSectionResponse) => {
          this.addLocalSectionResponse(newSectionResponse);
          this.successMessage = `${section.title} section submitted successfully!`;
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
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

    const existingSectionResponse = this.userCareerPackage.sectionResponses.find(
      sr => sr.sectionTemplateId === section.id
    );

    return existingSectionResponse && existingSectionResponse.id ? 'Update Section' : 'Submit Section';
  }

  
  private updateLocalSectionResponse(sectionId: string, updatedSectionResponse: UserSectionResponse): void {
    if (!this.userCareerPackage) return;

    const sectionResponseIndex = this.userCareerPackage.sectionResponses.findIndex(
      sr => sr.sectionTemplateId === sectionId
    );

    if (sectionResponseIndex !== -1) {
      this.userCareerPackage.sectionResponses[sectionResponseIndex] = updatedSectionResponse;
    }
  }

  
  private addLocalSectionResponse(newSectionResponse: UserSectionResponse): void {
    if (!this.userCareerPackage) return;

    const existingIndex = this.userCareerPackage.sectionResponses.findIndex(
      sr => sr.sectionTemplateId === newSectionResponse.sectionTemplateId
    );

    if (existingIndex !== -1) {
      this.userCareerPackage.sectionResponses[existingIndex] = newSectionResponse;
    } else {
      
      this.userCareerPackage.sectionResponses.push(newSectionResponse);
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

    // Check if package is already submitted or under review
    if (this.userCareerPackage.status === PackageStatus.UNDER_REVIEW ||
      this.userCareerPackage.status === PackageStatus.APPROVED) {
      return false;
    }

    
    return this.userCareerPackage.template.sections.every(section => {
      const sectionResponse = this.userCareerPackage!.sectionResponses.find(
        sr => sr.sectionTemplateId === section.id
      );

      if (!sectionResponse) return false;

      // Check if all fields in the section have values
      return sectionResponse.fieldResponses.every(fr => fr.value.trim() !== '');
    });
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
  }

  getSubmissionStatusMessage(): string {
    if (!this.userCareerPackage) return '';

    switch (this.userCareerPackage.status) {
      case PackageStatus.NOT_STARTED:
        return 'Package not started';
      case PackageStatus.IN_PROGRESS:
        return 'Package in progress';
      case PackageStatus.UNDER_REVIEW:
        return 'Package submitted and under review';
      case PackageStatus.APPROVED:
        return 'Package completed';
      default:
        return '';
    }
  }

  isPackageSubmitted(): boolean {
    if (!this.userCareerPackage) return false;
    return this.userCareerPackage.status === PackageStatus.UNDER_REVIEW ||
      this.userCareerPackage.status === PackageStatus.COMPLETED;
  }
}

