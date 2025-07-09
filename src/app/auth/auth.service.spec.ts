import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { UserAccount } from './user-account.model';
import { environment } from '../../environments/environment';
import { provideHttpClient } from '@angular/common/http';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    let routerMock: jasmine.SpyObj<Router>;

    beforeEach(() => {
        routerMock = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                AuthService,
                { provide: Router, useValue: routerMock }
            ]
        });

        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
        sessionStorage.clear();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should sign up a user', () => {
        const name = 'Test User';
        const email = 'test@example.com';
        const password = '123456';

        const mockResponse = { message: 'User created' };

        service.signUp(name, email, password).subscribe((res) => {
            expect(res).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(environment.signUpUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ name, email, password });

        req.flush(mockResponse);
    });

    it('should login and store user in sessionStorage', () => {
        const email = 'test@example.com';
        const password = '123456';
        const expiresIn = 3600000;

        const mockResponse = {
            data: {
                email,
                id: 'user123',
                token: 'abc123',
                expiresIn
            }
        };

        spyOn(sessionStorage, 'setItem');
        spyOn(service['userSubject'], 'next');
        spyOn(service, 'autoLogout');

        service.login(email, password).subscribe(user => {
            expect(service['userSubject'].next).toHaveBeenCalled();
            expect(sessionStorage.setItem).toHaveBeenCalled();
            expect(service.autoLogout).toHaveBeenCalledWith(expiresIn);
        });

        const req = httpMock.expectOne(environment.loginUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ email, password });

        req.flush(mockResponse);
    });

    it('should do nothing on autoLogin if sessionStorage is empty', () => {
        spyOn(service['userSubject'], 'next');
        service.autoLogin();
        expect(service['userSubject'].next).not.toHaveBeenCalled();
    });

    it('should restore user and call autoLogout on autoLogin', () => {
        const expirationDate = new Date(Date.now() + 3600000);
        const mockUser = new UserAccount('test@example.com', 'user123', 'abc123', expirationDate);

        sessionStorage.setItem('user', JSON.stringify(mockUser));

        spyOn(service['userSubject'], 'next');
        spyOn(service, 'autoLogout');

        service.autoLogin();

        expect(service['userSubject'].next).toHaveBeenCalled();
        expect(service.autoLogout).toHaveBeenCalled();
    });

    it('should logout and clear sessionStorage then navigate to /login', () => {
        spyOn(service['userSubject'], 'next');
        spyOn(sessionStorage, 'removeItem');

        service.logout();

        expect(service['userSubject'].next).toHaveBeenCalledWith(null);
        expect(sessionStorage.removeItem).toHaveBeenCalledWith('user');
        expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
        expect(service['tokenExpirationTimer']).toBeNull();
    });

    it('should call logout after expirationDuration in autoLogout', fakeAsync(() => {
        const logoutSpy = spyOn(service, 'logout');
        const expiration = 5000;
        service.autoLogout(expiration);

        expect(logoutSpy).not.toHaveBeenCalled();
        tick(expiration);
        expect(logoutSpy).toHaveBeenCalled();
    }));


    it('should return null if token is expired', () => {
        const expired = new Date(Date.now() - 10000);
        const user = new UserAccount('test@example.com', 'id123', 'token123', expired);
        expect(user.token).toBeNull();
    });

    it('should return token if still valid', () => {
        const future = new Date(Date.now() + 10000);
        const user = new UserAccount('test@example.com', 'id123', 'token123', future);
        expect(user.token).toBe('token123');
    });
});
