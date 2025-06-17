import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LearningScore } from './learning.score.model'; // Adjust the import path as necessary

@Injectable({
  providedIn: 'root'
})
export class LearningScoreService {

  private scoresUrl = 'http://localhost:8082/api/scores';
  constructor(private http: HttpClient) {}

  getLeaderboard(): Observable<LearningScore[]> {
    return this.http.get<LearningScore[]>(`${this.scoresUrl}/leaderboard`);
  }

  getUserScore(userId: string): Observable<LearningScore> {
    return this.http.get<LearningScore>(`${this.scoresUrl}/user/${userId}`);
  }
}
