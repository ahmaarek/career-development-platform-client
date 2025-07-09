import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder, FormGroup, FormArray, Validators,
  AbstractControl, ValidationErrors, ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { combineLatest, of } from 'rxjs';

import { BlogWikiService } from '../services/blog-wiki.service';
import { LearningMaterialTemplateService } from '../services/learning-material-template.service';
import { LearningDocumentService } from '../services/learning-document.service';
import { CareerPackageService } from '../../../career-package/career-package.service';

import { UserService } from '../../../../user/user.service';
import { User } from '../../../../user/user.model';
import { SectionType } from '../models/section-type.model';
import { CareerPackageTemplate } from '../../../career-package/models/career-package-template.interface';

@Component({
  selector: 'app-edit-entry',
  templateUrl: './edit-entry.component.html',
  styleUrls: ['./edit-entry.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class EditEntryComponent implements OnInit {
  form: FormGroup;
  currentUser: User | null = null;
  careerPackageTemplates: CareerPackageTemplate[] | null = null;
  sectionTypeOptions = Object.values(SectionType);
  templateId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private templateService: LearningMaterialTemplateService,
    private userService: UserService,
    private documentService: LearningDocumentService,
    private careerPackageService: CareerPackageService
  ) {
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    this.templateId = this.route.snapshot.paramMap.get('id')!;
    this.loadInitialData();
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      description: [''],
      careerPackageTemplate: [null, Validators.required],
      points: [0, [Validators.required, Validators.min(0)]],
      sections: this.fb.array([], this.minLengthArray(1))
    });
  }

  private loadInitialData(): void {
    this.userService.getCurrentUser().subscribe(user => this.currentUser = user);
    this.careerPackageService.getAllCareerPackageTemplates()
      .subscribe(data => this.careerPackageTemplates = data);

    this.templateService.getTemplateById(this.templateId).subscribe(template => {
      this.form.patchValue({
        title: template.title,
        description: template.description,
        points: template.points,
        careerPackageTemplate: template.careerPackageId
      });

      template.sections.forEach(section => this.sections.push(this.buildSectionGroup(section)));
    });
  }

  private buildSectionGroup(section: any): FormGroup {
    const group = this.fb.group({
      title: [section.title, Validators.required],
      type: [section.type, Validators.required],
      instructions: [section.instructions],
      content: [section.content],
      requiresSubmission: [section.requiresSubmission],
      attachmentId: [section.attachmentId],
      attachment: [null],
      previewUrl: [''],
      previewType: ['']
    });

    if (section.attachmentId) {
      this.documentService.getAttachmentBlobAndType(section.attachmentId).subscribe(({ blobUrl, type }) => {
        group.patchValue({ previewUrl: blobUrl, previewType: type });
      });
    }

    return group;
  }

  get sections(): FormArray {
    return this.form.get('sections') as FormArray;
  }

  private minLengthArray(min: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      return (control instanceof FormArray && control.length >= min) ? null : { minLengthArray: true };
    };
  }

  onFileChange(event: Event, index: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.sections.at(index).patchValue({ attachment: file });
    }
  }

  removeSection(index: number): void {
    if (this.sections.length > 1) {
      this.sections.removeAt(index);
    } else {
      alert('At least one section is required.');
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.currentUser) return;

    const formValue = this.form.value;
    const sectionControls = this.sections.controls;

    const uploads$ = sectionControls.map(section => {
      const file = section.value.attachment;
      return file
        ? this.documentService.uploadAttachment(file, this.currentUser!.id, 'template')
        : of(section.value.attachmentId);
    });

    combineLatest(uploads$).subscribe(attachmentIds => {
      const updatedSections = sectionControls.map((section, i) => ({
        title: section.value.title,
        type: section.value.type,
        instructions: section.value.instructions,
        content: section.value.content,
        requiresSubmission: section.value.requiresSubmission,
        attachmentId: attachmentIds[i]
      }));

      const payload = {
        id: this.templateId,
        title: formValue.title,
        description: formValue.description,
        points: formValue.points,
        careerPackageId: formValue.careerPackageTemplate,
        sections: updatedSections
      };

      this.templateService.updateTemplate(payload).subscribe({
        next: () => {
          alert('Template updated successfully');
          this.router.navigate([`library/edit/`]);
        },
        error: () => alert('Update failed')
      });
    });
  }
}
