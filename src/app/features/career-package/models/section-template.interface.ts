import { SectionType } from '../enums/section-type.enum';
import { SectionFieldTemplate } from './section-field-template.interface';

export interface SectionTemplate {
  id: string;
  title: string;
  type: SectionType;
  instructions: string;
  requirements: string;
  careerPackageTemplateId?: string;
  fields: SectionFieldTemplate[];
}

