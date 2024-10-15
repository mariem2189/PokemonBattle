import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'; 
import { Pokemon, PokemonService } from '../services/pokemon.service';

@Component({
  selector: 'app-edit-pokemon',
  templateUrl: './edit-pokemon.component.html',
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class EditPokemonComponent implements OnInit {
  pokemonForm!: FormGroup;
  pokemonId!: number; 

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.pokemonId = +this.route.snapshot.paramMap.get('id')!; 

    this.pokemonForm = this.fb.group({
      name: ['', Validators.required],
      type_id: ['', Validators.required],
      image: ['', Validators.required],
      power: ['', Validators.required],
      life: ['', Validators.required],
    });
    this.loadPokemonData();
  }

  loadPokemonData(): void {
    this.pokemonService.getPokemonById(this.pokemonId).subscribe({
      next: (data: Pokemon) => {
        this.pokemonForm.patchValue({
          name: data.name,
          type_id: data.type_id,
          image: data.image,
          power: data.power,
          life: data.life
        });
      },
      error: (err) => {
        console.error('Error fetching Pokémon data', err);
      }
    });
  }

  onSubmit(): void {
    if (this.pokemonForm.valid) {
      this.pokemonService.updatePokemon(this.pokemonId, this.pokemonForm.value).subscribe({
        next: (response) => {
        },
        error: (err) => {
          console.error('Error updating Pokémon', err);
        }
      });
    }
  }
}
