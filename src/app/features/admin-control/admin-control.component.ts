import { Component } from '@angular/core';
import {RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-control',
  imports: [RouterOutlet,RouterLink],
  templateUrl: './admin-control.component.html',
  styleUrls: ['./admin-control.component.css']
})
export class AdminControlComponent {
  adminName: string = 'Admin User';

  
}
