import { SectionTemplate } from './section-template.interface';

export interface CareerPackageTemplate {
  id: string;
  title: string;
  version: string;
  description: string;
  sections: SectionTemplate[];
}

