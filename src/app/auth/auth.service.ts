import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { User } from './user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private userSubject = new BehaviorSubject<User | null>(null);
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
                const user = new User(response.data.email, response.data.id, response.data.token);
                this.userSubject.next(user);
                return this.user$; // Return the updated user observable
            })
        )
    }

}
