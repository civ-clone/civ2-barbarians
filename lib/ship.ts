import { Game } from '@civ-clone/core-game';
import Naval from '@civ-clone/base-unit-type-naval/Naval';
import PendingEffect from '@civ-clone/core-pending-effect/PendingEffect';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
import { roleOf } from './units';

export type ShipGame = Pick<Game, 'pendingEffects' | 'units'>;

/**
 * A barbarian ship gives up once its count passes this (`ai_barbarian_unit_move`: `30 < counter`). The original raises
 *  the count each time its AI moves the ship, so once for each step it takes (and once on a turn it takes none): about
 *  a third as many turns as steps for a ship of 3 moves.
 */
export const SHIP_STEPS = 30;

/**
 * A barbarian ship gives up when fewer than this many units are on its square, itself included and the diplomacy role's
 *  (the leaders') left out (`unit_stack_sum(unit, 2) − unit_stack_count_role(unit, ROLE_DIPLOMACY) < 2`): once nothing
 *  but leaders is left aboard.
 */
export const SHIP_LEAST_STACK = 2;

/** `@UNITS`' diplomacy role (the Diplomat, the barbarians' leader). */
export const DIPLOMACY_ROLE = 6;

/**
 * The `PendingEffect` handler a barbarian ship's count is kept under (`count`, and whether it has acted this turn,
 *  `acted`), so a saved game counts on. Nothing discharges it: it's a record, removed with the ship.
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

const recordFor = (game: ShipGame, ship: Unit): PendingEffect => {
  const record = recordOf(game, ship);

  if (record !== null) {
    return record;
  }

  const created = new PendingEffect(SHIP_AT_SEA, ship, {
    count: '0',
    acted: '0',
  });

  game.pendingEffects.register(created);

  return created;
};

/** `ship`'s count so far: 0 before it has been counted. */
export const shipCount = (game: ShipGame, ship: Unit): number =>
  Number(recordOf(game, ship)?.data().count ?? 0);

/** Counts a step `ship` took (any action of its own, as each is a call of the original's `ai_barbarian_unit_move`). */
export const countStep = (game: ShipGame, ship: Unit): void => {
  const record = recordFor(game, ship);

  record.setData({ count: String(shipCount(game, ship) + 1), acted: '1' });
};

/**
 * As the barbarians' turn starts: a ship that took no step last turn is counted once for it, as the original's AI is
 *  still called for it once; then a new turn's steps are awaited. A ship seen for the first time starts at 0.
 */
export const countTurn = (game: ShipGame, ship: Unit): number => {
  const existing = recordOf(game, ship);

  if (existing === null) {
    recordFor(game, ship);

    return 0;
  }

  const count = shipCount(game, ship) + (existing.data().acted === '1' ? 0 : 1);

  existing.setData({ count: String(count), acted: '0' });

  return count;
};

/**
 * Whether a barbarian ship gives up as its turn starts (`ai_barbarian_unit_move`, `ai.cpp` 2192-2203): with nothing but
 *  leaders aboard (`SHIP_LEAST_STACK`), or once its count (`countTurn`) has reached `SHIP_STEPS`, as the original, which
 *  adds 1 and gives up past 30 on its next call, would on the first step of this turn. The original checks as each step
 *  is taken; here only as the turn starts, so a ship may finish the turn its count reaches 30 in. Counting changes the
 *  ship's record: ask once a turn.
 */
export const shipGivesUp = (game: ShipGame, ship: Carrier): boolean => {
  const count = countTurn(game, ship);

  return (
    game.units
      .getByTile(ship.tile())
      .filter(
        (unit: Unit): boolean => roleOf(unit.constructor) !== DIPLOMACY_ROLE
      ).length < SHIP_LEAST_STACK || count >= SHIP_STEPS
  );
};

/**
 * Takes `ship` off the map and forgets its record. What it carries goes as the rule set's rules for a destroyed ship say
 *  (lost at sea), as the original's `unit_destroy_redraw` leaves it to the unit's deletion.
 */
export const giveUp = (game: ShipGame, ship: Carrier): void => {
  const record = recordOf(game, ship);

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
