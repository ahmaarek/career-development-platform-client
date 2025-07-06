import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LearningSubmissionDTO } from '../models/learning-submission.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LearningSubmissionService {


  private readonly learningSubmissionsUrl = environment.learningServiceBaseUrl + '/submissions';
  constructor(private http: HttpClient) { }

  submitLearningMaterial(submission: LearningSubmissionDTO): Observable<LearningSubmissionDTO> {
    return this.http.post<LearningSubmissionDTO>(this.learningSubmissionsUrl, submission);
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
