import { LearningSectionTemplate } from "./learning-section-template.model";

export interface LearningMaterialTemplate {
id?: string;
title: string;
description: string;
sections: LearningSectionTemplate[];
}