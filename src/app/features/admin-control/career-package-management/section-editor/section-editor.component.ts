import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SectionTemplate } from '../../../career-package/models/section-template.interface';
import { SectionFieldTemplate } from '../../../career-package/models/section-field-template.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-editor',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './section-editor.component.html',
  styleUrls: ['./section-editor.component.css']
})
export class SectionEditorComponent {
  @Input() section!: SectionTemplate;
  @Input() isEditing = false;
  
  @Output() deleteSection = new EventEmitter<void>();
  @Output() sectionUpdated = new EventEmitter<SectionTemplate>();
  @Output() fieldUpdated = new EventEmitter<SectionFieldTemplate>();
  @Output() fieldAdded = new EventEmitter<SectionFieldTemplate>();
  @Output() fieldDeleted = new EventEmitter<string>();

  pendingNewFields: SectionFieldTemplate[] = [];

  
  addField() {
    const newField: SectionFieldTemplate = {
      id: '',
      label: '',
      fieldKey: '',
      fieldType: 'TEXT',
      required: true,
      sectionTemplateId: this.section.id
    };
    this.pendingNewFields.push(newField);
  }

  confirmAddField(field: SectionFieldTemplate) {

    if (!field.label) {
      alert('Field label is required.');
      return;
    }
    field.fieldKey = field.label.toLowerCase().replace(/\s+/g, '_');
    this.section.fields.push(field);
    this.pendingNewFields = this.pendingNewFields.filter(f => f !== field);
    this.fieldAdded.emit(field);
  }

  deleteField(index: number) {
    const [deleted] = this.section.fields.splice(index, 1);
    if (deleted?.id) this.fieldDeleted.emit(deleted.id);
  }

  deletePendingField(index: number) {
    this.pendingNewFields.splice(index, 1);
  }

  onDeleteSection() {
    this.deleteSection.emit();
  }

  onSectionEdit() {
    if (this.section.id) this.sectionUpdated.emit(this.section);
  }

  onFieldEdit(field: SectionFieldTemplate) {
    if (field.id) this.fieldUpdated.emit(field);
  }
  
}
