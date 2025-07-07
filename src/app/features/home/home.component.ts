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
  currentUser: { id: string; fullName: string; score: number, imageId: string | null} | null = null;
  otherUsers: { id: string; fullName: string; score: number , imageId: string | null}[] = [];

  constructor(
    private userService: UserService,
    private scoreService: LearningScoreService,
    private rankConfigService: RankConfigService
  ) {}

  ngOnInit(): void {
    forkJoin({
      users: this.userService.getAllUsers(),
      scores: this.scoreService.getLeaderboard(),
      ranks: this.rankConfigService.getAllRanks(),
      current: this.userService.getCurrentUser()
    }).subscribe(({ users, scores, ranks, current }) => {
      this.ranks = ranks;

      const scoreMap = new Map<string, number>();
      for (const score of scores) {
        scoreMap.set(score.userId, score.points);
      }

      const mergedUsers = users.map((user: User) => ({
        id: user.id,
        fullName: user.name,
        score: scoreMap.get(user.id) ?? 0,
        imageId: user.imageId || null, 
      }));

      const currentUserId = current.id;
      this.currentUser = mergedUsers.find(u => u.id === currentUserId) || null;
      this.otherUsers = mergedUsers.filter(u => u.id !== currentUserId);
    });
  }
}
