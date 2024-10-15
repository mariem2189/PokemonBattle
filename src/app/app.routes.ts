import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PokemonListComponent } from './pokemon-list/pokemon-list.component';
import { EditPokemonComponent } from './edit-pokemon/edit-pokemon.component';
import { AddTeamComponent } from './add-team/add-team.component';
import { BattleComponent } from './battle/battle.component';

export const routes: Routes = [
  { path: 'pokemons', component: PokemonListComponent },
  { path: 'edit-pokemon/:id', component: EditPokemonComponent },
  { path: 'add-team', component: AddTeamComponent },
  { path: 'battle', component: BattleComponent },
  { path: '', redirectTo: '/pokemons', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }