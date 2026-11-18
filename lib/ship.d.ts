import { Game } from '@civ-clone/core-game';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
export type ShipGame = Pick<Game, 'pendingEffects' | 'units'>;
/** A barbarian ship gives up after this many of its turns at sea (`ai_barbarian_unit_move`: `30 < counter`). */
export declare const SHIP_TURNS = 30;
/**
 * A barbarian ship gives up when fewer than this many units are on its square, itself included and the diplomacy role's
 *  (the leaders') left out (`unit_stack_sum(unit, 2) − unit_stack_count_role(unit, ROLE_DIPLOMACY) < 2`): once nothing
 *  but leaders is left aboard.
 */
export declare const SHIP_LEAST_STACK = 2;
/** `@UNITS`' diplomacy role (the Diplomat, the barbarians' leader). */
export declare const DIPLOMACY_ROLE = 6;
/**
 * The `PendingEffect` handler a barbarian ship's first turn is kept under, so a saved game counts on. Nothing
 *  discharges it: it's a record, removed with the ship.
 */
export declare const SHIP_AT_SEA = 'civ2-barbarians:ship-at-sea';
type Carrier = Unit & {
  cargo(): Unit[];
};
/** Whether `unit` is a ship that carries units (the original's `hold`). */
export declare const isTransportShip: (unit: Unit) => unit is Carrier;
/** `player`'s ships that carry units. */
export declare const shipsOf: (game: ShipGame, player: Player) => Carrier[];
/**
 * Counts one more of `ship`'s turns at sea, as of `turn`, and returns how many it has had (the original's
 *  `units[].counter`, raised as the ship moves): 1 on its first.
 */
export declare const countTurnAtSea: (
  game: ShipGame,
  ship: Unit,
  turn: number
) => number;
/**
 * Whether a barbarian ship gives up this turn (`ai_barbarian_unit_move`, `ai.cpp` 2192-2203): with nothing but leaders
 *  aboard (`SHIP_LEAST_STACK`), or once it has been at sea more than 30 of its turns. The original destroys it there
 *  and then.
 */
export declare const shipGivesUp: (
  game: ShipGame,
  ship: Carrier,
  turn: number
) => boolean;
/** Takes `ship` off the map, with whatever it carries, and forgets its record. */
export declare const giveUp: (game: ShipGame, ship: Carrier) => void;
/** Forgets the records of ships no longer on the map (sunk, or gone some other way). */
export declare const forgetLostShips: (game: ShipGame) => void;
export {};
