import { UserFieldSubmission } from './user-field-submission.interface';

export interface UserSectionSubmission {
  id?: string;
  userCareerPackageId?: string;
  sectionTemplateId: string;
  fieldSubmissions: UserFieldSubmission[];
}

