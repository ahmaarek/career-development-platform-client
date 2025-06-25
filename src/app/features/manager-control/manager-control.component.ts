import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-manager-control',
  imports: [RouterOutlet,RouterLink],
  templateUrl: './manager-control.component.html',
  styleUrls: ['./manager-control.component.css']
})
export class ManagerControlComponent { }