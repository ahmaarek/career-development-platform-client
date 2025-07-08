import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CareerPackageComponent } from './career-package.component';
import { CareerPackageService } from './career-package.service';
import { UserService } from '../../user/user.service';
import { LearningSubmissionService } from '../learning/library/services/learning-submission.service';
import { of } from 'rxjs';
import { PackageStatus } from './enums/package-status.enum';
import { SubmissionStatus } from '../learning/library/models/submission-status.model';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('CareerPackageComponent', () => {
  let component: CareerPackageComponent;
  let fixture: ComponentFixture<CareerPackageComponent>;
  let mockCareerPackageService: any;
  let mockUserService: any;
  let mockLearningSubmissionService: any;

  beforeEach(async () => {
    mockCareerPackageService = {
      checkUserEnrollment: jasmine.createSpy().and.returnValue(of(true)),
      getUserCareerPackage: jasmine.createSpy().and.returnValue(of({
        id: '1',
        userId: 'user1',
        reviewerId: 'rev1',
        status: PackageStatus.IN_PROGRESS,
        reviewerComment: '',
        sectionSubmissions: [],
        template: {
          id: 'tpl1',
          title: 'Test Template',
          sections: []
        }
      })),
      submitCompleteCareerPackage: jasmine.createSpy().and.returnValue(of({ status: PackageStatus.UNDER_REVIEW }))
    };

    mockUserService = {
      getCurrentUser: jasmine.createSpy().and.returnValue(of({ id: 'user1' }))
    };

    mockLearningSubmissionService = {
      getSubmittedAndUnsubmittedTemplates: jasmine.createSpy().and.returnValue(of({
        submittedTemplates: [],
        unsubmittedTemplates: [],
        allTemplates: []
      }))
    };

    await TestBed.configureTestingModule({
      imports: [
        CareerPackageComponent,
        ReactiveFormsModule,
        CommonModule
      ],
      providers: [
        provideHttpClient(),
        { provide: CareerPackageService, useValue: mockCareerPackageService },
        { provide: UserService, useValue: mockUserService },
        { provide: LearningSubmissionService, useValue: mockLearningSubmissionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CareerPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load current user and check enrollment', () => {
    component.ngOnInit();
    expect(mockUserService.getCurrentUser).toHaveBeenCalled();
    expect(mockCareerPackageService.checkUserEnrollment).toHaveBeenCalledWith('user1');
    expect(component.isEnrolled).toBeTrue();
    expect(mockCareerPackageService.getUserCareerPackage).toHaveBeenCalled();
  });

  it('should load learning templates', () => {
    
    component.loadLearningTemplates();
    expect(mockLearningSubmissionService.getSubmittedAndUnsubmittedTemplates).toHaveBeenCalledWith('user1', 'tpl1');
  });

  it('should calculate learning section completion percentage as 100% when all approved', () => {
    component.learningTemplates = [
      { template: { id: 't1' } as any, status: SubmissionStatus.APPROVED },
      { template: { id: 't2' } as any, status: SubmissionStatus.APPROVED }
    ];
    expect(component.getLearningSectionCompletionPercentage()).toBe(100);
  });

  it('should disable package submit if under review', () => {
    component.userCareerPackage = {
      id: '1',
      userId: 'user1',
      reviewerId: 'rev1',
      status: PackageStatus.UNDER_REVIEW,
      reviewerComment: '',
      sectionSubmissions: [],
      template: {
          id: 'tpl1',
          title: 'Test Template',
          sections: [],
          description: ''
      }
    };
    expect(component.canSubmitCompletePackage()).toBeFalse();
  });

  it('should submit complete career package when all sections and learning are done', () => {
    
    component.learningTemplates = [];
    spyOn(component, 'canSubmitCompletePackage').and.returnValue(true);
    component.submitCompleteCareerPackage();
    expect(mockCareerPackageService.submitCompleteCareerPackage).toHaveBeenCalled();
    expect(component.successMessage).toBe('Career package submitted successfully for review!');
  });

});