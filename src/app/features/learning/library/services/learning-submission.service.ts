import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { LearningSubmissionDTO } from '../models/learning-submission.model';
import { environment } from '../../../../../environments/environment';
import { LearningMaterialTemplate } from '../models/learning-material-template.model';
import { LearningMaterialTemplateService } from './learning-material-template.service';

@Injectable({
  providedIn: 'root'
})
export class LearningSubmissionService {


  private readonly learningSubmissionsUrl = environment.learningServiceBaseUrl + '/submissions';
  constructor(private http: HttpClient, private learningMaterialService: LearningMaterialTemplateService) { }

  submitLearningMaterial(submission: LearningSubmissionDTO): Observable<LearningSubmissionDTO> {
    return this.http.post<LearningSubmissionDTO>(this.learningSubmissionsUrl, submission);
  }

  getSubmittedAndUnsubmittedTemplates(
    userId: string,
    careerPackageId: string
  ): Observable<{
    submittedTemplates: LearningSubmissionDTO[];
    unsubmittedTemplates: LearningMaterialTemplate[];
  }> {
    return forkJoin({
      submissions: this.getSubmissionsByUser(userId),
      templates: this.learningMaterialService.getTemplatesByCareerPackageId(careerPackageId)
    }).pipe(
      map(({ submissions, templates }) => {
        const submissionMap = new Map(
          submissions.map(sub => [sub.templateId, sub])
        );

        const submittedTemplates: LearningSubmissionDTO[] = [];
        const unsubmittedTemplates: LearningMaterialTemplate[] = [];

        for (const template of templates) {
          const submission = submissionMap.get(template.id!);
          if (submission) {
            submittedTemplates.push(submission);
          } else {
            unsubmittedTemplates.push(template);
          }
        }

        return { submittedTemplates, unsubmittedTemplates };
      })
    );
  }


  getSubmissionByTemplateAndUser(templateId: string, userId: string) {
    return this.http.get<LearningSubmissionDTO>(`${this.learningSubmissionsUrl}/user/${userId}/template/${templateId}`);
  }


  getSubmissionsByUser(userId: string): Observable<LearningSubmissionDTO[]> {
    return this.http.get<LearningSubmissionDTO[]>(`${this.learningSubmissionsUrl}/user/${userId}`);
  }

  reviewSubmission(submissionId: string, accepted: boolean): Observable<LearningSubmissionDTO> {
    return this.http.put<LearningSubmissionDTO>(
      `${this.learningSubmissionsUrl}/${submissionId}/review?accepted=${accepted}`,
      {}
    );
  }


  getSubmissionsByManager(managerId: string): Observable<LearningSubmissionDTO[]> {
    return this.http.get<LearningSubmissionDTO[]>(`${this.learningSubmissionsUrl}/manager/${managerId}`);
  }

  getSubmissionsByTemplate(templateId: string): Observable<LearningSubmissionDTO[]> {
    return this.http.get<LearningSubmissionDTO[]>(`${this.learningSubmissionsUrl}/template/${templateId}`);
  }

  getSubmissionById(id: string): Observable<LearningSubmissionDTO> {
    return this.http.get<LearningSubmissionDTO>(`${this.learningSubmissionsUrl}/${id}`);
  }
}
