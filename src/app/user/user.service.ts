import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { User } from './user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly imageUrl = environment.userBaseUrl + '/images';
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) { }

  getUser(): User | null {
    
    return this.userSubject.value;
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(environment.userBaseUrl);
  }

  getUserById(id: string): Observable<User> {
    const userString = sessionStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?._token || "";

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `${environment.userBaseUrl}/${id}`;
    return this.http.get<User>(url, { headers });
  }

  getUserByEmail(email: string, token: string): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `${environment.userBaseUrl}/'by-email'/${email}`;
    return this.http.get<User>(url, { headers });
  }

  getCurrentUser(): Observable<User> {
    const userString = sessionStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?._token || "";

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    
    const userRequest$ = this.http.get<User>(`${environment.userBaseUrl}/by-token`, { headers });

    userRequest$.subscribe({
      next: (user) => {
        
        this.userSubject.next(user);
      },
      error: (error) => {
        console.error('Failed to fetch current user:', error);
        this.userSubject.next(null);
      }
    });

    return userRequest$;
  }

  updateUser(id: string, updatedData: Partial<User>): Observable<User> {
    const userString = sessionStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?._token || "";

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<User>(`${environment.userBaseUrl}/${id}`, updatedData, { headers });
  }

  getUsersByManagerId(managerId: string): Observable<User[]> {
    const userString = sessionStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?._token || "";

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<User[]>(`${environment.userBaseUrl}/by-manager/${managerId}`, { headers });
  }

  uploadImage(file: File, userId: string): Observable<{ imageId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    return this.http.post(`${this.imageUrl}/upload`, formData, {
      responseType: 'text'
    }).pipe(

      switchMap((responseText: string) => {
        return new Observable<{ imageId: string }>(observer => {
          observer.next({ imageId: responseText });
          observer.complete();
        });
      })
    );
  }


  getUserImage(userId: string): Observable<string> {
    const url = `${this.imageUrl}/${userId}`;


    return this.http.get(url, { responseType: 'blob' }).pipe(
      switchMap(blob => {
        return new Observable<string>(observer => {
          const reader = new FileReader();
          reader.onloadend = () => {
            observer.next(reader.result as string);
            observer.complete();
          };
          reader.onerror = err => {
            observer.error(err);
          };
          reader.readAsDataURL(blob);
        });
      })
    );
  }

  getProtectedImage(imageId: string): Observable<Blob> {
  return this.http.get(`${this.imageUrl}/${imageId}`, {
    responseType: 'blob'
  });
}




}