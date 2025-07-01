import { SectionType } from './section-type.model';

export interface LearningSectionTemplate {
id?: string;
title: string;
type: SectionType;
instructions: string;
content: string;
requiresSubmission: boolean;
attachmentId?: string;
}