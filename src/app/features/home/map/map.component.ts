import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankConfig } from '../../learning/library/models/rank-config.model';
import { UserService } from '../../../user/user.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnChanges {
  @Input() ranks: RankConfig[] = [];
  @Input() currentUser: { id: string; score: number; fullName: string, imageId: string | null } | null = null;
  @Input() otherUsers: { id: string; score: number; fullName: string, imageId: string | null }[] = [];

  @ViewChild('pathRef', { static: false }) pathRef!: ElementRef<SVGPathElement>;

  totalLength = 0;
  initialized = false;

  userImageMap: Map<string, string> = new Map();
  animatedUserPositions: { id: string; x: number; y: number }[] = [];
  animatedCurrentUser: { x: number; y: number } | null = null;

  constructor(private userService: UserService) {

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updatePathLength();
      this.startAnimations();
      this.initialized = true;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.initialized &&
      (changes['ranks'] || changes['currentUser'] || changes['otherUsers'])
    ) {
      this.updatePathLength();
      this.startAnimations();
    }
  }

  private startAnimations(): void {
    if (!this.pathRef || this.ranks.length === 0) return;

    this.animatedUserPositions = this.otherUsers.map(u => ({ id: u.id, x: 0, y: 0 }));
    this.userImageMap.clear();

    const allUsers = [...this.otherUsers];
    if (this.currentUser) allUsers.push(this.currentUser);

    allUsers.forEach(user => {
      const isCurrent = user.id === this.currentUser?.id;
      this.animateUser(user.id, user.score, isCurrent);

      if (user.imageId) {
        this.userService.getUserImage(user.imageId).subscribe(
          url => this.userImageMap.set(user.id, url),
          () => this.userImageMap.set(user.id, '/user-default-logo.webp')
        );
      } else {
        this.userImageMap.set(user.id, '/user-default-logo.webp');
      }
    });
  }


  animateUser(userId: string, score: number, isCurrentUser = false): void {
    if (!this.pathRef || this.ranks.length === 0) return;

    const path = this.pathRef.nativeElement;
    const maxPoints = this.ranks[this.ranks.length - 1].pointsRequired || 1;
    const totalLength = path.getTotalLength();
    const targetLength = Math.min(score / maxPoints, 1) * totalLength;

    let currentLength = 0;
    const step = targetLength / 60;

    const animate = () => {
      if (currentLength < targetLength) {
        currentLength += step;
        const pt = path.getPointAtLength(currentLength);
        if (isCurrentUser) {
          this.animatedCurrentUser = { x: pt.x, y: pt.y };
        } else {
          const idx = this.animatedUserPositions.findIndex(u => u.id === userId);
          if (idx !== -1) {
            this.animatedUserPositions[idx] = { id: userId, x: pt.x, y: pt.y };
          }
        }
        requestAnimationFrame(animate);
      } else {
        const pt = path.getPointAtLength(targetLength);
        if (isCurrentUser) {
          this.animatedCurrentUser = { x: pt.x, y: pt.y };
        } else {
          const idx = this.animatedUserPositions.findIndex(u => u.id === userId);
          if (idx !== -1) {
            this.animatedUserPositions[idx] = { id: userId, x: pt.x, y: pt.y };
          }
        }
      }
    };

    animate();
  }

  getAnimatedPosition(userId: string): { x: number; y: number } | null {
    return this.animatedUserPositions.find(p => p.id === userId) ?? null;
  }

  private updatePathLength(): void {
    if (this.pathRef && this.pathRef.nativeElement) {
      this.totalLength = this.pathRef.nativeElement.getTotalLength();
    }
  }

  getPointFromScore(score: number): { x: number; y: number } {
    if (!this.pathRef || this.ranks.length === 0) return { x: 0, y: 0 };

    const path = this.pathRef.nativeElement;
    const maxPoints = this.ranks[this.ranks.length - 1].pointsRequired || 1;
    const fraction = Math.min(score / maxPoints, 1);
    const length = this.totalLength * fraction;
    return path.getPointAtLength(length);
  }

  getPointAtRank(index: number): { x: number; y: number } {
    if (!this.pathRef || this.ranks.length === 0) return { x: 0, y: 0 };

    const path = this.pathRef.nativeElement;
    const maxPoints = this.ranks[this.ranks.length - 1].pointsRequired || 1;
    const rankPoints = this.ranks[index].pointsRequired;
    const fraction = rankPoints / maxPoints;
    const length = this.totalLength * fraction;
    return path.getPointAtLength(length);
  }
}
