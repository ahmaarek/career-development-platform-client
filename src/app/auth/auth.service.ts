import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { UserAccount } from './user-account.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private userSubject = new BehaviorSubject<UserAccount | null>(null);
    user$ = this.userSubject.asObservable();

    constructor(private http: HttpClient) { }

    signUp(name: string, email: string, password: string): Observable<any> {
        const signupUrl = 'http://localhost:8080/auth/signup';

        return this.http.post<any>(signupUrl, {
            name,
            email,
            password
        })
    };


    login(email: string, password: string): Observable<any> {
        const loginUrl = 'http://localhost:8080/auth/login';

        return this.http.post<any>(loginUrl, {
            email,
            password
        }).pipe(
            switchMap((response) => {
                // Assuming the response contains user data
                const user = new UserAccount(response.data.email, response.data.id, response.data.token);
                this.userSubject.next(user);
                sessionStorage.setItem('user', JSON.stringify(user)); // Store token in local storage
                return this.user$; // Return the updated user observable
            })
        )
    }

    autoLogin() {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return;
    }

    console.log('Auto-login triggered');
    const userDataString = sessionStorage.getItem('user');
    if (!userDataString) {
      return;
    }

    const userData = JSON.parse(userDataString);

    const loadedUser = new UserAccount(
      userData.email,
      userData.id,
      userData._token
    );

    if (loadedUser.token) {
    console.log('Auto-login successful:', loadedUser);
      this.userSubject.next(loadedUser);
    }
  }


}