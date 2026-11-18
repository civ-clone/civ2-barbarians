import { Game } from '@civ-clone/core-game';
import Naval from '@civ-clone/base-unit-type-naval/Naval';
import PendingEffect from '@civ-clone/core-pending-effect/PendingEffect';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
import { roleOf } from './units';

export type ShipGame = Pick<Game, 'pendingEffects' | 'units'>;

/** A barbarian ship gives up after this many of its turns at sea (`ai_barbarian_unit_move`: `30 < counter`). */
export const SHIP_TURNS = 30;

/**
 * A barbarian ship gives up when fewer than this many units are on its square, itself included and the diplomacy role's
 *  (the leaders') left out (`unit_stack_sum(unit, 2) − unit_stack_count_role(unit, ROLE_DIPLOMACY) < 2`): once nothing
 *  but leaders is left aboard.
 */
export const SHIP_LEAST_STACK = 2;

/** `@UNITS`' diplomacy role (the Diplomat, the barbarians' leader). */
export const DIPLOMACY_ROLE = 6;

/**
 * The `PendingEffect` handler a barbarian ship's first turn is kept under, so a saved game counts on. Nothing
 *  discharges it: it's a record, removed with the ship.
 */
export const SHIP_AT_SEA = 'civ2-barbarians:ship-at-sea';

type Carrier = Unit & { cargo(): Unit[] };

/** Whether `unit` is a ship that carries units (the original's `hold`). */
export const isTransportShip = (unit: Unit): unit is Carrier =>
  unit instanceof Naval &&
  typeof (unit as Partial<Carrier>).cargo === 'function';

/** `player`'s ships that carry units. */
export const shipsOf = (game: ShipGame, player: Player): Carrier[] =>
  game.units
    .getByPlayer(player)
    .filter((unit: Unit): unit is Carrier => isTransportShip(unit));

const recordOf = (game: ShipGame, ship: Unit): PendingEffect | null =>
  game.pendingEffects
    .getByHandler(SHIP_AT_SEA)
    .find((record: PendingEffect): boolean => record.target() === ship) ?? null;

/**
 * Counts one more of `ship`'s turns at sea, as of `turn`, and returns how many it has had (the original's
 *  `units[].counter`, raised as the ship moves): 1 on its first.
 */
export const countTurnAtSea = (
  game: ShipGame,
  ship: Unit,
  turn: number
): number => {
  const record = recordOf(game, ship);

  if (record === null) {
    game.pendingEffects.register(
      new PendingEffect(SHIP_AT_SEA, ship, { since: String(turn) })
    );

    return 1;
  }

  return turn - Number(record.data().since) + 1;
};

/**
 * Whether a barbarian ship gives up this turn (`ai_barbarian_unit_move`, `ai.cpp` 2192-2203): with nothing but leaders
 *  aboard (`SHIP_LEAST_STACK`), or once it has been at sea more than 30 of its turns. The original destroys it there
 *  and then.
 */
export const shipGivesUp = (
  game: ShipGame,
  ship: Carrier,
  turn: number
): boolean =>
  game.units
    .getByTile(ship.tile())
    .filter(
      (unit: Unit): boolean => roleOf(unit.constructor) !== DIPLOMACY_ROLE
    ).length < SHIP_LEAST_STACK ||
  countTurnAtSea(game, ship, turn) > SHIP_TURNS;

/** Takes `ship` off the map, with whatever it carries, and forgets its record. */
export const giveUp = (game: ShipGame, ship: Carrier): void => {
  const record = recordOf(game, ship);

  [...ship.cargo()].forEach((unit: Unit): void => unit.destroy());
  ship.destroy();

  if (record !== null) {
    game.pendingEffects.unregister(record);
  }
};

/** Forgets the records of ships no longer on the map (sunk, or gone some other way). */
export const forgetLostShips = (game: ShipGame): void =>
  game.pendingEffects
    .getByHandler(SHIP_AT_SEA)
    .filter((record: PendingEffect): boolean => {
      const ship = record.target() as Unit | null;

      return ship === null || ship.destroyed();
    })
    .forEach((record: PendingEffect): void =>
      game.pendingEffects.unregister(record)
    );
