import { Game } from '@civ-clone/core-game';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
export type ShipGame = Pick<Game, 'pendingEffects' | 'units'>;
/**
 * A barbarian ship gives up once its count passes this (`ai_barbarian_unit_move`: `30 < counter`). The original raises
 *  the count each time its AI moves the ship, so once for each step it takes (and once on a turn it takes none): about
 *  a third as many turns as steps for a ship of 3 moves.
 */
export declare const SHIP_STEPS = 30;
/**
 * A barbarian ship gives up when fewer than this many units are on its square, itself included and the diplomacy role's
 *  (the leaders') left out (`unit_stack_sum(unit, 2) − unit_stack_count_role(unit, ROLE_DIPLOMACY) < 2`): once nothing
 *  but leaders is left aboard.
 */
export declare const SHIP_LEAST_STACK = 2;
/** `@UNITS`' diplomacy role (the Diplomat, the barbarians' leader). */
export declare const DIPLOMACY_ROLE = 6;
/**
 * The `PendingEffect` handler a barbarian ship's count is kept under (`count`, and whether it has acted this turn,
 *  `acted`), so a saved game counts on. Nothing discharges it: it's a record, removed with the ship.
 */
export declare const SHIP_AT_SEA = 'civ2-barbarians:ship-at-sea';
type Carrier = Unit & {
  cargo(): Unit[];
};
/** Whether `unit` is a ship that carries units (the original's `hold`). */
export declare const isTransportShip: (unit: Unit) => unit is Carrier;
/** `player`'s ships that carry units. */
export declare const shipsOf: (game: ShipGame, player: Player) => Carrier[];
/** `ship`'s count so far: 0 before it has been counted. */
export declare const shipCount: (game: ShipGame, ship: Unit) => number;
/** Counts a step `ship` took (any action of its own, as each is a call of the original's `ai_barbarian_unit_move`). */
export declare const countStep: (game: ShipGame, ship: Unit) => void;
/**
 * As the barbarians' turn starts: a ship that took no step last turn is counted once for it, as the original's AI is
 *  still called for it once; then a new turn's steps are awaited. A ship seen for the first time starts at 0.
 */
export declare const countTurn: (game: ShipGame, ship: Unit) => number;
/**
 * Whether a barbarian ship gives up as its turn starts (`ai_barbarian_unit_move`, `ai.cpp` 2192-2203): with nothing but
 *  leaders aboard (`SHIP_LEAST_STACK`), or once its count (`countTurn`) is past `SHIP_STEPS`. The original checks as
 *  each step is taken; here only as the turn starts, so a ship may finish the turn it passes 30 in.
 */
export declare const shipGivesUp: (game: ShipGame, ship: Carrier) => boolean;
/** Takes `ship` off the map, with whatever it carries, and forgets its record. */
export declare const giveUp: (game: ShipGame, ship: Carrier) => void;
/** Forgets the records of ships no longer on the map (sunk, or gone some other way). */
export declare const forgetLostShips: (game: ShipGame) => void;
export {};
