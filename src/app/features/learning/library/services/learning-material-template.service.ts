import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, forkJoin, map, Observable, of } from 'rxjs';
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

  getTemplateById(id: string): Observable<LearningMaterialTemplate> {
    return this.http.get<LearningMaterialTemplate>(`${this.learningTemplatesUrl}/${id}`);
  }



}
