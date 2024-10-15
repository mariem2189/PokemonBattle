import { Component, OnInit } from '@angular/core';
import { Pokemon, PokemonService } from '../services/pokemon.service';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  standalone: true,
  imports: [NgFor]
})
export class PokemonListComponent implements OnInit {
  pokemons: Pokemon[] = [];


  constructor(private pokemonService: PokemonService, private router: Router) { }

  ngOnInit(): void {
    this.loadPokemons();
  }

  async loadPokemons() {
    this.pokemonService.getPokemons().subscribe((data: Pokemon[]) => {
      this.pokemons = data;
    });
  }
  editPokemon(id: number) {
    this.router.navigate([`/edit-pokemon/${id}`]);
  }
  deletePokemon(id: number) {
    this.pokemonService.deletePokemon(id).subscribe({
      next: () => {
        this.loadPokemons();
      },
      error: (err) => {
        console.error('Error deleting Pokemon:', err);
      }
    });
  }
}
