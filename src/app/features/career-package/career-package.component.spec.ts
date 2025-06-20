import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CareerPackageComponent } from './career-package.component';

describe('CareerPackageComponent', () => {
  let component: CareerPackageComponent;
  let fixture: ComponentFixture<CareerPackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CareerPackageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CareerPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
