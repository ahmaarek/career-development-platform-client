import { Component, OnInit } from '@angular/core';
import { BlogWikiDTO } from '../models/blog-wiki.model';
import { BlogWikiService } from '../services/blog-wiki.service';
import { CommonModule } from '@angular/common';
import { EndsWithPipe } from '../pipes/ends-with.pipe';
import { UserService } from '../../../../user/user.service';
import { User } from '../../../../user/user.model';
import { RouterLink } from '@angular/router';
import { LearningMaterialTemplateService } from '../services/learning-material-template.service';
import { LearningMaterialTemplate } from '../models/learning-material-template.model';
import { LearningDocumentService } from '../services/learning-document.service';
import { LearningSectionTemplate } from '../models/learning-section-template.model';

@Component({
  selector: 'app-library-home',
  templateUrl: './library-home.component.html',
  styleUrls: ['./library-home.component.css'],
  imports: [CommonModule, RouterLink],
})
export class LibraryHomeComponent implements OnInit {
  blogs: BlogWikiDTO[] = [];
  wikis: BlogWikiDTO[] = [];
  learningMaterials: LearningMaterialTemplate[] = [];
  selectedLearningMaterial: LearningMaterialTemplate | null = null;
  selectedType: 'blogs' | 'wikis' | 'learning' | null = null;
  currentUser: User | null = null;  
  selectedEntry: BlogWikiDTO | null = null;
  attachmentType: 'image' | 'video' | 'document' | null = null;
  attachmentUrl: string | null = null;
  sectionsAttachmentData: { [sectionId: string]: { url: string, type: 'image' | 'video' | 'document' | null } } = {};



  constructor(private blogWikiService: BlogWikiService, private userService: UserService, private learningMaterialTemplateService: LearningMaterialTemplateService, private learningDocumentService: LearningDocumentService) { }

  ngOnInit(): void {
    this.loadBlogs();
    this.loadWikis();
    this.loadLearningMaterials();
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }


  loadLearningMaterials() {
    this.learningMaterialTemplateService.getAllTemplates().subscribe(data => {
      this.learningMaterials = data;
    });
  }

  loadBlogs(): void {
    this.blogWikiService.getBlogs().subscribe(data => this.blogs = data);
  }

  loadWikis(): void {
    this.blogWikiService.getWikis().subscribe(data => this.wikis = data);
  }

  getAttachmentUrl(id: string): string {
    return this.learningDocumentService.getAttachmentUrl(id);
  }

  openEntry(entry: BlogWikiDTO): void {
    this.selectedEntry = entry;
    if (entry.attachmentId) {
      this.learningDocumentService.detectAttachmentType(entry.attachmentId).subscribe(type => {
        this.attachmentType = type;
        this.loadAttachment(entry.attachmentId);
      });
    } else {
      this.attachmentType = null;
    }
  }

  closeModal(): void {
    this.selectedEntry = null;
    this.attachmentType = null;
  }


  loadAttachment(attachmentId: string): void {
    this.learningDocumentService.getProtectedAttachment(attachmentId).subscribe(blob => {
      this.attachmentUrl = URL.createObjectURL(blob);
    });
    console.log('Attachment type:', this.attachmentType);
    console.log('Blob URL:', this.attachmentUrl);
  }

  loadAttachmentsForSections(sections: LearningSectionTemplate[]): void {
sections.forEach((section, i) => {
  if (section.attachmentId) {
    this.learningDocumentService.getAttachmentBlobAndType(section.attachmentId).subscribe(data => {
      this.sectionsAttachmentData[i] = {
        url: data.blobUrl,
        type: data.type
      };
    });
  }
});
}
openLearningTemplate(template: LearningMaterialTemplate): void {
  this.selectedLearningMaterial = template;
  this.loadAttachmentsForSections(template.sections);
}

closeLearningModal(): void {
  this.selectedLearningMaterial = null;
}

getAttachmentType(attachmentId: string): 'image' | 'video' | 'document' {
  ///TODO fix this
  const url = this.getAttachmentUrl(attachmentId);
  if (url.endsWith('.jpg') || url.endsWith('.png')) return 'image';
  if (url.endsWith('.mp4') || url.endsWith('.webm')) return 'video';
  return 'document';
}


  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }
}
