import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, combineLatest, map, catchError } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LearningDocumentService {

  private readonly learningDocumentsUrl = environment.learningServiceBaseUrl+ '/files';
  constructor(private http: HttpClient) {}

  getAttachmentUrl(attachmentId: string): string {
    return `${this.learningDocumentsUrl}/${attachmentId}`;
  }

  getProtectedAttachment(attachmentId: string): Observable<Blob> {
    return this.http.get(this.getAttachmentUrl(attachmentId), {
      responseType: 'blob'
    });
  }

  getProtectedAttachmentResponse(attachmentId: string): Observable<HttpResponse<Blob>> {
    return this.http.get(this.getAttachmentUrl(attachmentId), {
      observe: 'response',
      responseType: 'blob'
    });
  }

  detectAttachmentType(attachmentId: string): Observable<'image' | 'video' | 'document' | null> {
    return this.getProtectedAttachmentResponse(attachmentId).pipe(
      map(res => {
        const contentType = res.headers.get('Content-Type');
        if (!contentType) return null;
        if (contentType.startsWith('image/')) return 'image';
        if (contentType.startsWith('video/')) return 'video';
        return 'document';
      }),
      catchError(err => {
        console.error('Attachment detection failed', err);
        return of(null);
      })
    );
  }



  uploadAttachment(file: File, userId: string, type: 'content' | 'template' | 'submission'): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    return this.http.post(`${this.learningDocumentsUrl}/upload/${type}`, formData, {
      responseType: 'text'
    });
  }

getAttachmentBlobAndType(attachmentId: string): Observable<{ blobUrl: string, type: 'image' | 'video' | 'document' | null }> {
  return this.getProtectedAttachmentResponse(attachmentId).pipe(
    map(response => {
      const contentType = response.headers.get('Content-Type') || '';
      const blob = response.body!;
      const blobUrl = URL.createObjectURL(blob);

      let type: 'image' | 'video' | 'document' | null = null;
      if (contentType.startsWith('image')) {
        type = 'image';
      } else if (contentType.startsWith('video')) {
        type = 'video';
      } else if (contentType) {
        type = 'document';
      }

      return { blobUrl, type };
    })
  );
}


  uploadAttachmentsForSections(sections: any[], userId: string): Observable<(string | null)[]> {
    const uploadObservables = sections.map((section, index) => {
      const file = section.attachment;
      return file
        ? this.uploadAttachment(file, userId, 'template')
        : of(null);
    });

    return combineLatest(uploadObservables);
  }
}
