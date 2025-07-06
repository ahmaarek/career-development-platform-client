import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BlogWikiDTO } from '../models/blog-wiki.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-entry-modal',
  templateUrl: './entry-modal.component.html',
  styleUrls: ['./entry-modal.component.css'],
  imports: [CommonModule]
})
export class EntryModalComponent {
  @Input() entry!: BlogWikiDTO;
  @Input() attachmentType: 'image' | 'video' | 'document' | null = null;
  @Input() attachmentUrl: string | null = null;

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
