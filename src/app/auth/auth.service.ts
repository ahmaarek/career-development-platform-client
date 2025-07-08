import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { UserAccount } from './user-account.model';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private userSubject = new BehaviorSubject<UserAccount | null>(null);
  user$ = this.userSubject.asObservable();

  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) { }

  signUp(name: string, email: string, password: string): Observable<any> {

    return this.http.post<any>(environment.signUpUrl, {
      name,
      email,
      password
    })
  };

  login(email: string, password: string): Observable<any> {

    return this.http.post<any>(environment.loginUrl, {
      email,
      password
    }).pipe(
      switchMap((response) => {
        const expiresIn = response.data.expiresIn; // milliseconds
        const expirationDate = new Date(new Date().getTime() + expiresIn);
        const user = new UserAccount(response.data.email, response.data.id, response.data.token, expirationDate);
        this.userSubject.next(user);
        sessionStorage.setItem('user', JSON.stringify(user));
        this.autoLogout(expiresIn);
        return this.user$;
      })
    )
  }


  autoLogin() {
    const userDataString = sessionStorage.getItem('user');
    if (!userDataString) return;

    const userData = JSON.parse(userDataString);
    const loadedUser = new UserAccount(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    if (loadedUser.token) {
      this.userSubject.next(loadedUser);

      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();

      if (expirationDuration > 0) {
        this.autoLogout(expirationDuration);
      } else {
        this.logout();
      }
    }
  }

  autoLogout(expirationDuration: number) {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  logout() {
    this.userSubject.next(null);
    sessionStorage.removeItem('user');

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;

    this.router.navigate(['/login']);
  }



}