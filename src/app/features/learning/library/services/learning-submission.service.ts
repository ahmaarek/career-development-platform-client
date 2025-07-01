import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LearningSubmissionDTO } from '../models/learning-submission.model';

@Injectable({
  providedIn: 'root'
})
export class LearningSubmissionService {
  private readonly apiUrl = 'http://localhost:8082/api/learning/submissions';

  constructor(private http: HttpClient) {}

  submitLearningMaterial(submission: LearningSubmissionDTO): Observable<LearningSubmissionDTO> {
    console.log('Submitting learning material:', submission);
    return this.http.post<LearningSubmissionDTO>(this.apiUrl, submission);
  }


  getSubmissionsByUser(userId: string): Observable<LearningSubmissionDTO[]> {
    return this.http.get<LearningSubmissionDTO[]>(`${this.apiUrl}/user/${userId}`);
  }


  getSubmissionsByTemplate(templateId: string): Observable<LearningSubmissionDTO[]> {
    return this.http.get<LearningSubmissionDTO[]>(`${this.apiUrl}/template/${templateId}`);
  }

  getSubmissionById(id: string): Observable<LearningSubmissionDTO> {
    return this.http.get<LearningSubmissionDTO>(`${this.apiUrl}/${id}`);
  }
}
