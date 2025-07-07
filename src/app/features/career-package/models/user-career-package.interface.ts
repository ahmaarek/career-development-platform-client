import { PackageStatus } from '../enums/package-status.enum';
import { CareerPackageTemplate } from './career-package-template.interface';
import { UserSectionSubmission } from './user-section-submission.interface';

export interface UserCareerPackage {
  id: string;
  userId: string;
  reviewerId: string;
  status: PackageStatus;
  template: CareerPackageTemplate;
  reviewerComment: string;
  sectionSubmissions: UserSectionSubmission[];
}

