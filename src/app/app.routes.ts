import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupFormComponent } from './auth/signup-multistep/signup-form/signup-form.component';
import { HomeComponent } from './features/home/home.component';
import { AdminControlComponent } from './features/admin-control/admin-control.component';
import { UserManagementComponent } from './features/admin-control/user-management/user-management.component';
import { MyProfileComponent } from './features/my-profile/my-profile.component';
import { MainLayoutComponent } from './layout/main/main-layout.component';
import { AuthLayoutComponent } from './layout/auth/auth-layout.component';
import { CareerPackageComponent } from './features/career-package/career-package.component';
import { CareerPackagesComponent } from './features/admin-control/career-package-management/career-package-management.component';

export const routes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            { path: 'login', component: LoginComponent },
            { path: 'signup', component: SignupFormComponent }
        ]
    },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: 'dashboard', component: HomeComponent }, 
            { path: 'career-package', component: CareerPackageComponent }, 
            { path: 'my-profile', component: MyProfileComponent },
            {
                path: 'admin',
                component: AdminControlComponent,
                children: [
                    { path: 'user-management', component: UserManagementComponent },
                    { path: 'career-package-management', component: CareerPackagesComponent }
                ]
            }
        ]
    }
];
