import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../user/user.service';
import { User } from '../../../user/user.model';
import { LearningScoreService } from '../../learning/score/learning.score.service';
import { forkJoin, map, mergeMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RankConfigService } from '../../learning/library/services/rank-config.service';
import { RankConfig } from '../../learning/library/models/rank-config.model';

@Component({
  selector: 'app-map',
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit {
  
  rankThresholds: RankConfig[] = [];
  rankSpacing = 150;

  usersWithScore: { user: User; score: number; x: number }[] = [];

  constructor(
    private userService: UserService,
    private scoreService: LearningScoreService,
    private rankConfigService: RankConfigService
  ) {}

  ngOnInit(): void {
  this.userService.getAllUsers().pipe(
    mergeMap(users => {
      const filteredUsers = users.filter(user => user.role !== 'ADMIN');
      const requests = filteredUsers.map(user =>
        this.scoreService.getUserScore(user.id).pipe(
          map(score => ({
            user,
            score: score.points,
            x: this.getUserXPosition(score.points)
          }))
        )
      );

      return forkJoin(requests);
    })
  ).subscribe(result => {
    this.usersWithScore = result;
  });

  this.rankConfigService.getAllRanks().subscribe(thresholds => {
    this.rankThresholds = thresholds;
  });
}


  getUserXPosition(score: number): number {
    for (let i = 0; i < this.rankThresholds.length - 1; i++) {
      const start = this.rankThresholds[i].pointsRequired;
      const end = this.rankThresholds[i + 1].pointsRequired;
      if (score >= start && score < end) {
        const progress = (score - start) / (end - start);
        const xStart = i * this.rankSpacing + 50;
        const xEnd = (i + 1) * this.rankSpacing + 50;
        return xStart + progress * (xEnd - xStart);
      }
    }
    return (this.rankThresholds.length - 1) * this.rankSpacing + 50;
  }
}
