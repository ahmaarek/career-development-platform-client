import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CareerPackageReviewComponent } from './career-package-review.component';
import { CareerPackageService } from '../../career-package/career-package.service';
import { UserService } from '../../../user/user.service';
import { of, throwError } from 'rxjs';
import { User } from '../../../user/user.model';
import { PackageStatus } from '../../career-package/enums/package-status.enum';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

describe('CareerPackageReviewComponent', () => {
  let component: CareerPackageReviewComponent;
  let fixture: ComponentFixture<CareerPackageReviewComponent>;

  let mockCareerPackageService: any;
  let mockUserService: any;

  beforeEach(async () => {
    mockCareerPackageService = {
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
          sections: [],
          description: ''
        }
      })),
      getAllCareerPackageTemplates: jasmine.createSpy().and.returnValue(of([
        {
          id: 'tpl1',
          title: 'Associate Software Engineer',
          sections: []
        }
      ])),
      ApproveCareerPackage: jasmine.createSpy().and.returnValue(of({ status: PackageStatus.APPROVED })),
      RejectCareerPackage: jasmine.createSpy().and.returnValue(of({ status: PackageStatus.REJECTED })),
      assignCareerPackage: jasmine.createSpy().and.returnValue(of({}))
    };

    mockUserService = {
      getCurrentUser: jasmine.createSpy().and.returnValue(of({ id: 'm1' })),
      getUsersByManagerId: jasmine.createSpy().and.returnValue(of([
        { id: 'u1', name: 'John' } as User
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [
        CareerPackageReviewComponent,
        CommonModule,
        ReactiveFormsModule
      ],
      providers: [
        provideHttpClient(),
        { provide: CareerPackageService, useValue: mockCareerPackageService },
        { provide: UserService, useValue: mockUserService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CareerPackageReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load users and their packages on init', () => {
    component.ngOnInit();
    expect(mockUserService.getCurrentUser).toHaveBeenCalled();
    expect(mockUserService.getUsersByManagerId).toHaveBeenCalledWith('m1');
    expect(mockCareerPackageService.getUserCareerPackage).toHaveBeenCalledWith('u1');
    expect(component.employees.length).toBe(1);
    expect(component.userPackages['u1']).toBeDefined();
  });

  it('should open and close assign modal', () => {
    component.careerPackageTemplates = [{
      id: 'tpl1', title: 'Associate Software Engineer', sections: [],
      description: ''
    }];
    component.openAssignModal('u1');
    expect(component.assigningUserId).toBe('u1');
    expect(component.selectedTemplateId).toBe('tpl1');
    component.closeAssignModal();
    expect(component.assigningUserId).toBeNull();
  });

  it('should assign a career package', () => {
    component.assigningUserId = 'u1';
    component.selectedTemplateId = 'tpl1';
    component.managerId = 'm1';

    component.confirmAssign();
    expect(mockCareerPackageService.assignCareerPackage).toHaveBeenCalled();
    expect(component.successMessage).toContain('assigned successfully');
  });

  it('should approve a career package', () => {
    component.userPackages['u1'] = {
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

    component.approveSubmission('u1');
    expect(mockCareerPackageService.ApproveCareerPackage).toHaveBeenCalled();
    expect(component.successMessage).toContain('approved successfully');
  });

  it('should reject a career package', () => {
    component.userPackages['u1'] = {
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

    component.rejectSubmission('u1');
    expect(mockCareerPackageService.RejectCareerPackage).toHaveBeenCalled();
    expect(component.successMessage).toContain('rejected successfully');
  });

});