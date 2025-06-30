import { UserFieldResponse } from './user-field-response.interface';

export interface UserSectionResponse {
  id?: string;
  userCareerPackageId?: string;
  sectionTemplateId: string;
  fieldResponses: UserFieldResponse[];
}

