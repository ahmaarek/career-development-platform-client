import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LearningScore } from './learning.score.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LearningScoreService {

  constructor(private http: HttpClient) {}

  getLeaderboard(): Observable<LearningScore[]> {
    return this.http.get<LearningScore[]>(`${environment.learningScoresUrl}/leaderboard`);
  }

  getUserScore(userId: string): Observable<LearningScore> {
    return this.http.get<LearningScore>(`${environment.learningScoresUrl}/user/${userId}`);
  }
}
