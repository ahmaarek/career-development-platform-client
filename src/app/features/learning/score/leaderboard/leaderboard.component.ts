import { Component, OnInit } from '@angular/core';
import { LearningScoreService } from '../learning.score.service';
import { UserService } from '../../../../user/user.service';
import { User, UserWithScore } from '../../../../user/user.model';
import { forkJoin, switchMap, map } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css'],
  imports: [CommonModule]
})
export class LeaderboardComponent implements OnInit {
  leaderboard: UserWithScore[] = [];

  constructor(
    private learningScoreService: LearningScoreService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    this.learningScoreService.getLeaderboard().pipe(
      switchMap(scores => {
        const userRequests = scores.map(score =>
          this.userService.getUserById(score.userId).pipe(
            map(user => ({
              ...user,
              points: score.points
            }))
          )
        );
        return forkJoin(userRequests);
      })
    ).subscribe(usersWithScores => {
      this.leaderboard = usersWithScores;
    });
  }
}
