import { BarbarianPlayerGame } from './barbarianPlayer';
import { Game } from '@civ-clone/core-game';
import { KnowsDependencies } from './knows';
import Player from '@civ-clone/core-player/Player';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
export type HutGame = BarbarianPlayerGame &
  KnowsDependencies &
  Pick<Game, 'cities' | 'landMasses' | 'rng' | 'rules' | 'units'>;
/** Before this turn, below a = 3, a hut never releases barbarians near a city of the player's own (`turn < 30`). */
export declare const HUT_SAFE_UNTIL = 30;
/** Before this turn, below a = 3, a hut doesn't on a coin flip (`turn < 50`). */
export declare const HUT_SAFE_ON_A_FLIP_UNTIL = 50;
/** Near means on the hut's land mass, and less than this far from the player's nearest city. */
export declare const HUT_SAFE_DISTANCE = 24;
/** Up to this turn, one barbarian only (`turn <= 49`); up to `HUT_SINGLE_ON_A_FLIP_UNTIL`, on a coin flip. */
export declare const HUT_SINGLE_UNTIL = 49;
export declare const HUT_SINGLE_ON_A_FLIP_UNTIL = 74;
/** Whether `terrain` is rough for a hut's barbarians: a movement cost of 3 or more. */
export declare const rough: (terrain: Terrain) => boolean;
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
export declare const hutUnit: (
  knows: HutKnowledge,
  isRough: boolean
) => typeof Unit;
/**
 * Whether the hut is safe (`retvals.cpp` 1680-1693): below a = 3, before turn 30, or before turn 50 on an even draw (the
 *  draw made only then), the player has a city on the hut's land mass and its nearest city is less than 24 away.
 */
export declare const hutSafe: (
  game: Pick<HutGame, 'cities' | 'landMasses'>,
  hut: Tile,
  player: Player,
  activity: number,
  turn: number,
  rand: () => number
) => boolean;
/**
 * The squares a hut's barbarians stand on, with their order (`retvals.cpp` 1704-1747): the original's directions from
 *  `turn` mod 8, stepping by clamp(4 − the player's cities, 1, 4) up to 8, each a square on the map with no unit, no
 *  city and no sea. Only the first when `single`.
 */
export declare const hutSquares: (
  hut: Tile,
  turn: number,
  cities: number,
  single: boolean,
  free: (tile: Tile) => boolean
) => Tile[];
/**
 * The barbarians a hut entered by `unit` releases (`hut_barbarians`), whatever the activity level: none when
 *  `hutSafe`; otherwise one up to turn 49, and up to turn 74 on an even draw, else one on each of `hutSquares`. Returns
 *  the units.
 */
export declare const hutBarbarians: (
  game: HutGame,
  hut: Tile,
  unit: Unit,
  activity: number,
  turn: number
) => Unit[];
export default hutBarbarians;
