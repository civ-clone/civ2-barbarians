"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgetLostShips = exports.giveUp = exports.shipGivesUp = exports.countTurnAtSea = exports.shipsOf = exports.isTransportShip = exports.SHIP_AT_SEA = exports.DIPLOMACY_ROLE = exports.SHIP_LEAST_STACK = exports.SHIP_TURNS = void 0;
const Naval_1 = require("@civ-clone/base-unit-type-naval/Naval");
const PendingEffect_1 = require("@civ-clone/core-pending-effect/PendingEffect");
const units_1 = require("./units");
/** A barbarian ship gives up after this many of its turns at sea (`ai_barbarian_unit_move`: `30 < counter`). */
exports.SHIP_TURNS = 30;
/**
 * A barbarian ship gives up when fewer than this many units are on its square, itself included and the diplomacy role's
 *  (the leaders') left out (`unit_stack_sum(unit, 2) − unit_stack_count_role(unit, ROLE_DIPLOMACY) < 2`): once nothing
 *  but leaders is left aboard.
 */
exports.SHIP_LEAST_STACK = 2;
/** `@UNITS`' diplomacy role (the Diplomat, the barbarians' leader). */
exports.DIPLOMACY_ROLE = 6;
/**
 * The `PendingEffect` handler a barbarian ship's first turn is kept under, so a saved game counts on. Nothing
 *  discharges it: it's a record, removed with the ship.
 */
exports.SHIP_AT_SEA = 'civ2-barbarians:ship-at-sea';
/** Whether `unit` is a ship that carries units (the original's `hold`). */
const isTransportShip = (unit) => unit instanceof Naval_1.default &&
    typeof unit.cargo === 'function';
exports.isTransportShip = isTransportShip;
/** `player`'s ships that carry units. */
const shipsOf = (game, player) => game.units
    .getByPlayer(player)
    .filter((unit) => (0, exports.isTransportShip)(unit));
exports.shipsOf = shipsOf;
const recordOf = (game, ship) => {
    var _a;
    return (_a = game.pendingEffects
        .getByHandler(exports.SHIP_AT_SEA)
        .find((record) => record.target() === ship)) !== null && _a !== void 0 ? _a : null;
};
/**
 * Counts one more of `ship`'s turns at sea, as of `turn`, and returns how many it has had (the original's
 *  `units[].counter`, raised as the ship moves): 1 on its first.
 */
const countTurnAtSea = (game, ship, turn) => {
    const record = recordOf(game, ship);
    if (record === null) {
        game.pendingEffects.register(new PendingEffect_1.default(exports.SHIP_AT_SEA, ship, { since: String(turn) }));
        return 1;
    }
    return turn - Number(record.data().since) + 1;
};
exports.countTurnAtSea = countTurnAtSea;
/**
 * Whether a barbarian ship gives up this turn (`ai_barbarian_unit_move`, `ai.cpp` 2192-2203): with nothing but leaders
 *  aboard (`SHIP_LEAST_STACK`), or once it has been at sea more than 30 of its turns. The original destroys it there
 *  and then.
 */
const shipGivesUp = (game, ship, turn) => game.units
    .getByTile(ship.tile())
    .filter((unit) => (0, units_1.roleOf)(unit.constructor) !== exports.DIPLOMACY_ROLE).length < exports.SHIP_LEAST_STACK ||
    (0, exports.countTurnAtSea)(game, ship, turn) > exports.SHIP_TURNS;
exports.shipGivesUp = shipGivesUp;
/** Takes `ship` off the map, with whatever it carries, and forgets its record. */
const giveUp = (game, ship) => {
    const record = recordOf(game, ship);
    [...ship.cargo()].forEach((unit) => unit.destroy());
    ship.destroy();
    if (record !== null) {
        game.pendingEffects.unregister(record);
    }
};
exports.giveUp = giveUp;
/** Forgets the records of ships no longer on the map (sunk, or gone some other way). */
const forgetLostShips = (game) => game.pendingEffects
    .getByHandler(exports.SHIP_AT_SEA)
    .filter((record) => {
    const ship = record.target();
    return ship === null || ship.destroyed();
})
    .forEach((record) => game.pendingEffects.unregister(record));
exports.forgetLostShips = forgetLostShips;
//# sourceMappingURL=ship.js.map