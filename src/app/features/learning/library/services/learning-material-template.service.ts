import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, combineLatest, forkJoin, map, Observable, of } from 'rxjs';
import { LearningMaterialTemplate } from '../models/learning-material-template.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LearningMaterialTemplateService {

  private readonly learningTemplatesUrl = environment.learningServiceBaseUrl + '/templates';
  constructor(private http: HttpClient) { }


  createTemplate(template: LearningMaterialTemplate): Observable<LearningMaterialTemplate> {
    return this.http.post<LearningMaterialTemplate>(this.learningTemplatesUrl, template);
  }

  getAllTemplates(): Observable<LearningMaterialTemplate[]> {
    return this.http.get<LearningMaterialTemplate[]>(this.learningTemplatesUrl);
  }


  getTemplatesByCareerPackageId(id: string): Observable<LearningMaterialTemplate[]> {
    return this.http.get<LearningMaterialTemplate[]>(`${this.learningTemplatesUrl}/career-package/${id}`);
  }

  getTemplateById(id: string): Observable<LearningMaterialTemplate> {
    return this.http.get<LearningMaterialTemplate>(`${this.learningTemplatesUrl}/${id}`);
  }

  deleteTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.learningTemplatesUrl}/${id}`).pipe(
      map(() => {
        return;
      }),
      catchError(error => {
        
        return of(undefined);
      })
    );
  }

  updateTemplate(template: LearningMaterialTemplate): Observable<void> {
    return this.http.put<void>(`${this.learningTemplatesUrl}/${template.id}`, template);
  }

}
