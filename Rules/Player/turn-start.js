"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const leader_1 = require("../../lib/leader");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const TurnStart_1 = require("@civ-clone/core-player/Rules/TurnStart");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
/**
 * As the barbarians' turn starts, before their client moves them, each leader that `leaderLeaves` says leaves is taken
 *  off the map, with no ransom. Civilization II decides it by the unit, the turn and how far the cities are, which
 *  base-barbarians' `LeavesMap` (a question about a square) can't say, so it's a rule of its own. The client still
 *  walks a leader to the unit he follows.
 */
const getRules = (game) => [
    new TurnStart_1.default(RuleIds_1.LEADER_LEAVES_RULE, new Criterion_1.default((player) => (0, isBarbarian_1.default)(player)), new Effect_1.default((player) => (0, leader_1.leadersOf)(game, player)
        .filter((leader) => (0, leader_1.leaderLeaves)(game, leader, game.turn.value()))
        .forEach((leader) => leader.destroy()))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=turn-start.js.map