import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { LearningMaterialTemplateService } from '../services/learning-material-template.service';
import { CommonModule } from '@angular/common';
import { SectionType } from '../models/section-type.model';
import { UserService } from '../../../../user/user.service';
import { User } from '../../../../user/user.model';
import { SectionFormModel } from '../models/section-form.model';
import { LearningDocumentService } from '../services/learning-document.service';


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


  constructor(private fb: FormBuilder,
    private learningMaterialTemplateService: LearningMaterialTemplateService,
    private userService: UserService,
    private learningDocumentService: LearningDocumentService) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      sections: this.fb.array([])
    });
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  get sections(): FormArray {
    return this.form.get('sections') as FormArray;
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
          sections: formValue.sections
        };

        this.learningMaterialTemplateService.createTemplate(finalPayload).subscribe({
          next: () => {
            alert('Material created!');
            this.form.reset();
            this.sections.clear();
          },
          error: (err) => {
            console.error('Error submitting material:', err);
            alert('Submission failed.');
          }
        });
      });
  }


}
