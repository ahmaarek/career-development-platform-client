import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { RankConfig } from '../learning/library/models/rank-config.model';
import { UserService } from '../../user/user.service';
import { LearningScoreService } from '../learning/score/learning.score.service';
import { RankConfigService } from '../learning/library/services/rank-config.service';
import { User } from '../../user/user.model';
import { MapComponent } from './map/map.component';
import { LeaderboardComponent } from '../learning/score/leaderboard/leaderboard.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [MapComponent, LeaderboardComponent]
})
export class HomeComponent implements OnInit {
  ranks: RankConfig[] = [];
  currentUser: { id: string; fullName: string; score: number, imageId: string | null } | null = null;
  otherUsers: { id: string; fullName: string; score: number, imageId: string | null }[] = [];

  constructor(
    private userService: UserService,
    private scoreService: LearningScoreService,
    private rankConfigService: RankConfigService
  ) { }

  ngOnInit(): void {
    forkJoin({
      users: this.userService.getAllUsers(),
      leaderboard: this.scoreService.getLeaderboard(),
      allScores: this.scoreService.getAllScores(),
      current: this.userService.getCurrentUser(),
      ranks: this.rankConfigService.getAllRanks()
    }).subscribe(({ users, leaderboard, allScores, current, ranks }) => {
      this.ranks = ranks;

      const userMap = new Map(users.map(u => [u.id, u]));

      const fullScoreMap = new Map<string, number>();
      for (const score of allScores) {
        fullScoreMap.set(score.userId, score.points);
      }

      const currentUserData = userMap.get(current.id);
      this.currentUser = {
        id: current.id,
        fullName: currentUserData?.name || '',
        imageId: currentUserData?.imageId || null,
        score: fullScoreMap.get(current.id) ?? 0
      };

      this.otherUsers = leaderboard
        .filter(score => score.userId !== current.id)
        .map(score => {
          const user = userMap.get(score.userId);
          return {
            id: score.userId,
            fullName: user?.name || '',
            imageId: user?.imageId || null,
            score: score.points
          };
        });
    });
  }

}
