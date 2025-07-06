import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LearningScore } from './learning.score.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LearningScoreService {


  private readonly learningScoresUrl = environment.learningServiceBaseUrl + '/scores';
  constructor(private http: HttpClient) {}

  getLeaderboard(): Observable<LearningScore[]> {
    return this.http.get<LearningScore[]>(`${this.learningScoresUrl}/leaderboard`);
  }

  getUserScore(userId: string): Observable<LearningScore> {
    return this.http.get<LearningScore>(`${this.learningScoresUrl}/user/${userId}`);
  }
}
