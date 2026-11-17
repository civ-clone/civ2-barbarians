"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const activity_1 = require("../lib/activity");
const onset_1 = require("../lib/onset");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../RuleIds");
const Spawning_1 = require("@civ-clone/base-barbarians/Rules/Spawning");
const level_1 = require("@civ-clone/civ2-difficulty/level");
/**
 * Barbarians appear from the onset turn for the activity level and the difficulty level (`lib/onset`), and never at
 *  a = 0. Every sea raid and uprising is gated on it; a hut's barbarians aren't.
 */
const getRules = (game) => [
    new Spawning_1.default(RuleIds_1.SPAWNING_RULE, new Effect_1.default((turn) => (0, onset_1.spawns)((0, activity_1.activityLevel)(game), (0, level_1.levelOf)(game.difficulty), (0, onset_1.spawnTurn)(turn)))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=Spawning.js.map