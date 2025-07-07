import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RankConfig } from '../models/rank-config.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RankConfigService {

  private apiUrl = environment.learningServiceBaseUrl + '/ranks';

  constructor(private http: HttpClient) {}

  getAllRanks(): Observable<RankConfig[]> {
    return this.http.get<RankConfig[]>(this.apiUrl);
  }

  replaceAllRanks(ranks: RankConfig[]): Observable<void> {
    return this.http.put<void>(this.apiUrl, ranks);
  }
}
