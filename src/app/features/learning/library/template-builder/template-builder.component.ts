import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { LearningMaterialTemplateService } from '../services/learning-material-template.service';
import { CommonModule } from '@angular/common';
import { SectionType } from '../models/section-type.model';
import { UserService } from '../../../../user/user.service';
import { User } from '../../../../user/user.model';
import { SectionFormModel } from '../models/section-form.model';
import { LearningDocumentService } from '../services/learning-document.service';
import { CareerPackageService } from '../../../career-package/career-package.service';
import { CareerPackageTemplate } from '../../../career-package/models/career-package-template.interface';
import { AlertService } from '../../../alert/alert.service';


@Component({
  selector: 'app-template-builder',
  templateUrl: './template-builder.component.html',
  styleUrls: ['./template-builder.component.css'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class TemplateBuilderComponent {
  form: FormGroup;
  currentUser: User | null = null;
  sectionTypeOptions = Object.values(SectionType);
  careerPackageTemplates: CareerPackageTemplate[] | null = null;

  constructor(private fb: FormBuilder,
    private learningMaterialTemplateService: LearningMaterialTemplateService,
    private userService: UserService,
    private learningDocumentService: LearningDocumentService,
    private careerPackageService: CareerPackageService,
    private alertService: AlertService) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      careerPackageTemplate: [null, Validators.required],
      points: [0, [Validators.required, Validators.min(0)]],
      sections: this.fb.array([], this.minLengthArray(1))
    });
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
    this.careerPackageService.getAllCareerPackageTemplates().subscribe(templates => {
      this.careerPackageTemplates = templates;
    });
  }

  get sections(): FormArray {
    return this.form.get('sections') as FormArray;
  }


  minLengthArray(min: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control as FormArray;
      return value && value.length >= min ? null : { minLengthArray: true };
    };
  }

  addSection(): void {
    const sectionGroup = this.fb.group({
      title: ['', Validators.required],
      type: [this.sectionTypeOptions[0], Validators.required],
      instructions: [''],
      content: [''],
      requiresSubmission: [false],
      attachment: [null]
    });

    this.sections.push(sectionGroup);
  }

  removeSection(index: number): void {
    this.sections.removeAt(index);
  }

  onFileChange(event: Event, index: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.sections.at(index).patchValue({ attachment: file });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value as {
      title: string;
      description: string;
      points: number;
      careerPackageTemplate: string;
      sections: SectionFormModel[];
    };

    this.learningDocumentService
      .uploadAttachmentsForSections(formValue.sections, this.currentUser?.id || '')
      .subscribe((attachmentIds: (string | null)[]) => {

        formValue.sections.forEach((section: SectionFormModel, i: number) => {
          section.attachmentId = attachmentIds[i] ?? undefined;
          delete section.attachment;
        });

        const finalPayload = {
          title: formValue.title,
          description: formValue.description,
          points: formValue.points,
          careerPackageId: formValue.careerPackageTemplate,
          sections: formValue.sections
        };

        this.learningMaterialTemplateService.createTemplate(finalPayload).subscribe({
          next: () => {
            this.alertService.showAlert('success','Material created!');
            this.form.reset();
            this.sections.clear();
          },
          error: (err) => {
            this.alertService.showAlert('success','Submission failed.');
          }
        });
      });
  }


}
