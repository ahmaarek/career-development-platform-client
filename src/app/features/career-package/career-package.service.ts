import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserCareerPackage } from './models/user-career-package.interface';
import { CareerPackageTemplate } from './models/career-package-template.interface';
import { UserFieldResponse } from './models/user-field-response.interface';
import { PackageStatus } from './enums/package-status.enum';
import { UserService } from '../../user/user.service';
import { UserSectionResponse } from './models/user-section-response.interface';
import { idText } from 'typescript';


@Injectable({
  providedIn: 'root'
})
export class CareerPackageService {
  private readonly baseUrl = 'http://localhost:8083/api';

  constructor(private http: HttpClient, private userService: UserService) { }

  checkUserEnrollment(userId: string): Observable<boolean> {
    return this.http.get<UserCareerPackage>(`${this.baseUrl}/user-career-package/user/${userId}`)
      .pipe(
        map(userPackage => !!userPackage),
        catchError(error => {
          if (error.status === 404) {
            return [false]; // User not enrolled
          }
          return this.handleError(error);
        })
      );
  }


  getUserCareerPackage(userId: string): Observable<UserCareerPackage> {
    return this.http.get<UserCareerPackage>(`${this.baseUrl}/user-career-package/user/${userId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  submitCompleteSection(
    userCareerPackageId: string,
    sectionTemplateId: string,
    fieldResponses: UserFieldResponse[]
  ): Observable<UserSectionResponse> {
    const sectionResponseData = {
      userCareerPackageId: userCareerPackageId,
      sectionTemplateId: sectionTemplateId,
      fieldResponses: fieldResponses
    };

    console.log('Submitting complete section:', sectionResponseData);

    return this.http.post<UserSectionResponse>(`${this.baseUrl}/user-section-response`, sectionResponseData)
      .pipe(
        catchError(this.handleError)
      );
  }


  updateSectionResponse(sectionResponseId: string, sectionResponse: UserSectionResponse): Observable<UserSectionResponse> {
    const body = {
      userCareerPackageId: sectionResponse.userCareerPackageId,
      sectionTemplateId: sectionResponse.sectionTemplateId,
      fieldResponses: sectionResponse.fieldResponses.map(fr => ({
        fieldTemplateId: fr.fieldTemplateId,
        value: fr.value
      }))
    };
  const body = {
    userCareerPackageId: sectionResponse.userCareerPackageId,
    sectionTemplateId: sectionResponse.sectionTemplateId,
    fieldResponses: sectionResponse.fieldResponses.map(fr => ({
      id: fr.id,
      fieldTemplateId: fr.fieldTemplateId,
      value: fr.value
    }))
  };

    console.log('Updating section response:', body);
    return this.http.put<UserSectionResponse>(
      `${this.baseUrl}/user-section-response/${sectionResponseId}`,
      body
    ).pipe(
      catchError(this.handleError)
    );
  }


  submitCompleteCareerPackage(userCareerPackage: UserCareerPackage): Observable<UserCareerPackage> {
    const submissionData = {
      id: userCareerPackage.id,
      status: PackageStatus.UNDER_REVIEW
    };

    return this.http.patch<UserCareerPackage>(`${this.baseUrl}/user-career-package/${userCareerPackage.id}`, submissionData)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllCareerPackageTemplates(): Observable<CareerPackageTemplate[]> {
    return this.http.get<CareerPackageTemplate[]>(`${this.baseUrl}/career-package-template`)
      .pipe(
        catchError(this.handleError)
      );
  }

  updatePackage(id: string, updatedPkg: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/career-package-template/${id}/sync`, updatedPkg);
  }

  createNewPackage(request: { title: string; description: string }): Observable<CareerPackageTemplate> {
    return this.http.post<CareerPackageTemplate>(`${this.baseUrl}/career-package-template`, request);
  }

  assignCareerPackage(request: {
    userId: string;
    reviewerId: string;
    templateId: string;
    status: string;
  }): Observable<any> {

    return this.http.post<CareerPackageTemplate>(`${this.baseUrl}/user-career-package/assign`, request);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

      // Customize error messages based on status codes
      switch (error.status) {
        case 400:
          errorMessage = 'Bad request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in.';
          break;
        case 403:
          errorMessage = 'Forbidden. You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
      }
    }

    console.error('CareerPackageService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

