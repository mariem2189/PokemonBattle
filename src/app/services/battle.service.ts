import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BattleResult {
  winner: string;
  details: any;
}

@Injectable({
  providedIn: 'root'
})
export class BattleService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  battleTeams(team1_id: number, team2_id: number): Observable<BattleResult> {
    return this.http.post<BattleResult>(`${this.apiUrl}/battle`, { team1_id, team2_id });
  }
}