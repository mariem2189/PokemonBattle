import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pokemon } from './pokemon.service';

export interface Team {
  id: number;
  name: string;
  total_power: number;
  pokemons: Pokemon[];
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/teams`);
  }

  addTeam(teamName: string, pokemonIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/teams`, { name: teamName, pokemon_ids: pokemonIds });
  }

}