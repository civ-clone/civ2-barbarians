"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const ship_1 = require("../../lib/ship");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const RuleIds_1 = require("../../RuleIds");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
/** Each step a barbarian ship takes is counted towards its giving up (`lib/ship`'s `countStep`). */
const getRules = (game) => [
    new Moved_1.default(RuleIds_1.SHIP_COUNTS_STEPS_RULE, new Criterion_1.default((unit) => (0, ship_1.isTransportShip)(unit) && (0, isBarbarian_1.default)(unit.player())), new Effect_1.default((unit) => (0, ship_1.countStep)(game, unit))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=moved.js.map