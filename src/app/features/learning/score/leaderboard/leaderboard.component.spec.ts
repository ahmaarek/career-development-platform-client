import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LeaderboardComponent } from './leaderboard.component';
import { LearningScoreService } from '../learning.score.service';
import { UserService } from '../../../../user/user.service';
import { of } from 'rxjs';
import { User } from '../../../../user/user.model';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('LeaderboardComponent', () => {
  let component: LeaderboardComponent;
  let fixture: ComponentFixture<LeaderboardComponent>;

  let mockScoreService: jasmine.SpyObj<LearningScoreService>;
  let mockUserService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    mockScoreService = jasmine.createSpyObj('LearningScoreService', ['getLeaderboard']);
    mockUserService = jasmine.createSpyObj('UserService', ['getUserById', 'getProtectedImage']);

    await TestBed.configureTestingModule({
      imports: [LeaderboardComponent],
      providers: [
        { provide: LearningScoreService, useValue: mockScoreService },
        { provide: UserService, useValue: mockUserService },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  it('should create', fakeAsync(() => {
    mockScoreService.getLeaderboard.and.returnValue(of([]));
    fixture = TestBed.createComponent(LeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
  }));

  it('should load leaderboard with users and images', fakeAsync(() => {
    const mockScores = [{ userId: 'user-1', points: 50 }];
    const mockUser: User = {
      id: 'user-1',
      name: 'Alice',
      imageId: 'img-123',
      email: 'alice@email.com',
      photoUrl: '',
      role: 'EMPLOYEE',
      managerId: 'manager-1'
    };
    const mockBlob = new Blob(['test'], { type: 'image/png' });
    const expectedUrl = 'blob:mock-url';
    spyOn(URL, 'createObjectURL').and.returnValue(expectedUrl);

    mockScoreService.getLeaderboard.and.returnValue(of(mockScores));
    mockUserService.getUserById.and.returnValue(of(mockUser));
    mockUserService.getProtectedImage.and.returnValue(of(mockBlob));

    fixture = TestBed.createComponent(LeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    expect(component.leaderboard.length).toBe(1);
    expect(component.leaderboard[0].name).toBe('Alice');
    expect(component.leaderboard[0].points).toBe(50);
    expect(component.leaderboard[0].imageUrl).toBe(expectedUrl);
  }));

  it('should use default image if user has no imageId', fakeAsync(() => {
    const mockScores = [{ userId: 'user-2', points: 20 }];
    const mockUser: User = {
      id: 'user-2',
      name: 'Bob',
      imageId: null,
      email: 'bob@email.com',
      photoUrl: '',
      role: 'EMPLOYEE',
      managerId: 'manager-2'
    };

    mockScoreService.getLeaderboard.and.returnValue(of(mockScores));
    mockUserService.getUserById.and.returnValue(of(mockUser));

    fixture = TestBed.createComponent(LeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    expect(component.leaderboard.length).toBe(1);
    expect(component.leaderboard[0].imageUrl).toBe('/user-default-logo.webp');
  }));
});
