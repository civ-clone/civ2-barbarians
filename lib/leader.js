"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadersOf = exports.leaderLeaves = exports.leaderGivesUp = exports.LEADER_FOLLOWS = exports.LEADER_SEA_DISTANCE = exports.aboard = void 0;
const grid_1 = require("./grid");
const units_1 = require("./units");
const Stowed_1 = require("@civ-clone/base-unit-action-embark/Busy/Stowed");
/** Whether `unit` is aboard a ship: stowed, or carried by a transport. */
const aboard = (game, unit) => unit.busy() instanceof Stowed_1.default || game.transports.hasUnit(unit);
exports.aboard = aboard;
/** A leader at sea leaves less than this far from a city. */
exports.LEADER_SEA_DISTANCE = 3;
/** A leader on land follows a fighting unit (attack or defence role) less than this far away. */
exports.LEADER_FOLLOWS = 4;
/** Whether a leader with nobody to follow leaves on turn `turn`, `fromCity` from the nearest city: `(turn & 7) + 4` or more. */
const leaderGivesUp = (turn, fromCity) => (turn & 7) + 4 <= fromCity;
exports.leaderGivesUp = leaderGivesUp;
/**
 * Whether the barbarian leader `leader` leaves the map this turn (`ai_barb_leader`, `ai.cpp` 1885-1916):
 * - aboard a ship he stays: the original's raiders sleep at sea (`game.cpp` 1542), so `ai_barb_leader` never runs for
 *   them;
 * - on land with others on his square and fewer than 2 of his role among them, he stays with them;
 * - at sea, less than 3 from a city, he leaves;
 * - on land, with the nearest of his own units less than 4 away and of a fighting role, he follows it;
 * - otherwise on land, `leaderGivesUp` from the nearest city (always, with no city left), he leaves.
 */
const leaderLeaves = (game, leader, turn) => {
    const tile = leader.tile(), cities = game.cities
        .entries()
        .filter((city) => !city.destroyed()), nearest = (0, grid_1.nearestCity)(tile, cities), fromCity = nearest === null ? Infinity : nearest.distance, player = leader.player();
    if ((0, exports.aboard)(game, leader)) {
        return false;
    }
    if (tile.isWater()) {
        return fromCity < exports.LEADER_SEA_DISTANCE;
    }
    const stack = game.units
        .getByTile(tile)
        .filter((unit) => unit.player() === player);
    if (stack.length > 1 &&
        stack.filter((unit) => (0, units_1.roleOf)(unit.constructor) === (0, units_1.roleOf)(leader.constructor)).length < 2) {
        return false;
    }
    const [closest] = game.units
        .getByPlayer(player)
        .filter((unit) => unit !== leader && !unit.destroyed())
        .map((unit) => [unit, (0, grid_1.distance)(tile, unit.tile())])
        .sort(([, a], [, b]) => a - b);
    if (closest !== undefined &&
        closest[1] < exports.LEADER_FOLLOWS &&
        (0, units_1.roleOf)(closest[0].constructor) < 2) {
        return false;
    }
    return (0, exports.leaderGivesUp)(turn, fromCity);
};
exports.leaderLeaves = leaderLeaves;
/** The barbarian leaders of `player`'s units. */
const leadersOf = (game, player) => game.units
    .getByPlayer(player)
    .filter((unit) => !unit.destroyed() && (0, units_1.isLeader)(unit));
exports.leadersOf = leadersOf;
//# sourceMappingURL=leader.js.map