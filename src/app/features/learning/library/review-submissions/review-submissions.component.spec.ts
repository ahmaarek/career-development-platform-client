import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewSubmissionsComponent } from './review-submissions.component';

describe('ReviewSubmissionsComponent', () => {
  let component: ReviewSubmissionsComponent;
  let fixture: ComponentFixture<ReviewSubmissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewSubmissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
