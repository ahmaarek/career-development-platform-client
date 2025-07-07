import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOrDeleteComponent } from './edit-or-delete.component';

describe('EditOrDeleteComponent', () => {
  let component: EditOrDeleteComponent;
  let fixture: ComponentFixture<EditOrDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditOrDeleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditOrDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
