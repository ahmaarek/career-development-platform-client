import { Component, OnInit } from '@angular/core';
import { BlogWikiDTO } from '../models/blog-wiki.model';
import { BlogWikiService } from '../services/blog-wiki.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../user/user.service';
import { User } from '../../../../user/user.model';
import { RouterLink } from '@angular/router';
import { LearningMaterialTemplateService } from '../services/learning-material-template.service';
import { LearningMaterialTemplate } from '../models/learning-material-template.model';
import { LearningDocumentService } from '../services/learning-document.service';
import { LearningSectionTemplate } from '../models/learning-section-template.model';
import { FormsModule } from '@angular/forms';
import { LearningSubmissionService } from '../services/learning-submission.service';
import { catchError, combineLatest, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { LearningSectionResponseDTO, LearningSubmissionDTO } from '../models/learning-submission.model';
import { SubmissionStatus } from '../models/submission-status.model';
import { LearningTemplateModalComponent } from '../learning-template-modal/learning-template-modal.component';
import { EntryModalComponent } from '../entry-modal/entry-modal.component';
import { SubmittedLearningModalComponent } from '../submitted-learning-modal/submitted-learning-modal.component';
import { CareerPackageService } from '../../../career-package/career-package.service';

@Component({
  selector: 'app-library-home',
  templateUrl: './library-home.component.html',
  styleUrls: ['./library-home.component.css'],
  imports: [CommonModule, FormsModule, LearningTemplateModalComponent, EntryModalComponent, SubmittedLearningModalComponent],
})
export class LibraryHomeComponent implements OnInit {
  blogs: BlogWikiDTO[] = [];
  wikis: BlogWikiDTO[] = [];
  selectedLearningMaterial: LearningMaterialTemplate | null = null;
  selectedType: 'blogs' | 'wikis' | 'learning' | null = null;
  currentUser: User | null = null;
  selectedEntry: BlogWikiDTO | null = null;
  attachmentType: 'image' | 'video' | 'document' | null = null;
  attachmentUrl: string | null = null;
  sectionsAttachmentData: { [sectionId: string]: { url: string, type: 'image' | 'video' | 'document' | null } } = {};
  submissionText: { [sectionId: string]: string } = {};
  submissionFiles: { [sectionId: string]: File | null } = {};
  selectedSubmittedSubmission: LearningSubmissionDTO | null = null;
  submittedSectionMap: { [sectionId: string]: LearningSectionResponseDTO } = {};
  submittedAttachmentData: { [sectionId: string]: { url: string; type: 'image' | 'video' | 'document' | null } } = {};
  viewingUnsubmitted = true;
  submittedMaterials: LearningMaterialTemplate[] = [];
  unsubmittedMaterials: LearningMaterialTemplate[] = [];
  careerPackageId: string | null = null;

  constructor(private blogWikiService: BlogWikiService,
    private userService: UserService,
    private learningMaterialTemplateService: LearningMaterialTemplateService,
    private learningDocumentService: LearningDocumentService,
    private learningSubmissionService: LearningSubmissionService,
    private careerPackageService: CareerPackageService) { }

ngOnInit(): void {
  this.loadBlogs();
  this.loadWikis();

  this.userService.getCurrentUser().pipe(
    tap(user => this.currentUser = user),
    switchMap(user =>
      this.careerPackageService.getUserCareerPackage(user.id).pipe(
        tap(cp => this.careerPackageId = cp.id),
        switchMap(() => this.loadLearningMaterials()),
        catchError(err => {
          console.warn('No career package found or failed to load:', err);
          this.submittedMaterials = [];
          this.unsubmittedMaterials = [];
          return of();
        })
      )
    )
  ).subscribe();
}




  openSubmittedModal(template: LearningMaterialTemplate): void {
    if (!this.currentUser) return;

    this.learningSubmissionService.getSubmissionByTemplateAndUser(template.id!, this.currentUser.id)
      .subscribe(submission => {
        this.selectedLearningMaterial = template;
        this.selectedSubmittedSubmission = submission;

        this.submittedSectionMap = {};
        submission.sectionResponses.forEach(response => {
          this.submittedSectionMap[response.sectionTemplateId] = response;
        });

        // load attachments for each response
        template.sections.forEach(section => {
          const attachmentId = this.submittedSectionMap[section.id!]?.documentId;
          if (attachmentId) {
            this.learningDocumentService.getAttachmentBlobAndType(attachmentId).subscribe(data => {
              this.submittedAttachmentData[section.id!] = {
                url: data.blobUrl,
                type: data.type
              };
            });
          }
        });
      });
  }


  convertNewlinesToBreaks(content: string): string {
    return content.replace(/\n/g, '<br/>');
  }

  loadLearningMaterials(): Observable<void> {
    if (!this.currentUser || !this.careerPackageId) {
      return of();
    }

    return this.learningSubmissionService.getSubmittedAndUnsubmittedTemplates(
      this.currentUser.id,
      this.careerPackageId
    ).pipe(
      tap(({ submittedTemplates, unsubmittedTemplates, allTemplates }) => {
        const submittedIds = new Set(submittedTemplates.map(sub => sub.templateId));
        this.submittedMaterials = allTemplates.filter(t => submittedIds.has(t.id!));
        this.unsubmittedMaterials = unsubmittedTemplates;
      }),
      map(() => void 0)
    );
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
        this.loadAttachment(entry.attachmentId!);
      });
    } else {
      this.attachmentType = null;
    }
  }

  closeModal(): void {
    this.selectedEntry = null;
    this.attachmentType = null;
  }

  onFileSelected(event: Event, sectionId: string) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.submissionFiles[sectionId] = file;
    }
  }

  submitLearningMaterial(): void {
    if (!this.selectedLearningMaterial || !this.currentUser) return;

    const sections = this.selectedLearningMaterial.sections;

    const uploadObservables = sections.map(section => {
      const file = this.submissionFiles[section.id!] || null;
      if (file) {
        return this.learningDocumentService.uploadAttachment(file, this.currentUser!.id, 'submission');
      } else {
        return of(null);
      }
    });

    combineLatest(uploadObservables).subscribe(attachmentIds => {
      const sectionResponses: LearningSectionResponseDTO[] = sections.map((section, i) => ({
        sectionTemplateId: section.id!,
        userInput: this.submissionText[section.id!] || '',
        attachmentId: attachmentIds[i] || undefined
      }));

      const payload: LearningSubmissionDTO = {
        userId: this.currentUser!.id,
        templateId: this.selectedLearningMaterial!.id!,
        sectionResponses,
      };

      this.learningSubmissionService.submitLearningMaterial(payload).subscribe({
        next: () => {
          alert('Submission successful!');
          this.closeLearningModal();
        },
        error: (err) => {
          alert('Failed to submit.');
        }
      });
    });
  }

  setSubmissionView(unsubmitted: boolean) {
    this.viewingUnsubmitted = unsubmitted;
  }


  loadAttachment(attachmentId: string): void {
    this.learningDocumentService.getProtectedAttachment(attachmentId).subscribe(blob => {
      this.attachmentUrl = URL.createObjectURL(blob);
    });
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


  closeSubmittedModal(): void {
    this.selectedLearningMaterial = null;
    this.selectedSubmittedSubmission = null;
    this.submittedSectionMap = {};
    this.submittedAttachmentData = {};
  }

  closeLearningModal(): void {
    this.selectedLearningMaterial = null;
  }



  getUserRole(): string | null {
    return this.currentUser?.role ?? null;
  }
}
