import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, forkJoin, map, Observable, of } from 'rxjs';
import { LearningMaterialTemplate } from '../models/learning-material-template.model';

@Injectable({
  providedIn: 'root'
})
export class LearningMaterialTemplateService {
  private baseUrl = 'http://localhost:8082/api/learning/templates';

  constructor(private http: HttpClient) { }


  createTemplate(template: LearningMaterialTemplate): Observable<LearningMaterialTemplate> {
    return this.http.post<LearningMaterialTemplate>(this.baseUrl, template);
  }

  getAllTemplates(): Observable<LearningMaterialTemplate[]> {
    return this.http.get<LearningMaterialTemplate[]>(this.baseUrl);
  }

  getTemplateById(id: string): Observable<LearningMaterialTemplate> {
    return this.http.get<LearningMaterialTemplate>(`${this.baseUrl}/${id}`);
  }



}
