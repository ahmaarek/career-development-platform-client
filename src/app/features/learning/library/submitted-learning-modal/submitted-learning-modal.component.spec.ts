import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmittedLearningModalComponent } from './submitted-learning-modal.component';

describe('SubmittedLearningModalComponent', () => {
  let component: SubmittedLearningModalComponent;
  let fixture: ComponentFixture<SubmittedLearningModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmittedLearningModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmittedLearningModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
