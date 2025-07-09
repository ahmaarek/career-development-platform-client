import { Component, OnInit } from '@angular/core';
import { LearningScoreService } from '../learning.score.service';
import { UserService } from '../../../../user/user.service';
import { User, FullUser } from '../../../../user/user.model';
import { forkJoin, switchMap, map, concatMap, from, toArray, of } from 'rxjs';
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
      switchMap(scores => from(scores)),
      concatMap(score =>
        this.userService.getUserById(score.userId).pipe(
          concatMap(user => {
            if (user.imageId) {
              return this.userService.getProtectedImage(user.imageId).pipe(
                map(blob => ({
                  ...user,
                  points: score.points,
                  imageUrl: URL.createObjectURL(blob)
                }) as FullUser)
              );
            } else {
              return of({
                ...user,
                points: score.points,
                imageUrl: '/user-default-logo.webp'
              } as FullUser);
            }
          })
        )
      ),
      toArray()
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
