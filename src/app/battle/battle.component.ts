import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PokemonService } from '../services/pokemon.service';

@Component({
  selector: 'app-battle',
  templateUrl: './battle.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [],
})
export class BattleComponent implements OnInit {
  battleForm!: FormGroup;
  result: { winner: string; details: string[] } | null = null;

  constructor(private fb: FormBuilder, private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.battleForm = this.fb.group({
      teamA: ['', Validators.required],
      teamB: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.battleForm.valid) {
      this.pokemonService.getPokemons().subscribe(pokemons => {
        console.log(pokemons);
      });

      this.result = {
        winner: 'Team A',
        details: ['Team A won due to higher speed.', 'Team B put up a good fight.'],
      };
    }
  }
}
