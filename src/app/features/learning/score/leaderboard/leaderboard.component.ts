import { Component, OnInit } from '@angular/core';
import { LearningScoreService } from '../learning.score.service';
import { UserService } from '../../../../user/user.service';
import { User, FullUser } from '../../../../user/user.model';
import { forkJoin, switchMap, map } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css'],
  imports: [CommonModule]
})
export class LeaderboardComponent implements OnInit {
  leaderboard: FullUser[] = [];

  constructor(
    private learningScoreService: LearningScoreService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadLeaderboard();
  }

loadLeaderboard(): void {
  this.learningScoreService.getLeaderboard().pipe(
    switchMap(scores => {
      const userRequests = scores.map(score =>
        this.userService.getUserById(score.userId).pipe(
          switchMap(user => {
            if (user.imageId) {
              return this.userService.getProtectedImage(user.imageId).pipe(
                map(blob => {
                  
                  const imageUrl = URL.createObjectURL(blob);
                  return {
                    ...user,
                    points: score.points,
                    imageUrl
                  } as FullUser;
                }),
              );
            } else {
              return new Promise<FullUser>(resolve => {
                resolve({
                  ...user,
                  points: score.points,
                  imageUrl: '/user-default-logo.webp'
                });
              });
            }
          })
        )
      );
      return forkJoin(userRequests);
    })
  ).subscribe({
    next: (usersWithImages) => {
      this.leaderboard = usersWithImages;
    },
    error: (err) => {
      console.error('Failed to load leaderboard:', err);
    }
  });
}
}
