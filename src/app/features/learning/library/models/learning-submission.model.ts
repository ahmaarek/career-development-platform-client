import { SectionType } from './section-type.model';
import { SubmissionStatus } from './submission-status.model';

export interface LearningSubmissionDTO {
  id?: string;
  userId: string;
  templateId: string;
  sectionResponses: LearningSectionResponseDTO[];
  status?: SubmissionStatus;
  managerId?: string;
}

export interface LearningSectionResponseDTO {
  sectionTemplateId: string;
  userInput: string;
  documentId?: string;
}


