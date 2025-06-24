import { SectionTemplate } from './section-template.interface';

export interface CareerPackageTemplate {
  id: string;
  title: string;
  description: string;
  sections: SectionTemplate[];
}

