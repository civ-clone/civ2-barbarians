"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgetLostShips = exports.giveUp = exports.shipGivesUp = exports.countTurn = exports.countStep = exports.shipCount = exports.shipsOf = exports.isTransportShip = exports.SHIP_AT_SEA = exports.DIPLOMACY_ROLE = exports.SHIP_LEAST_STACK = exports.SHIP_STEPS = void 0;
const Naval_1 = require("@civ-clone/base-unit-type-naval/Naval");
const PendingEffect_1 = require("@civ-clone/core-pending-effect/PendingEffect");
const units_1 = require("./units");
/**
 * A barbarian ship gives up once its count passes this (`ai_barbarian_unit_move`: `30 < counter`). The original raises
 *  the count each time its AI moves the ship, so once for each step it takes (and once on a turn it takes none): about
 *  a third as many turns as steps for a ship of 3 moves.
 */
exports.SHIP_STEPS = 30;
/**
 * A barbarian ship gives up when fewer than this many units are on its square, itself included and the diplomacy role's
 *  (the leaders') left out (`unit_stack_sum(unit, 2) − unit_stack_count_role(unit, ROLE_DIPLOMACY) < 2`): once nothing
 *  but leaders is left aboard.
 */
exports.SHIP_LEAST_STACK = 2;
/** `@UNITS`' diplomacy role (the Diplomat, the barbarians' leader). */
exports.DIPLOMACY_ROLE = 6;
/**
 * The `PendingEffect` handler a barbarian ship's count is kept under (`count`, and whether it has acted this turn,
 *  `acted`), so a saved game counts on. Nothing discharges it: it's a record, removed with the ship.
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
const recordFor = (game, ship) => {
    const record = recordOf(game, ship);
    if (record !== null) {
        return record;
    }
    const created = new PendingEffect_1.default(exports.SHIP_AT_SEA, ship, {
        count: '0',
        acted: '0',
    });
    game.pendingEffects.register(created);
    return created;
};
/** `ship`'s count so far: 0 before it has been counted. */
const shipCount = (game, ship) => { var _a, _b; return Number((_b = (_a = recordOf(game, ship)) === null || _a === void 0 ? void 0 : _a.data().count) !== null && _b !== void 0 ? _b : 0); };
exports.shipCount = shipCount;
/** Counts a step `ship` took (any action of its own, as each is a call of the original's `ai_barbarian_unit_move`). */
const countStep = (game, ship) => {
    const record = recordFor(game, ship);
    record.setData({ count: String((0, exports.shipCount)(game, ship) + 1), acted: '1' });
};
exports.countStep = countStep;
/**
 * As the barbarians' turn starts: a ship that took no step last turn is counted once for it, as the original's AI is
 *  still called for it once; then a new turn's steps are awaited. A ship seen for the first time starts at 0.
 */
const countTurn = (game, ship) => {
    const existing = recordOf(game, ship);
    if (existing === null) {
        recordFor(game, ship);
        return 0;
    }
    const count = (0, exports.shipCount)(game, ship) + (existing.data().acted === '1' ? 0 : 1);
    existing.setData({ count: String(count), acted: '0' });
    return count;
};
exports.countTurn = countTurn;
/**
 * Whether a barbarian ship gives up as its turn starts (`ai_barbarian_unit_move`, `ai.cpp` 2192-2203): with nothing but
 *  leaders aboard (`SHIP_LEAST_STACK`), or once its count (`countTurn`) has reached `SHIP_STEPS`, as the original, which
 *  adds 1 and gives up past 30 on its next call, would on the first step of this turn. The original checks as each step
 *  is taken; here only as the turn starts, so a ship may finish the turn its count reaches 30 in. Counting changes the
 *  ship's record: ask once a turn.
 */
const shipGivesUp = (game, ship) => {
    const count = (0, exports.countTurn)(game, ship);
    return (game.units
        .getByTile(ship.tile())
        .filter((unit) => (0, units_1.roleOf)(unit.constructor) !== exports.DIPLOMACY_ROLE).length < exports.SHIP_LEAST_STACK || count >= exports.SHIP_STEPS);
};
exports.shipGivesUp = shipGivesUp;
/**
 * Takes `ship` off the map and forgets its record. What it carries goes as the rule set's rules for a destroyed ship say
 *  (lost at sea), as the original's `unit_destroy_redraw` leaves it to the unit's deletion.
 */
const giveUp = (game, ship) => {
    const record = recordOf(game, ship);
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