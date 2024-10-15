import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PokemonService } from '../services/pokemon.service';
import { TeamService } from '../services/team.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-team',
  templateUrl: './add-team.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class AddTeamComponent implements OnInit {
  teamForm!: FormGroup;
  pokemons: any[] = [];

  constructor(
    private fb: FormBuilder,
    private pokemonService: PokemonService,
    private teamService: TeamService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.teamForm = this.fb.group({
      team_name: ['', Validators.required],
      pokemon_ids: this.fb.array([], Validators.required)
    });


    this.pokemonService.getPokemons().subscribe({
      next: (data) => {
        this.pokemons = data;
      },
      error: (err) => {
        console.error('Error fetching Pokémon list', err);
      }
    });
  }


  get pokemonIds(): FormArray {
    return this.teamForm.get('pokemon_ids') as FormArray;
  }


  addPokemon(pokemonId: number): void {
    if (this.pokemonIds.length < 6) {
      this.pokemonIds.push(this.fb.control(pokemonId, Validators.required));
    } else {
      console.error('A team must contain exactly 6 Pokémon.');
    }
  }


  removePokemon(index: number): void {
    this.pokemonIds.removeAt(index);
  }

  onSubmit(): void {
    if (this.teamForm.valid && this.pokemonIds.length === 6) {
      const teamName = this.teamForm.get('team_name')?.value;
      const selectedPokemonIds = this.pokemonIds.value;
      this.teamService.addTeam(teamName, selectedPokemonIds).subscribe({
        next: (response) => {
          console.log('Team created successfully:', response);
          this.router.navigate(['/teams']);
        },
        error: (err) => {
          console.error('Error creating team:', err);
        }
      });
    } else {
      console.error('Form is invalid or the team does not contain exactly 6 Pokémon.');
    }
  }
}
