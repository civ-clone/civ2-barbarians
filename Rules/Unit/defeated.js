"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const activity_1 = require("../../lib/activity");
const ransom_1 = require("@civ-clone/base-barbarians/lib/ransom");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Defeated_1 = require("@civ-clone/core-unit/Rules/Defeated");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
const units_1 = require("../../lib/units");
const ransom_2 = require("../../lib/ransom");
/**
 * Ransom (`unit_combat.cpp` 1080-1081, `unit_resolve_attack_ransom`): an attacker that beats a barbarian leader (a unit
 *  of a role above 4, the Diplomat) defending his square is paid `ransom` (activity × 50), through base-barbarians'
 *  `payRansom` (`barbarians:ransom`). Only the defender counts, so a leader killed in a stack another unit defended
 *  pays nothing; nor does one who attacks and loses.
 */
const getRules = (game) => [
    new Defeated_1.default(RuleIds_1.RANSOM_RULE, 
    // `Attack` processes `Defeated` for a losing attacker too: the action's unit is the one that attacked.
    new Criterion_1.default((unit, by, action) => !action || action.unit() !== unit), new Criterion_1.default((unit) => (0, isBarbarian_1.default)(unit.player()) && (0, units_1.isLeader)(unit)), new Criterion_1.default((unit, by) => !(0, isBarbarian_1.default)(by.player())), new Effect_1.default((unit, by) => (0, ransom_1.default)(game, by.player(), unit, (0, ransom_2.default)((0, activity_1.activityLevel)(game))))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=defeated.js.map