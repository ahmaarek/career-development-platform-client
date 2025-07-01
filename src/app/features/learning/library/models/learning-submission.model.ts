import { SectionType } from './section-type.model';

export interface LearningSubmissionDTO {
  id?: string;
  userId: string;
  templateId: string;
  sectionResponses: LearningSectionResponseDTO[];
}

export interface LearningSectionResponseDTO {
  sectionTemplateId: string;
  userInput: string;
  attachmentId?: string;
}


