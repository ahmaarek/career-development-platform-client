import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CareerPackagePanelComponent } from './career-package-panel.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CareerPackageService } from '../../../career-package/career-package.service';
import { of, throwError } from 'rxjs';
import { SectionType } from '../../../career-package/enums/section-type.enum';

describe('CareerPackagePanelComponent', () => {
  let component: CareerPackagePanelComponent;
  let fixture: ComponentFixture<CareerPackagePanelComponent>;
  let mockCareerPackageService: any;
  let mockSnackBar: any;

  beforeEach(async () => {
    mockCareerPackageService = {
      deleteCareerPackage: jasmine.createSpy().and.returnValue(of({})),
      updatePackage: jasmine.createSpy().and.returnValue(of({}))
    };

    mockSnackBar = {
      open: jasmine.createSpy()
    };

    await TestBed.configureTestingModule({
      imports: [CareerPackagePanelComponent, MatSnackBarModule],
      providers: [
        { provide: CareerPackageService, useValue: mockCareerPackageService },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CareerPackagePanelComponent);
    component = fixture.componentInstance;
    component.package = {
      id: 'pkg1',
      title: 'Mock Package',
      description: 'Mock Description',
      sections: []
    };
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle expand state', () => {
    expect(component.expanded).toBeFalse();
    component.toggleExpand();
    expect(component.expanded).toBeTrue();
  });

  it('should toggle edit state', () => {
    expect(component.isEditing).toBeFalse();
    component.toggleEdit();
    expect(component.isEditing).toBeTrue();
  });

  it('should add a new section and track it', () => {
    component.addSection();
    expect(component.package.sections.length).toBe(1);
    expect(component.newSections.length).toBe(1);
    expect(component.package.sections[0].title).toBe('New Section');
  });

  it('should delete a section and track its ID', () => {
    const section = {
      id: 's1',
      title: 'Section 1',
      type: SectionType.LEARNING,
      instructions: '',
      requirements: '',
      fields: []
    };
    component.package.sections.push(section);
    fixture.detectChanges();
    component.deleteSection(0);
    expect(component.package.sections.length).toBe(0);
    expect(component.deletedSectionIds).toContain('s1');
  });

  it('should submit changes and reset tracking data', () => {
    spyOn(component, 'resetTrackingData').and.callThrough();
    component.submitChanges();
    expect(mockCareerPackageService.updatePackage).toHaveBeenCalled();
    expect(component.resetTrackingData).toHaveBeenCalled();
  });

  it('should delete a package', () => {
    component.deletePackage();
    expect(mockCareerPackageService.deleteCareerPackage).toHaveBeenCalledWith('pkg1');
  });

  it('should update package info via savePackageInfo()', () => {
    component.savePackageInfo('New Title', 'New Desc');
    expect(component.package.title).toBe('New Title');
    expect(mockSnackBar.open).toHaveBeenCalledWith('Package details saved', 'Close', jasmine.any(Object));
  });
});