import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth.service';


describe('LoginComponent', () => {

    let authServiceMock: jasmine.SpyObj<AuthService>;
    let routerMock: jasmine.SpyObj<Router>;
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let html: HTMLElement;

    beforeEach(async () => {

        authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
        routerMock = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, LoginComponent],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: Router, useValue: routerMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        html = fixture.nativeElement;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should have an invalid form when empty', () => {
        expect(component.loginForm.valid).toBeFalse();
    });

    it('should validate email and password fields', () => {
        component.loginForm.setValue({ email: 'invalid', password: '123' });
        expect(component.loginForm.valid).toBeFalse();

        component.loginForm.setValue({ email: 'test@example.com', password: '123456' });
        expect(component.loginForm.valid).toBeTrue();
    });

    it('should call authService.login and navigate on success', () => {

        const mockResponse = '123ABC';

        authServiceMock.login.and.returnValue(of(mockResponse));

        component.loginForm.setValue({ email: 'test@example.com', password: '123456' });
        component.onSubmit();

        expect(authServiceMock.login).toHaveBeenCalledWith('test@example.com', '123456');
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/dashboard', { replaceUrl: true });
    });

    it('should navigate to signup page', () => {
        const signupButton = html.querySelector('.signup-btn') as HTMLButtonElement;
        signupButton.click();
        expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/signup', { replaceUrl: true });
    });

    it('should display "Email is required." when email is empty and touched', () => {
        const emailControl = component.loginForm.get('email');
        emailControl?.markAsTouched();
        emailControl?.setValue('');
        fixture.detectChanges();

        const errorMessage = html.querySelector('.error') as HTMLElement;
        expect(errorMessage.textContent).toContain('Email is required.');
    });

    it('should display "Invalid email format." when email is not valid and touched', () => {
        const emailControl = component.loginForm.get('email');
        emailControl?.markAsTouched();
        emailControl?.setValue('hello@');
        fixture.detectChanges();

        const errorMessage = html.querySelector('.error') as HTMLElement;
        expect(errorMessage.textContent).toContain('Invalid email format.');
    });

    it('should display "Password is required." when password is empty and touched', () => {
        const passwordControl = component.loginForm.get('password');
        passwordControl?.markAsTouched();
        passwordControl?.setValue('');
        fixture.detectChanges();

        const errorMessage = html.querySelector('.error') as HTMLElement;
        expect(errorMessage.textContent).toContain('Password is required.');
    });

    it('should display "Minimum 6 characters." when password is less tha 6 characters and touched', () => {
        const passwordControl = component.loginForm.get('password');
        passwordControl?.markAsTouched();
        passwordControl?.setValue('1234');
        fixture.detectChanges();

        const errorMessage = html.querySelector('.error') as HTMLElement;
        expect(errorMessage.textContent).toContain('Minimum 6 characters.');
    });
});