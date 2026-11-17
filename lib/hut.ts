import {
  Cavalry,
  Fanatic,
  Horseman,
  Knight,
  Musketman,
  Partisan,
  Rifleman,
  Swordman,
} from '@civ-clone/civ2-unit/Units';
import { GuerrillaWarfare, Metallurgy } from '@civ-clone/civ2-science/Advances';
import barbarianPlayer, { BarbarianPlayerGame } from './barbarianPlayer';
import { nearestCity, step } from './grid';
import City from '@civ-clone/core-city/City';
import { Game } from '@civ-clone/core-game';
import { KnowsDependencies } from './knows';
import Player from '@civ-clone/core-player/Player';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import { anyoneKnows } from './knows';
import { armorAdvance } from './units';
import { cRand } from '@civ-clone/civ2-science/lib/pickResearch';
import { cachedTerrainLookup } from '@civ-clone/base-terrain-properties/lib/terrainTable';
import { movementCost } from '@civ-clone/civ2-world/lib/terrainProperties';
import spawnUnits from '@civ-clone/base-barbarians/lib/spawnUnits';

export type HutGame = BarbarianPlayerGame &
  KnowsDependencies &
  Pick<Game, 'cities' | 'landMasses' | 'rng' | 'rules' | 'units'>;

/** Before this turn, below a = 3, a hut never releases barbarians near a city of the player's own (`turn < 30`). */
export const HUT_SAFE_UNTIL = 30;

/** Before this turn, below a = 3, a hut doesn't on a coin flip (`turn < 50`). */
export const HUT_SAFE_ON_A_FLIP_UNTIL = 50;

/** Near means on the hut's land mass, and less than this far from the player's nearest city. */
export const HUT_SAFE_DISTANCE = 24;

/** Up to this turn, one barbarian only (`turn <= 49`); up to `HUT_SINGLE_ON_A_FLIP_UNTIL`, on a coin flip. */
export const HUT_SINGLE_UNTIL = 49;
export const HUT_SINGLE_ON_A_FLIP_UNTIL = 74;

const terrainMovementCost = cachedTerrainLookup(movementCost);

/** Whether `terrain` is rough for a hut's barbarians: a movement cost of 3 or more. */
export const rough = (terrain: Terrain): boolean =>
  (terrainMovementCost(terrain) ?? 1) >= 3;

/** What anyone knows that decides a hut's barbarians. */
export type HutKnowledge = {
  metallurgy: boolean;
  armorAdvance: boolean;
  guerrillaWarfare: boolean;
};

/**
 * A hut's barbarian for a square (`hut_barbarians`, `retvals.cpp` 1719-1735): on rough ground (a movement cost of 3 or
 *  more) the Legion, Musketeers once anyone knows Metallurgy, Riflemen with Armor's advance, Fanatics with Guerrilla
 *  Warfare; elsewhere Horsemen, Knights, Cavalry or Partisans.
 */
export const hutUnit = (knows: HutKnowledge, isRough: boolean): typeof Unit => {
  let Rough: typeof Unit = Swordman,
    Flat: typeof Unit = Horseman;

  if (knows.metallurgy) {
    Rough = Musketman;
    Flat = Knight;
  }

  if (knows.armorAdvance) {
    Rough = Rifleman;
    Flat = Cavalry;
  }

  if (knows.guerrillaWarfare) {
    Rough = Fanatic;
    Flat = Partisan;
  }

  return isRough ? Rough : Flat;
};

/**
 * Whether the hut is safe (`retvals.cpp` 1680-1693): below a = 3, before turn 30, or before turn 50 on an even draw (the
 *  draw made only then), the player has a city on the hut's land mass and its nearest city is less than 24 away.
 */
export const hutSafe = (
  game: Pick<HutGame, 'cities' | 'landMasses'>,
  hut: Tile,
  player: Player,
  activity: number,
  turn: number,
  rand: () => number
): boolean => {
  if (
    activity >= 3 ||
    !(
      turn < HUT_SAFE_UNTIL ||
      (turn < HUT_SAFE_ON_A_FLIP_UNTIL && (rand() & 1) === 0)
    )
  ) {
    return false;
  }

  const own = game.cities
      .getByPlayer(player)
      .filter((city: City): boolean => !city.destroyed()),
    landMass = game.landMasses.getByTile(hut),
    nearest = nearestCity(hut, own);

  return (
    own.some(
      (city: City): boolean =>
        landMass !== null && game.landMasses.getByTile(city.tile()) === landMass
    ) &&
    nearest !== null &&
    nearest.distance < HUT_SAFE_DISTANCE
  );
};

/**
 * The squares a hut's barbarians stand on, with their order (`retvals.cpp` 1704-1747): the original's directions from
 *  `turn` mod 8, stepping by clamp(4 − the player's cities, 1, 4) up to 8, each a square on the map with no unit, no
 *  city and no sea. Only the first when `single`.
 */
export const hutSquares = (
  hut: Tile,
  turn: number,
  cities: number,
  single: boolean,
  free: (tile: Tile) => boolean
): Tile[] => {
  const squares: Tile[] = [],
    stride = Math.min(Math.max(4 - cities, 1), 4);

  for (let index = 0; index <= 7; index += stride) {
    const tile = step(hut, (turn + index) & 7);

    if (tile === null || tile.isWater() || !free(tile)) {
      continue;
    }

    squares.push(tile);

    if (single) {
      break;
    }
  }

  return squares;
};

/**
 * The barbarians a hut entered by `unit` releases (`hut_barbarians`), whatever the activity level: none when
 *  `hutSafe`; otherwise one up to turn 49, and up to turn 74 on an even draw, else one on each of `hutSquares`. Returns
 *  the units.
 */
export const hutBarbarians = (
  game: HutGame,
  hut: Tile,
  unit: Unit,
  activity: number,
  turn: number
): Unit[] => {
  const rand = (): number => cRand(game.rng),
    player = unit.player();

  if (hutSafe(game, hut, player, activity, turn, rand)) {
    return [];
  }

  const single =
      turn <= HUT_SINGLE_UNTIL ||
      (turn <= HUT_SINGLE_ON_A_FLIP_UNTIL && (rand() & 1) === 0),
    knows: HutKnowledge = {
      metallurgy: anyoneKnows(game, Metallurgy),
      armorAdvance: anyoneKnows(game, armorAdvance()),
      guerrillaWarfare: anyoneKnows(game, GuerrillaWarfare),
    },
    squares = hutSquares(
      hut,
      turn,
      game.cities
        .getByPlayer(player)
        .filter((city: City): boolean => !city.destroyed()).length,
      single,
      (tile: Tile): boolean =>
        game.units.getByTile(tile).length === 0 &&
        game.cities.getByTile(tile) === null
    );

  if (squares.length === 0) {
    return [];
  }

  const barbarians = barbarianPlayer(game, hut.map());

  return squares.flatMap((tile: Tile): Unit[] =>
    spawnUnits(
      barbarians,
      tile,
      [hutUnit(knows, rough(tile.terrain()))],
      game.rules
    )
  );
};

export default hutBarbarians;
