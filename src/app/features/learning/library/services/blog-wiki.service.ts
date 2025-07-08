import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BlogWikiDTO } from '../models/blog-wiki.model';
import { catchError, map, Observable, of } from 'rxjs';
import { ElementSchemaRegistry } from '@angular/compiler';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BlogWikiService {

    private readonly blogWikiUrl = environment.learningServiceBaseUrl + '/content';
    constructor(private http: HttpClient) { }

    getBlogs(): Observable<BlogWikiDTO[]> {
        return this.http.get<BlogWikiDTO[]>(`${this.blogWikiUrl}/blogs`);
    }

    getWikis(): Observable<BlogWikiDTO[]> {
        return this.http.get<BlogWikiDTO[]>(`${this.blogWikiUrl}/wikis`);
    }

    createEntry(type: 'BLOG' | 'WIKI', entry: { title: string, content: string, attachmentId?: string }): Observable<any> {
        if (type == "BLOG")
            return this.http.post(`${this.blogWikiUrl}/blogs`, entry);
        else
            return this.http.post(`${this.blogWikiUrl}/wikis`, entry);
    }

    deleteEntry(id: string): Observable<any> {
        return this.http.delete(`${this.blogWikiUrl}/entry/${id}`).pipe(
            catchError(error => {
                
                return of(null);
            })
        );
    }

    getEntryById(id: string): Observable<BlogWikiDTO> {
        return this.http.get<BlogWikiDTO>(`${this.blogWikiUrl}/entry/${id}`);
    }

    updateEntry(entry: BlogWikiDTO): Observable<void> {
        return this.http.put<void>(`${this.blogWikiUrl}/${entry.id}`, entry);
    }


}
