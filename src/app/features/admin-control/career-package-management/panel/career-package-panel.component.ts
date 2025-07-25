import { Component, Input, ViewChild } from '@angular/core';
import { CareerPackageTemplate } from '../../../career-package/models/career-package-template.interface';
import { CareerPackageService } from '../../../career-package/career-package.service';
import { SectionTemplate } from '../../../career-package/models/section-template.interface';
import { SectionFieldTemplate } from '../../../career-package/models/section-field-template.interface';
import { SectionType } from '../../../career-package/enums/section-type.enum';
import { SectionEditorComponent } from '../section-editor/section-editor.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertService } from '../../../alert/alert.service';

@Component({
  selector: 'app-career-package-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, SectionEditorComponent],
  templateUrl: './career-package-panel.component.html',
  styleUrls: ['./career-package-panel.component.css']
})
export class CareerPackagePanelComponent {
  @Input() package!: CareerPackageTemplate;
  expanded = false;
  isEditing = false;

  updatedSections: SectionTemplate[] = [];
  newSections: SectionTemplate[] = [];
  deletedSectionIds: string[] = [];

  updatedFields: SectionFieldTemplate[] = [];
  newFields: SectionFieldTemplate[] = [];
  deletedFieldIds: string[] = [];

  constructor(private careerPackageService: CareerPackageService, private snackBar: MatSnackBar, private alertService: AlertService) {
    this.resetTrackingData();
  }


  toggleExpand() {
    this.expanded = !this.expanded;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  addSection() {
    const newSection: SectionTemplate = {
      id: '',
      title: 'New Section',
      type: SectionType.LEARNING,
      instructions: '',
      requirements: '',
      fields: []
    };
    this.package.sections.unshift(newSection); //add to the beginning of the sections array
    this.newSections.unshift(newSection);
  }

  deleteSection(index: number) {
    const deleted = this.package.sections.splice(index, 1)[0];
    if (deleted?.id) this.deletedSectionIds.push(deleted.id);
  }

  deletePackage() {
    this.careerPackageService.deleteCareerPackage(this.package.id).subscribe({
      next: () => {
        this.alertService.showAlert('success', 'Package deleted successfully!');
        
      },
      error: (err) => {
        
        this.alertService.showAlert('error','Failed to delete package.');
      }
    });
  }


  trackSectionUpdate(section: SectionTemplate) {
    if (!this.newSections.includes(section) && !this.updatedSections.find(s => s.id === section.id)) {
      this.updatedSections.push(section);
    }
  }

  trackFieldUpdate(field: SectionFieldTemplate) {
    if (!this.newFields.includes(field) && !this.updatedFields.find(f => f.id === field.id)) {
      this.updatedFields.push(field);
    }
  }

  trackFieldAdd(field: SectionFieldTemplate) {
    this.newFields.push(field);
  }

  trackFieldDelete(fieldId: string) {
    this.deletedFieldIds.push(fieldId);
  }

  updatePackageInfo(event: { title: string; description: string }) {
    this.package.title = event.title;
    this.package.description = event.description;
    this.snackBar.open('Package details saved', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    });
  }

  savePackageInfo(newTitle: string, newDescription: string): void {
    this.package.title = newTitle;
    this.package.description = newDescription;
    this.snackBar.open('Package details saved', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    });
  }


  submitChanges() {
    const payload = {
      title: this.package.title,
      description: this.package.description,
      updatedSections: this.updatedSections,
      newSections: this.newSections,
      deletedSectionIds: this.deletedSectionIds,
      updatedFields: this.updatedFields,
      newFields: this.newFields,
      deletedFieldIds: this.deletedFieldIds
    };

    
    this.careerPackageService.updatePackage(this.package.id, payload).subscribe({
      next: () => {
        this.alertService.showAlert('success','Changes submitted successfully!');
        this.isEditing = false;

      },
      error: (err) => {
        
        this.alertService.showAlert('error','Failed to submit changes.');
      }
    });
    this.resetTrackingData();
  }

  resetTrackingData(): void {
    this.updatedSections = [];
    this.newSections = [];
    this.deletedSectionIds = [];

    this.updatedFields = [];
    this.newFields = [];
    this.deletedFieldIds = [];
  }
}