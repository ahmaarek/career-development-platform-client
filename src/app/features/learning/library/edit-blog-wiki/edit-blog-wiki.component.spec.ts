import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBlogWikiComponent } from './edit-blog-wiki.component';

describe('EditBlogWikiComponent', () => {
  let component: EditBlogWikiComponent;
  let fixture: ComponentFixture<EditBlogWikiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBlogWikiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditBlogWikiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
