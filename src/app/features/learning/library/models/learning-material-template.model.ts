import { LearningSectionTemplate } from "./learning-section-template.model";

export interface LearningMaterialTemplate {
id?: string;
title: string;
points: number;
description: string;
careerPackageId?: string;
sections: LearningSectionTemplate[];
}