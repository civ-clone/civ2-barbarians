"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const activity_1 = require("../../lib/activity");
const hut_1 = require("../../lib/hut");
const Barbarians_1 = require("@civ-clone/base-goody-hut-barbarians/Rules/Barbarians");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
/**
 * The barbarians a goody hut releases (`hut_barbarians`, `lib/hut`), at any activity level, a = 0 included: the
 *  original doesn't ask. Registering it is what lets civ2-goody-hut's barbarians outcome happen.
 */
const getRules = (game) => [
    new Barbarians_1.default(RuleIds_1.HUT_HORDE_RULE, new Effect_1.default((goodyHut, unit) => {
        (0, hut_1.default)(game, goodyHut.tile(), unit, (0, activity_1.activityLevel)(game), game.turn.value());
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=barbarians.js.map