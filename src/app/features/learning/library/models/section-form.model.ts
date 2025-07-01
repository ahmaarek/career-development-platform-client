import { LearningSectionTemplate } from "./learning-section-template.model";

export interface SectionFormModel extends LearningSectionTemplate {
  attachment?: File;
}
