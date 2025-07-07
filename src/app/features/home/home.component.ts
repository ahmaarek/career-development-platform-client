import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { RouterOutlet } from '@angular/router';
import { LeaderboardComponent } from '../learning/score/leaderboard/leaderboard.component';
import { MapComponent } from './map/map.component';

@Component({
  selector: 'app-home',
  imports: [LeaderboardComponent, MapComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
