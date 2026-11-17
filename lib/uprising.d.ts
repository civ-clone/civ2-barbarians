import { KnowsDependencies } from './knows';
import { RanksGame } from './ranks';
import { BarbarianPlayerGame } from './barbarianPlayer';
import City from '@civ-clone/core-city/City';
import { Game } from '@civ-clone/core-game';
import Government from '@civ-clone/core-government/Government';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
export type UprisingGame = BarbarianPlayerGame &
  KnowsDependencies &
  RanksGame &
  Pick<
    Game,
    | 'cities'
    | 'cityGrowth'
    | 'engine'
    | 'landMasses'
    | 'playerTreasuries'
    | 'rng'
    | 'rules'
    | 'unitImprovements'
    | 'units'
  >;
/** An uprising's square is at least this far from the nearest city (`nearest_city_dist < 5` rejects it). */
export declare const UPRISING_CITY_DISTANCE = 5;
/** Each activity level gives the search this many tries (`a × 50`). */
export declare const UPRISING_TRIES = 50;
/**
 * What an uprising goes by, so that a rule set that corrects the original's choices can pass its own
 *  (`CLASSIC_UPRISING` is the original's):
 * - `xOffset`: the square's offset east, in the original's half columns, from a draw of 0 to 12 (the offset north is
 *   the draw − 6);
 * - `byRolledCity`: `false` as the original, where each try is centred on, the square must share a land mass with, and
 *   the horde is sized and named by, the city nearest the last try (so possibly a computer player's); `true` for the
 *   city that was drawn, every time;
 * - `dropped`: called with the city drawn when no square is found, which the original says nothing about;
 * - `strongestHumanGovernment`: the government that decides between Partisans and Fanatics once Guerrilla Warfare is
 *   known; the original's reads a power rank as a civilization number (`rankAsNumberGovernment`).
 */
export type UprisingOptions = {
  xOffset: (roll: number) => number;
  byRolledCity: boolean;
  dropped: ((city: City) => void) | null;
  strongestHumanGovernment: (game: RanksGame) => Government | null;
};
export declare const CLASSIC_UPRISING: UprisingOptions;
/**
 * How many barbarians rise besides the leader (`barbarians_city_uprising`, `game.cpp` 1318-1340), from the city's
 *  `size`, drawing from `rand` (C's `rand()`) as the original does: `rand % size` (0 at size 1); at a = 3 after turn
 *  149, one time in 10 − level, size ÷ 2 + `rand % (size ÷ 2)` more; at least 2 and at most 99.
 */
export declare const uprisingHorde: (
  size: number,
  activity: number,
  level: number,
  turn: number,
  rand: () => number
) => number;
/** What an uprising's units follow: what anyone knows, and who holds the city. */
export type UprisingKnowledge = {
  gunpowder: boolean;
  industrialization: boolean;
  armorAdvance: boolean;
  guerrillaWarfare: boolean;
  belowRepublic: boolean;
  captured: boolean;
};
/**
 * The two types an uprising alternates in fours, `[main, alternate]` (`game.cpp` 1342-1381, the full roster): Chariots
 *  and Horsemen, swapped when `swap` (one time in 3); Archers and Elephants once anyone knows Gunpowder; Cannon and
 *  Musketeers with Industrialization; with Armor's advance as well, Artillery and Riflemen; and with Guerrilla Warfare,
 *  Cavalry and Partisans, or Artillery and Fanatics for a Republic or a Democracy holding the city its owner founded.
 */
export declare const uprisingTypes: (
  knows: UprisingKnowledge,
  swap: boolean
) => [typeof Unit, typeof Unit];
/**
 * The units of an uprising of `horde` (`game.cpp` 1382-1397): `horde` + 1 of them, counted down from `horde`, the first
 *  the leader (a Diplomat), then `main` while the count has its 4 bit set and `alternate` otherwise.
 */
export declare const uprisingUnits: (
  horde: number,
  main: typeof Unit,
  alternate: typeof Unit
) => (typeof Unit)[];
/**
 * Where an uprising near `city` breaks out (`game.cpp` 1293-1316), drawing from `rand`: up to `activity` × 50 tries, the
 *  last never looked at, each a square drawn within the original's 13 × 13 box (`options.xOffset` east, −6 to 6
 *  north) round the city, in bounds, at least 5 from the nearest city, with no civilization's unit next to it, on land
 *  with no units, on the same land mass as the city. With `byRolledCity` false each try finds the city nearest it, and
 *  the next is drawn round that city. Returns the square and the city the horde is sized by, or `null`: no square, or
 *  no city at all (which the original gives up on at once).
 */
export declare const uprisingSite: (
  game: Pick<Game, 'cities' | 'landMasses' | 'units'>,
  city: City,
  activity: number,
  rand: () => number,
  options?: UprisingOptions
) => {
  tile: Tile;
  city: City;
} | null;
/**
 * What decides an uprising's units, for `city` (the city the horde is sized by).
 */
export declare const uprisingKnowledge: (
  game: UprisingGame,
  city: City,
  options?: UprisingOptions
) => UprisingKnowledge;
/**
 * An uprising near `city` (`barbarians_city_uprising`, `game.cpp` 1274): with a chance of the city's gold share
 *  (`cityGold`) in 100, a square found by `uprisingSite`, and `uprisingHorde` + 1 barbarians on it, sized by the city
 *  the site went by, Fanatics veterans. Emits `barbarians:uprising` (player, city, tile, industrial). Draws from the
 *  game's generator in the original's order.
 */
export declare const landUprising: (
  game: UprisingGame,
  city: City,
  activity: number,
  level: number,
  turn: number,
  options?: UprisingOptions
) => void;
/**
 * The city a turn's uprising is drawn for (`game.cpp` 1595-1601): one of the standing cities, `rand % cities` (no draw
 *  for one or none), and only if a person plays its owner. `null` otherwise.
 */
export declare const uprisingCity: (
  game: Pick<Game, 'cities' | 'clients'>,
  rand: () => number
) => City | null;
export default landUprising;
