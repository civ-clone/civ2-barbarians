"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const RuleSets_1 = require("../RuleSets");
const Activity_1 = require("./Activity");
const Effect_1 = require("@civ-clone/core-rule/Effect");
/** One `Activity` rule for each choice of the `ACTIVITY` set: each level, and the level drawn by the difficulty level. */
const getRules = () => [
    ...RuleSets_1.ACTIVITY_LEVELS.map((id, level) => new Activity_1.default(id, new Effect_1.default(() => level))),
    new Activity_1.default(RuleSets_1.ACTIVITY_RANDOM, new Effect_1.default(() => 'random')),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=activityLevels.js.map