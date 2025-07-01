import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BlogWikiDTO } from '../models/blog-wiki.model';
import { catchError, map, Observable, of } from 'rxjs';
import { ElementSchemaRegistry } from '@angular/compiler';

@Injectable({ providedIn: 'root' })
export class BlogWikiService {
    private readonly baseUrl = 'http://localhost:8082/api/learning/content';

    constructor(private http: HttpClient) { }

    getBlogs(): Observable<BlogWikiDTO[]> {
        return this.http.get<BlogWikiDTO[]>(`${this.baseUrl}/blogs`);
    }

    getWikis(): Observable<BlogWikiDTO[]> {
        return this.http.get<BlogWikiDTO[]>(`${this.baseUrl}/wikis`);
    }

    createEntry(type: 'BLOG' | 'WIKI', entry: { title: string, content: string, attachmentId?: string }): Observable<any> {
        if (type == "BLOG")
            return this.http.post(`${this.baseUrl}/blogs`, entry);
        else
            return this.http.post(`${this.baseUrl}/wikis`, entry);
    }

}
