"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.MOST_RAIDERS = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Low_1 = require("@civ-clone/core-rule/Priorities/Low");
const NavalTransport_1 = require("@civ-clone/base-unit-type-naval-transport/NavalTransport");
const RuleIds_1 = require("../../RuleIds");
const Yield_1 = require("@civ-clone/core-unit/Rules/Yield");
const Yields_1 = require("@civ-clone/core-unit-transport/Yields");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
/** The most barbarians a raid brings: 5 + 2 at a = 3. */
exports.MOST_RAIDERS = 7;
/**
 * A barbarian ship holds at least `MOST_RAIDERS`: the original makes the horde on the ship's square with no thought for
 *  its hold (a Trireme holds 2), and this keeps the whole horde aboard (`spawnUnits` would leave out those with no
 *  room). Low priority, after civ2-unit's hold.
 */
const getRules = () => [
    new Yield_1.Yield(RuleIds_1.RAIDERS_ABOARD_RULE, new Low_1.default(), new Criterion_1.default((unit, unitYield) => unitYield instanceof Yields_1.Capacity &&
        unit instanceof NavalTransport_1.default &&
        (0, isBarbarian_1.default)(unit.player())), new Effect_1.default((unit, unitYield) => {
        if (unitYield.value() < exports.MOST_RAIDERS) {
            unitYield.set(exports.MOST_RAIDERS);
        }
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=yield.js.map