import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningTemplateModalComponent } from './learning-template-modal.component';

describe('LearningTemplateModalComponent', () => {
  let component: LearningTemplateModalComponent;
  let fixture: ComponentFixture<LearningTemplateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningTemplateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningTemplateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
