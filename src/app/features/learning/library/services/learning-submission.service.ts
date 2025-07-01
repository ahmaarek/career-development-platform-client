import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LearningSubmissionDTO } from '../models/learning-submission.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LearningSubmissionService {

  constructor(private http: HttpClient) {}

  submitLearningMaterial(submission: LearningSubmissionDTO): Observable<LearningSubmissionDTO> {
    console.log('Submitting learning material:', submission);
    return this.http.post<LearningSubmissionDTO>(environment.learningSubmissionsUrl, submission);
  }


  getSubmissionsByUser(userId: string): Observable<LearningSubmissionDTO[]> {
    return this.http.get<LearningSubmissionDTO[]>(`${environment.learningSubmissionsUrl}/user/${userId}`);
  }


  getSubmissionsByTemplate(templateId: string): Observable<LearningSubmissionDTO[]> {
    return this.http.get<LearningSubmissionDTO[]>(`${environment.learningSubmissionsUrl}/template/${templateId}`);
  }

  getSubmissionById(id: string): Observable<LearningSubmissionDTO> {
    return this.http.get<LearningSubmissionDTO>(`${environment.learningSubmissionsUrl}/${id}`);
  }
}
