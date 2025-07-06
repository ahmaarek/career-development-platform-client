import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningManagementComponent } from './learning-management.component';

describe('LearningManagementComponent', () => {
  let component: LearningManagementComponent;
  let fixture: ComponentFixture<LearningManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
