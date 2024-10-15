import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pokemon {
    id: number;
    name: string;
    type_id: number;
    image: string;
    power: number;
    life: number;
}

@Injectable({
    providedIn: 'root'
})
export class PokemonService {
    private apiUrl = 'http://localhost:3000/api';

    constructor(private http: HttpClient) { }

    getPokemons(): Observable<Pokemon[]> {
        return this.http.get<Pokemon[]>(`${this.apiUrl}/pokemons`);
    }

    getPokemonById(id: number): Observable<Pokemon> {
        return this.http.get<Pokemon>(`${this.apiUrl}/pokemons/${id}`);
    }

    updatePokemon(id: number, data: Partial<Pokemon>): Observable<any> {
        return this.http.put(`${this.apiUrl}/pokemons/${id}`, data);
    }

    deletePokemon(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/pokemons/${id}`);
    }

}