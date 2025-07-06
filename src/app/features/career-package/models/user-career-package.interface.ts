import { PackageStatus } from '../enums/package-status.enum';
import { CareerPackageTemplate } from './career-package-template.interface';
import { UserSectionResponse } from './user-section-response.interface';

export interface UserCareerPackage {
  id: string;
  userId: string;
  reviewerId: string;
  status: PackageStatus;
  template: CareerPackageTemplate;
  reviewerComment: string;
  sectionSubmissions: UserSectionResponse[];
}

