import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BlogWikiDTO } from '../models/blog-wiki.model';
import { catchError, map, Observable, of } from 'rxjs';
import { ElementSchemaRegistry } from '@angular/compiler';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BlogWikiService {

    constructor(private http: HttpClient) { }

    getBlogs(): Observable<BlogWikiDTO[]> {
        return this.http.get<BlogWikiDTO[]>(`${environment.blogWikiUrl}/blogs`);
    }

    getWikis(): Observable<BlogWikiDTO[]> {
        return this.http.get<BlogWikiDTO[]>(`${environment.blogWikiUrl}/wikis`);
    }

    createEntry(type: 'BLOG' | 'WIKI', entry: { title: string, content: string, attachmentId?: string }): Observable<any> {
        if (type == "BLOG")
            return this.http.post(`${environment.blogWikiUrl}/blogs`, entry);
        else
            return this.http.post(`${environment.blogWikiUrl}/wikis`, entry);
    }

}
