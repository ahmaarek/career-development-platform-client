import { UserFieldResponse } from './user-field-response.interface';

export interface UserSectionResponse {
  id?: string; // UUID as string
  userCareerPackageId?: string;
  sectionTemplateId: string;
  fieldResponses: UserFieldResponse[];
}

