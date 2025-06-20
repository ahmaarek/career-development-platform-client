import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

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
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
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

  /*
    Check if user is enrolled and load appropriate data
  */
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

  /**
   * Load user's career package data
   */
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

  /**
   * Initialize forms for each section
   */
  private initializeSectionForms(): void {
    if (!this.userCareerPackage) return;

    this.userCareerPackage.template.sections.forEach(section => {
      const formControls: { [key: string]: FormControl } = {};

      section.fields.forEach(field => {
        const existingResponse = this.getExistingFieldResponse(section.id, field.id);
        const initialValue = existingResponse ? existingResponse.value : '';

        // Add validators based on field requirements
        const validators = [];
        if (field.required) {
          validators.push(Validators.required);
        }

        // Add specific validators based on field type
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

  /**
   * Get existing field response for a specific field (public method for template)
   */
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

  /**
   * Get overall package completion percentage
   */
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

  const invalidFields = this.getInvalidFieldsInSection(section);
  if (invalidFields.length > 0) {
    this.errorMessage = `Please fix the following fields before submitting: ${invalidFields.join(', ')}`;
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  
  const fieldResponses: UserFieldResponse[] = section.fields.map(field => {
    const value = form.get(field.fieldKey)?.value || '';
    return {
      fieldTemplateId: field.id,
      value
    };
  });

  // Check if section response already exists
  const existingSectionResponse = this.userCareerPackage.sectionResponses?.find(
    resp => resp.sectionTemplateId === section.id
  );

  if (existingSectionResponse && existingSectionResponse.id) {
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
        this.updateLocalSectionResponse(section.id,updatedResponse);
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
}


  /**
   * Check if section submit button should be disabled
   */
  isSectionSubmitDisabled(sectionId: string): boolean {
    if (this.isLoading) return true;

    const form = this.sectionForms[sectionId];
    if (!form) return true;

    // Check if any required field is empty
    const section = this.userCareerPackage?.template.sections.find(s => s.id === sectionId);
    if (!section) return true;

    const hasRequiredEmptyFields = section.fields.some(field => {
      if (!field.required) return false;
      const control = form.get(field.fieldKey);
      return !control || !control.value || control.value.trim() === '';
    });

    return hasRequiredEmptyFields;
  }

  /**
   * Get the text for section submit button
   */
  getSectionSubmitButtonText(section: SectionTemplate): string {
    if (!this.userCareerPackage) return 'Submit Section';

    const existingSectionResponse = this.userCareerPackage.sectionResponses.find(
      sr => sr.sectionTemplateId === section.id
    );

    return existingSectionResponse && existingSectionResponse.id ? 'Update Section' : 'Submit Section';
  }

  /**
   * Check if section has been submitted
   */
  isSectionSubmitted(sectionId: string): boolean {
    if (!this.userCareerPackage) return false;

    const sectionResponse = this.userCareerPackage.sectionResponses.find(
      sr => sr.sectionTemplateId === sectionId
    );

    return !!(sectionResponse && sectionResponse.id);
  }

  /**
   * Get invalid fields in a section
   */
  private getInvalidFieldsInSection(section: SectionTemplate): string[] {
    const form = this.sectionForms[section.id];
    if (!form) return [];

    const invalidFields: string[] = [];

    section.fields.forEach(field => {
      const control = form.get(field.fieldKey);
      if (control && control.invalid) {
        invalidFields.push(field.label);
      }
    });

    return invalidFields;
  }

  /**
   * Update local section response after successful API call
   */
  private updateLocalSectionResponse(sectionId: string, updatedSectionResponse: UserSectionResponse): void {
    if (!this.userCareerPackage) return;

    const sectionResponseIndex = this.userCareerPackage.sectionResponses.findIndex(
      sr => sr.sectionTemplateId === sectionId
    );

    if (sectionResponseIndex !== -1) {
      this.userCareerPackage.sectionResponses[sectionResponseIndex] = updatedSectionResponse;
    }
  }

  /**
   * Add new section response to local data after successful API call
   */
  private addLocalSectionResponse(newSectionResponse: UserSectionResponse): void {
    if (!this.userCareerPackage) return;

    const existingIndex = this.userCareerPackage.sectionResponses.findIndex(
      sr => sr.sectionTemplateId === newSectionResponse.sectionTemplateId
    );

    if (existingIndex !== -1) {
      // Replace existing section response
      this.userCareerPackage.sectionResponses[existingIndex] = newSectionResponse;
    } else {
      // Add new section response
      this.userCareerPackage.sectionResponses.push(newSectionResponse);
    }
  }

  /**
   * Check if a field is invalid and has been touched
   */
  isFieldInvalid(sectionId: string, fieldKey: string): boolean {
    const form = this.sectionForms[sectionId];
    if (!form) return false;

    const control = form.get(fieldKey);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Get validation error message for a field
   */
  getFieldErrorMessage(sectionId: string, fieldKey: string, fieldLabel: string): string {
    const form = this.sectionForms[sectionId];
    if (!form) return '';

    const control = form.get(fieldKey);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return `${fieldLabel} is required.`;
    }
    if (control.errors['email']) {
      return `Please enter a valid email address.`;
    }
    if (control.errors['pattern']) {
      return `Please enter a valid number.`;
    }
    if (control.errors['minlength']) {
      return `${fieldLabel} must be at least ${control.errors['minlength'].requiredLength} characters long.`;
    }

    return 'Please enter a valid value.';
  }

  /**
   * Check if submit button should be disabled for a field
   */
  isSubmitDisabled(sectionId: string, fieldKey: string): boolean {
    const form = this.sectionForms[sectionId];
    if (!form) return true;

    const control = form.get(fieldKey);
    return !!(control && (control.invalid || this.isLoading));
  }

  /**
   * Check if the entire career package can be submitted
   */
  canSubmitCompletePackage(): boolean {
    if (!this.userCareerPackage || this.isLoading) return false;

    // Check if package is already submitted or under review
    if (this.userCareerPackage.status === PackageStatus.UNDER_REVIEW ||
      this.userCareerPackage.status === PackageStatus.COMPLETED) {
      return false;
    }

    // Check if at least one field has been filled in each section
    return this.userCareerPackage.template.sections.every(section => {
      const sectionResponse = this.userCareerPackage!.sectionResponses.find(
        sr => sr.sectionTemplateId === section.id
      );

      if (!sectionResponse) return false;

      // Check if at least one field in this section has a value
      return sectionResponse.fieldResponses.some(fr => fr.value.trim() !== '');
    });
  }

  /**
   * Submit the complete career package with all section responses
   */
  submitCompleteCareerPackage(): void {
    if (!this.userCareerPackage || !this.canSubmitCompletePackage()) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Collect all current form data and update section responses
    this.collectAllFormData();

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

  /**
   * Collect all form data and update the userCareerPackage object
   */
  private collectAllFormData(): void {
    if (!this.userCareerPackage) return;

    this.userCareerPackage.template.sections.forEach(section => {
      const form = this.sectionForms[section.id];
      if (!form) return;

      // Get or create section response
      let sectionResponse = this.userCareerPackage!.sectionResponses.find(
        sr => sr.sectionTemplateId === section.id
      );

      if (!sectionResponse) {
        sectionResponse = {
          id: undefined,
          userCareerPackageId: this.userCareerPackage!.id,
          sectionTemplateId: section.id,
          fieldResponses: []
        };
        this.userCareerPackage!.sectionResponses.push(sectionResponse);
      }

      // Update field responses with current form values
      section.fields.forEach(field => {
        const fieldControl = form.get(field.fieldKey);
        if (!fieldControl) return;

        const fieldValue = fieldControl.value || '';

        // Find existing field response or create new one
        let fieldResponse = sectionResponse!.fieldResponses.find(
          fr => fr.fieldTemplateId === field.id
        );

        if (fieldResponse) {
          // Update existing field response
          fieldResponse.value = fieldValue;
        } else if (fieldValue.trim() !== '') {
          // Create new field response only if there's a value
          fieldResponse = {
            id: undefined,
            sectionResponseId: sectionResponse!.id,
            fieldTemplateId: field.id,
            value: fieldValue
          };
          sectionResponse!.fieldResponses.push(fieldResponse);
        }
      });
    });
  }

  /**
   * Get the submission status message
   */
  getSubmissionStatusMessage(): string {
    if (!this.userCareerPackage) return '';

    switch (this.userCareerPackage.status) {
      case PackageStatus.NOT_STARTED:
        return 'Package not started';
      case PackageStatus.IN_PROGRESS:
        return 'Package in progress';
      case PackageStatus.UNDER_REVIEW:
        return 'Package submitted and under review';
      case PackageStatus.COMPLETED:
        return 'Package completed';
      default:
        return '';
    }
  }

  /**
   * Check if package is submitted (under review or completed)
   */
  isPackageSubmitted(): boolean {
    if (!this.userCareerPackage) return false;
    return this.userCareerPackage.status === PackageStatus.UNDER_REVIEW ||
      this.userCareerPackage.status === PackageStatus.COMPLETED;
  }
}

