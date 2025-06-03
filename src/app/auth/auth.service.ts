import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

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
        })
    }

}
