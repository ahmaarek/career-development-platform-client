import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CareerPackageService } from './career-package.service';
import { environment } from '../../../environments/environment';
import { PackageStatus } from './enums/package-status.enum';
import { UserFieldSubmission } from './models/user-field-submission.interface';
import { UserSectionSubmission } from './models/user-section-submission.interface';
import { CareerPackageTemplate } from './models/career-package-template.interface';
import { UserCareerPackage } from './models/user-career-package.interface';
import { provideHttpClient } from '@angular/common/http';

describe('CareerPackageService', () => {
  let service: CareerPackageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CareerPackageService
      ]
    });
    service = TestBed.inject(CareerPackageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return true if user is enrolled', () => {
    const mockResponse = { id: '1', userId: '123' };
    service.checkUserEnrollment('123').subscribe(isEnrolled => {
      expect(isEnrolled).toBeTrue();
    });
    const req = httpMock.expectOne(`${environment.careerPackageBaseUrl}/user-career-package/user/123`);
    req.flush(mockResponse);
  });

  it('should return false if user is not enrolled (404)', () => {
    service.checkUserEnrollment('123').subscribe(isEnrolled => {
      expect(isEnrolled).toBeFalse();
    });
    const req = httpMock.expectOne(`${environment.careerPackageBaseUrl}/user-career-package/user/123`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should return user career package data', () => {
    const mockPackage: UserCareerPackage = {
      id: '1', userId: '123', reviewerId: 'rev', status: PackageStatus.IN_PROGRESS,
      template: undefined as any,
      reviewerComment: '',
      sectionSubmissions: []
    };
    service.getUserCareerPackage('123').subscribe(pkg => {
      expect(pkg).toEqual(mockPackage);
    });
    const req = httpMock.expectOne(`${environment.careerPackageBaseUrl}/user-career-package/user/123`);
    req.flush(mockPackage);
  });

  it('should submit section data successfully', () => {
    const mockResponse: UserSectionSubmission = { id: 'section1', userCareerPackageId: 'ucp1', sectionTemplateId: 'st1', fieldSubmissions: [] };
    const fieldSubmissions: UserFieldSubmission[] = [{ fieldTemplateId: 'f1', value: 'val1' }];
    service.submitCompleteSection('ucp1', 'st1', fieldSubmissions).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${environment.careerPackageBaseUrl}/user-section-response`);
    req.flush(mockResponse);
  });

  it('should update section submission', () => {
    const mockResponse: UserSectionSubmission = {
      id: 'sec1',
      userCareerPackageId: 'ucp1',
      sectionTemplateId: 'st1',
      fieldSubmissions: []
    };
    const updatedData = {
      ...mockResponse,
      fieldSubmissions: [{ id: 'fs1', fieldTemplateId: 'ft1', value: 'new value' }],
      newFieldSubmissions: [{ fieldTemplateId: 'ft2', value: 'another' }]
    };
    service.updateSectionSubmission('sec1', updatedData).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${environment.careerPackageBaseUrl}/user-section-response/sec1`);
    req.flush(mockResponse);
  });

  it('should submit complete career package', () => {
    const mockPackage: UserCareerPackage = {
      id: '1', userId: '123', reviewerId: 'rev1', status: PackageStatus.UNDER_REVIEW,
      template: undefined as any,
      reviewerComment: '',
      sectionSubmissions: []
    };
    service.submitCompleteCareerPackage(mockPackage).subscribe(pkg => {
      expect(pkg.status).toBe(PackageStatus.UNDER_REVIEW);
    });
    const req = httpMock.expectOne(`${environment.careerPackageBaseUrl}/user-career-package/1`);
    req.flush(mockPackage);
  });

  it('should approve career package', () => {
    const mockPackage: UserCareerPackage = {
      id: '1', userId: '123', reviewerId: 'rev1', status: PackageStatus.APPROVED, reviewerComment: 'Well done',
      template: undefined as any,
      sectionSubmissions: []
    };
    service.ApproveCareerPackage(mockPackage).subscribe(pkg => {
      expect(pkg.status).toBe(PackageStatus.APPROVED);
    });
    const req = httpMock.expectOne(`${environment.careerPackageBaseUrl}/user-career-package/1`);
    req.flush(mockPackage);
  });

  it('should reject career package', () => {
    const mockPackage: UserCareerPackage = {
      id: '1', userId: '123', reviewerId: 'rev1', status: PackageStatus.REJECTED, reviewerComment: 'Needs improvement',
      template: undefined as any,
      sectionSubmissions: []
    };
    service.RejectCareerPackage(mockPackage).subscribe(pkg => {
      expect(pkg.status).toBe(PackageStatus.REJECTED);
    });
    const req = httpMock.expectOne(`${environment.careerPackageBaseUrl}/user-career-package/1`);
    req.flush(mockPackage);
  });

  it('should fetch all career package templates', () => {
    const mockTemplates: CareerPackageTemplate[] = [{
      id: '1', title: 'Template 1', description: 'desc',
      sections: []
    }];
    service.getAllCareerPackageTemplates().subscribe(templates => {
      expect(templates.length).toBe(1);
    });
    const req = httpMock.expectOne(`${environment.careerPackageBaseUrl}/career-package-template`);
    req.flush(mockTemplates);
  });

  it('should update a package', () => {
    const updatedPkg = { title: 'Updated Title' };
    service.updatePackage('1', updatedPkg).subscribe(res => {
      expect(res).toBeTruthy();
    });
    const req = httpMock.expectOne(`${environment.careerPackageBaseUrl}/career-package-template/1/sync`);
    req.flush({ success: true });
  });

  it('should create a new package', () => {
    const request = { title: 'New Title', description: 'Description' };
    const mockTemplate = { id: '1', ...request };
    service.createNewPackage(request).subscribe(res => {
      expect(res.title).toBe('New Title');
    });
    const req = httpMock.expectOne(`${environment.careerPackageBaseUrl}/career-package-template`);
    req.flush(mockTemplate);
  });

  it('should assign a career package', () => {
    const request = { userId: '123', reviewerId: 'rev', templateId: 'tpl', status: 'PENDING' };
    const mockResponse = { id: '1', ...request };
    service.assignCareerPackage(request).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${environment.careerPackageBaseUrl}/user-career-package/assign`);
    req.flush(mockResponse);
  });

  it('should delete career package', () => {
    service.deleteCareerPackage('123').subscribe(res => {
      expect(res).toBeTruthy();
    });
    const req = httpMock.expectOne(`${environment.careerPackageBaseUrl}/career-package-template/123`);
    req.flush({ success: true });
  });
});