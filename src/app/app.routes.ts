import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupFormComponent } from './auth/signup-multistep/signup-form/signup-form.component';
import { HomeComponent } from './features/home/home.component';
import { AdminControlComponent } from './features/admin-control/admin-control.component';
import { UserManagementComponent } from './features/admin-control/user-management/user-management.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'signup',
        component: SignupFormComponent
    },
    {
        path: 'home',
        component: HomeComponent,
        // children: [
        //     { path: 'dashboard', component: DashboardComponent },
        //     { path: 'learning-and-wiki', component: LearningAndWikiComponent },
        //     { path: 'career-package', component: CareerPackageComponent },
        // ],
    },
    {
        path: 'admin',
        component: AdminControlComponent,
        children: [
            { path: 'user-management', component: UserManagementComponent },
            // { path: 'career-package-management', component: CareerPackageManagementComponent },
            // { path: 'learning-management', component: LearningManagementComponent },
            // { path: 'dashboard-management', component: DashboardManagementComponent },
            // { path: '', redirectTo: 'user-management', pathMatch: 'full' }
        ]
    }
];
