require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/api/pokemons', async (req, res) => {
  try {
    const { data, error } = await supabase.from('pokemon').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/api/pokemons/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('pokemon').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Pokemon not found' });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.put('/api/pokemons/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type_id, image, power, life } = req.body;

  try {
    const { data, error } = await supabase
      .from('pokemon')
      .update({ name, type_id, image, power, life })
      .eq('id', id)
      .select();

    if (error) {
      if (error.code === 'PGRST301') {
        return res.status(404).json({ message: 'Pokemon not found' });
      }
      console.error(error);
      return res.status(500).json({ message: 'Server Error', error });
    }

    if (data.length === 0) {
      return res.status(404).json({ message: 'Pokemon not found' });
    }

    res.json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
app.post('/api/pokemons', async (req, res) => {
  const { name, type_id, image, power, life } = req.body;
  try {
    const { data, error } = await supabase
      .from('pokemon')
      .insert([{ name, type_id, image, power, life }])
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/api/teams', async (req, res) => {
  const { name, pokemons } = req.body;

  if (!name || !pokemons || !Array.isArray(pokemons) || pokemons.length !== 6) {
    return res.status(400).json({ message: 'A team must contain a name and exactly 6 Pokémon IDs' });
  }

  const client = supabase;
  try {
    const { data: teamData, error: teamError } = await client
      .from('team')
      .insert([{ name }])
      .select('id')
      .single();
    if (teamError) throw teamError;
    const teamId = teamData.id;
    const teamPokemonEntries = pokemons.map(pokemonId => ({
      team_id: teamId,
      pokemon_id: pokemonId
    }));
    const { data: teamPokemonData, error: teamPokemonError } = await client
      .from('team_pokemon')
      .insert(teamPokemonEntries);
    if (teamPokemonError) throw teamPokemonError;
    res.status(201).json({
      message: 'Team created successfully',
      team: teamData,
      pokemons: teamPokemonData
    });
  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).send('Server Error');
  }
});
app.get('/api/teams', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_all_teams_ordered');

    if (error) {
      console.error('Error fetching teams:', error);
      return res.status(500).send('Server Error');
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
app.post('/api/battle', async (req, res) => {
  const { team1_id, team2_id } = req.body;
  try {
    const { data: team1Pokemons, error: team1Error } = await supabase
      .from('team_pokemon')
      .select('pokemon_id, pokemon(name, type_id, power, life)')
      .eq('team_id', team1_id)
      .order('power', { ascending: false });
    if (team1Error) throw team1Error;
    const { data: team2Pokemons, error: team2Error } = await supabase
      .from('team_pokemon')
      .select('pokemon_id, pokemon(name, type_id, power, life)')
      .eq('team_id', team2_id)
      .order('power', { ascending: false });
    if (team2Error) throw team2Error;
    let team1Index = 0;
    let team2Index = 0;
    let battleLog = [];
    while (team1Index < team1Pokemons.length && team2Index < team2Pokemons.length) {
      let p1 = { ...team1Pokemons[team1Index].pokemon };
      let p2 = { ...team2Pokemons[team2Index].pokemon };
      battleLog.push(`Battle between ${p1.name} (Team 1) and ${p2.name} (Team 2)`);
      let round = 1;
      while (p1.life > 0 && p2.life > 0) {
        const { data: weakness1, error: weaknessError1 } = await supabase
          .from('weakness')
          .select('factor')
          .eq('type1_id', p1.type_id)
          .eq('type2_id', p2.type_id)
          .single();
        if (weaknessError1) throw weaknessError1;
        let factor1 = weakness1 ? weakness1.factor : 1;
        const { data: weakness2, error: weaknessError2 } = await supabase
          .from('weakness')
          .select('factor')
          .eq('type1_id', p2.type_id)
          .eq('type2_id', p1.type_id)
          .single();
        if (weaknessError2) throw weaknessError2;
        let factor2 = weakness2 ? weakness2.factor : 1;
        let damageToP1 = p2.power * factor2;
        let damageToP2 = p1.power * factor1;
        p1.life -= damageToP1;
        p2.life -= damageToP2;
        battleLog.push(`Round ${round}: ${p1.name} life = ${p1.life}, ${p2.name} life = ${p2.life}`);
        round++;
      }
      if (p1.life > 0) {
        battleLog.push(`${p1.name} from Team 1 wins the battle.`);
        team2Index++;
      } else if (p2.life > 0) {
        battleLog.push(`${p2.name} from Team 2 wins the battle.`);
        team1Index++;
      } else {
        battleLog.push(`Both ${p1.name} and ${p2.name} have fainted.`);
        team1Index++;
        team2Index++;
      }
    }
    if (team1Index < team1Pokemons.length) {
      battleLog.push('Team 1 wins the battle!');
      res.json({ winner: 'Team 1', details: battleLog });
    } else if (team2Index < team2Pokemons.length) {
      battleLog.push('Team 2 wins the battle!');
      res.json({ winner: 'Team 2', details: battleLog });
    } else {
      battleLog.push('The battle ended in a draw.');
      res.json({ winner: 'Draw', details: battleLog });
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});