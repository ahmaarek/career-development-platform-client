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
import { ManagerControlComponent } from './features/manager-control/manager-control.component';
import { CareerPackageReviewComponent } from './features/manager-control/career-package-review/career-package-review.component';
import { LibraryHomeComponent } from './features/learning/library/library-home/library-home.component';
import { CreateEntryComponent } from './features/learning/library/create-entry/create-entry.component';
import { LibraryContainerComponent } from './features/learning/library/library-container/library-container.component';
import { TemplateBuilderComponent } from './features/learning/library/template-builder/template-builder.component';
import { ReviewSubmissionsComponent } from './features/learning/library/review-submissions/review-submissions.component';
import { LearningManagementComponent } from './features/admin-control/learning-management/learning-management.component';
import { EditOrDeleteComponent } from './features/learning/library/edit-or-delete/edit-or-delete.component';
import { EditEntryComponent } from './features/learning/library/edit-entry/edit-entry.component';
import { DashboardManagementComponent } from './features/admin-control/dashboard-management/dashboard-management.component';

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
                    { path: 'career-package-management', component: CareerPackagesComponent },
                    {path: 'learning-management', component: LearningManagementComponent} ,
                    {path: 'dashboard-management', component: DashboardManagementComponent}
                ]
            },
            {
                path: 'manager',
                component: ManagerControlComponent,
                children: [
                    { path: 'career-package-review', component: CareerPackageReviewComponent },
                    {path: 'learning-review', component: ReviewSubmissionsComponent}
                ]
            },
            {
                path: 'library', component: LibraryContainerComponent,
                children:[
                    {path: '', component: LibraryHomeComponent},
                    {path: 'create', component: CreateEntryComponent},
                    {path : 'learning-material/review-submissions', component: ReviewSubmissionsComponent},
                    {path: 'learning-material/create', component: TemplateBuilderComponent},
                    {path: 'edit', component: EditOrDeleteComponent},
                    {path: 'edit/:type/:id', component: EditEntryComponent},
                ]
            }
        ]
    }
];
