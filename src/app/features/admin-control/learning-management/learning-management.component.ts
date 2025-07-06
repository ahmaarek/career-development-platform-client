import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-learning-management',
  imports: [],
  templateUrl: './learning-management.component.html',
  styleUrl: './learning-management.component.css'
})
export class LearningManagementComponent {
  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
