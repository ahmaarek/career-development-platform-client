import { Component } from '@angular/core';
import { NavbarComponent } from '../../features/navbar/navbar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [NavbarComponent, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {}
