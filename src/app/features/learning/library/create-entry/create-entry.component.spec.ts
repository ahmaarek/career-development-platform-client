import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { CreateEntryComponent } from './create-entry.component';
import { BlogWikiService } from '../services/blog-wiki.service';
import { UserService } from '../../../../user/user.service';
import { LearningDocumentService } from '../services/learning-document.service';
import { User } from '../../../../user/user.model';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

describe('CreateEntryComponent', () => {
  let component: CreateEntryComponent;
  let fixture: ComponentFixture<CreateEntryComponent>;

  let mockBlogWikiService: jasmine.SpyObj<BlogWikiService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockDocumentService: jasmine.SpyObj<LearningDocumentService>;

  const dummyUser: User = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    photoUrl: '',
    imageId: '',
    role: 'EMPLOYEE',
    managerId: 'manager-1'
  };
  beforeEach(async () => {
    mockBlogWikiService = jasmine.createSpyObj('BlogWikiService', ['createEntry']);
    mockUserService = jasmine.createSpyObj('UserService', ['getCurrentUser']);
    mockDocumentService = jasmine.createSpyObj('LearningDocumentService', ['uploadAttachment']);


    await TestBed.configureTestingModule({
      imports: [CreateEntryComponent],
      providers: [
        { provide: BlogWikiService, useValue: mockBlogWikiService },
        { provide: UserService, useValue: mockUserService },
        { provide: LearningDocumentService, useValue: mockDocumentService },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CreateEntryComponent);
    component = fixture.componentInstance;
    mockUserService.getCurrentUser.and.returnValue(of(dummyUser));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load current user on init', () => {
    mockUserService.getCurrentUser.and.returnValue(of(dummyUser));
    component.ngOnInit();
    expect(component.currentUser).toEqual(dummyUser);
  });

  it('should change entry type', () => {
    component.onTypeChange('WIKI');
    expect(component.entryType).toBe('WIKI');
  });

  it('should patch form value on file input', () => {
    const dummyFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [dummyFile] } } as unknown as Event;

    component.onFileChange(event);

    expect(component.form.value.attachment).toBe(dummyFile);
  });

  it('should not submit if form is invalid', () => {
    component.form.setValue({ title: '', content: '', attachment: null });
    component.onSubmit();
    expect(mockBlogWikiService.createEntry).not.toHaveBeenCalled();
  });

  it('should upload attachment and submit entry', fakeAsync(() => {
    component.currentUser = dummyUser;
    component.form.setValue({ title: 'Test', content: 'Content', attachment: new File([''], 'file.txt') });

    mockDocumentService.uploadAttachment.and.returnValue(of('file-123'));
    mockBlogWikiService.createEntry.and.returnValue(of({}));

    component.onSubmit();
    tick();

    expect(mockDocumentService.uploadAttachment).toHaveBeenCalled();
    expect(mockBlogWikiService.createEntry).toHaveBeenCalledWith('BLOG', jasmine.objectContaining({
      title: 'Test',
      content: 'Content',
      attachmentId: 'file-123'
    }));
  }));

  it('should handle attachment upload failure', fakeAsync(() => {
    component.currentUser = dummyUser;
    component.form.setValue({ title: 'Test', content: 'Content', attachment: new File([''], 'file.txt') });

    spyOn(window, 'alert');
    mockDocumentService.uploadAttachment.and.returnValue(throwError(() => new Error('Upload failed')));

    component.onSubmit();
    tick();

    expect(window.alert).toHaveBeenCalledWith('Failed to upload attachment.');
    expect(mockBlogWikiService.createEntry).not.toHaveBeenCalled();
  }));


 it('should call createEntry with correct payload when form is submitted', () => {
  mockUserService.getCurrentUser.and.returnValue(of(dummyUser));
  mockBlogWikiService.createEntry.and.returnValue(of(null));

  fixture.detectChanges(); 

  component.form.setValue({
    title: 'Test',
    content: 'Content',
    attachment: null
  });

  component.onSubmit();

  expect(mockBlogWikiService.createEntry).toHaveBeenCalledWith(
    'BLOG',
    jasmine.objectContaining({
      title: 'Test',
      content: 'Content',
      attachmentId: undefined
    })
  );
});



});
