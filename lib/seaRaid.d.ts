import { KnowsDependencies } from './knows';
import { BarbarianPlayerGame } from './barbarianPlayer';
import Advance from '@civ-clone/core-science/Advance';
import { Game } from '@civ-clone/core-game';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
export type SeaRaidGame = BarbarianPlayerGame &
  KnowsDependencies &
  Pick<Game, 'engine' | 'rng' | 'rules' | 'unitImprovements' | 'units'>;
/** How many squares a raiding ship's sea must have (`water_body_size < 0x10` rejects it). */
export declare const RAID_WATER_BODY = 16;
/** How many squares the search draws before it gives up, and the uprising is skipped that turn. */
export declare const RAID_TRIES = 1000;
/** The rows a raiding ship may appear on: 3 from the top to 4 from the bottom (`rand % (height − 6) + 3`). */
export declare const RAID_EDGE_ROWS = 3;
/**
 * How many barbarians a raid brings, the leader among them (`barbarians_sea_raid`, `game.cpp` 1497-1501):
 *  n = clamp(turn ÷ (250 − 50a) + 1, 1, 5), then n + 1, or n + 2 at a = 3.
 */
export declare const raidHorde: (activity: number, turn: number) => number;
/** What anyone, and what a person, knows: the raids' units follow both. */
export type Known = {
  anyone: (AdvanceType: typeof Advance) => boolean;
  person: (AdvanceType: typeof Advance) => boolean;
};
export declare const known: (game: KnowsDependencies) => Known;
/** The ship: a Trireme, a Caravel once anyone knows Navigation, a Frigate once anyone knows Magnetism. */
export declare const raidShip: (knows: Known) => typeof Unit;
/**
 * The escorts' type (`game.cpp` 1508-1523, the full roster): Archers; the Legion once a person knows Iron Working;
 *  Knights once anyone knows Metallurgy, or Chivalry at a = 3, and Crusaders instead on an odd row (the original's odd
 *  x); Dragoons once a person knows Tactics.
 */
export declare const raidEscort: (
  knows: Known,
  activity: number,
  oddRow: boolean
) => typeof Unit;
/** The horde aboard, in the order the original makes it: the leader first when there is more than one, then escorts. */
export declare const raidUnits: (
  count: number,
  Escort: typeof Unit
) => (typeof Unit)[];
/**
 * The square a raiding ship appears on (`barbarians_sea_raid`, `game.cpp` 1468-1495): up to `RAID_TRIES` squares drawn
 *  in the original's coordinates, on rows 3 to height − 4, each an empty square of a sea of at least 16. `null` when
 *  none is found: the draw after the last is made and not looked at, as in the original.
 */
export declare const raidSite: (
  world: World,
  rand: () => number,
  empty: (tile: Tile) => boolean
) => Tile | null;
/**
 * A raid from the sea (`barbarians_sea_raid`): a ship on `raidSite`'s square with `raidHorde` barbarians aboard, the
 *  ship a veteran on an even draw. Emits `barbarians:raiders-at-sea` (player, ship, tile). Returns `false` when no
 *  square was found, so the turn's uprising is skipped, as the original returns from `game_spawn_barbarians` then.
 */
export declare const seaRaid: (
  game: SeaRaidGame,
  world: World,
  activity: number,
  turn: number
) => boolean;
export default seaRaid;
