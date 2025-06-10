import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupFormComponent } from './auth/signup-multistep/signup-form/signup-form.component';
import { HomeComponent } from './features/home/home.component';

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
];
