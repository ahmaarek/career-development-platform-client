import { TestBed } from '@angular/core/testing';
import { BlogWikiService } from './blog-wiki.service';
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BlogWikiDTO } from '../models/blog-wiki.model';
import { environment } from '../../../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

describe('BlogWikiService', () => {
  let service: BlogWikiService;
  let httpMock: HttpTestingController;

  const baseUrl = environment.learningServiceBaseUrl + '/content';

  const mockActivatedRoute = {
    snapshot: { paramMap: { get: () => 'entry-id' } }
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BlogWikiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    service = TestBed.inject(BlogWikiService);
    httpMock = TestBed.inject(HttpTestingController);
  });


  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve blogs', () => {
    const mockBlogs: BlogWikiDTO[] = [{ id: '1', title: 'Blog', content: 'Text' }];

    service.getBlogs().subscribe(data => {
      expect(data).toEqual(mockBlogs);
    });

    const req = httpMock.expectOne(`${baseUrl}/blogs`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBlogs);
  });

  it('should retrieve wikis', () => {
    const mockWikis: BlogWikiDTO[] = [{ id: '2', title: 'Wiki', content: 'Text' }];

    service.getWikis().subscribe(data => {
      expect(data).toEqual(mockWikis);
    });

    const req = httpMock.expectOne(`${baseUrl}/wikis`);
    expect(req.request.method).toBe('GET');
    req.flush(mockWikis);
  });

  it('should create a blog entry', () => {
    const entry = { title: 'Blog Title', content: 'Some content' };

    service.createEntry('BLOG', entry).subscribe(response => {
      expect(response).toEqual({ message: 'Created' });
    });

    const req = httpMock.expectOne(`${baseUrl}/blogs`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(entry);
    req.flush({ message: 'Created' });
  });

  it('should create a wiki entry', () => {
    const entry = { title: 'Wiki Title', content: 'Some content' };

    service.createEntry('WIKI', entry).subscribe(response => {
      expect(response).toEqual({ message: 'Created' });
    });

    const req = httpMock.expectOne(`${baseUrl}/wikis`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(entry);
    req.flush({ message: 'Created' });
  });

  it('should delete an entry', () => {
    const id = 'abc123';

    service.deleteEntry(id).subscribe(response => {
      expect(response).toBeNull(); // catchError returns of(null)
    });

    const req = httpMock.expectOne(`${baseUrl}/entry/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 500, statusText: 'Server Error' });
  });

  it('should get entry by id', () => {
    const id = '123';
    const entry: BlogWikiDTO = { id: '123', title: 'Entry', content: 'Details' };

    service.getEntryById(id).subscribe(result => {
      expect(result).toEqual(entry);
    });

    const req = httpMock.expectOne(`${baseUrl}/entry/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(entry);
  });

  it('should update an entry', () => {
    const entry: BlogWikiDTO = { id: 'xyz', title: 'Updated', content: 'New content' };
    const updatedEntry: BlogWikiDTO = { id: 'xyz', title: 'Updated2', content: 'New content45' };
    
    service.updateEntry(updatedEntry).subscribe(response => {
      expect(response).toBeNull(); 
    });

    const req = httpMock.expectOne(`${baseUrl}/xyz`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedEntry);
    req.flush(null);
  });
});
