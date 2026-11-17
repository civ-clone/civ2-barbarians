"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const activity_1 = require("../../lib/activity");
const RuleIds_1 = require("../../RuleIds");
const uprising_1 = require("../../lib/uprising");
const onset_1 = require("../../lib/onset");
const seaRaid_1 = require("../../lib/seaRaid");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Start_1 = require("@civ-clone/core-turn-based-game/Rules/Start");
const knows_1 = require("../../lib/knows");
const units_1 = require("../../lib/units");
const pickResearch_1 = require("@civ-clone/civ2-science/lib/pickResearch");
const level_1 = require("@civ-clone/civ2-difficulty/level");
const spawning_1 = require("@civ-clone/base-barbarians/lib/spawning");
const worldOf_1 = require("@civ-clone/base-barbarians/lib/worldOf");
/**
 * When barbarians appear (`game_spawn_barbarians`, `game.cpp` 1566-1606), as each turn starts, for the turn just played
 *  (`spawnTurn`), once every `Spawning` rule allows it:
 * - `SEA_RAID_RULE`: on a raid turn (`raidTurn`), until anyone knows Armor's advance, a raid from the sea
 *   (`lib/seaRaid`). A raid that finds no square skips the turn's uprising (`raidFailed`, `uprisingSkipped`).
 * - `LAND_UPRISING_RULE`: one city is drawn, and an uprising may break out near it if a person plays it
 *   (`lib/uprising`). `civ2-enhanced` can take its place with other `UprisingOptions`.
 *
 * The barbarian player is made by the first spawn.
 */
const getRules = (game) => [
    new Start_1.default(RuleIds_1.SEA_RAID_RULE, new Criterion_1.default((turn) => (0, spawning_1.default)(game.rules, turn)), new Criterion_1.default((turn) => (0, onset_1.raidTurn)((0, activity_1.activityLevel)(game), (0, onset_1.spawnTurn)(turn))), new Criterion_1.default(() => !(0, knows_1.anyoneKnows)(game, (0, units_1.armorAdvance)())), new Effect_1.default((turn) => {
        const world = (0, worldOf_1.default)(game);
        if (world === null) {
            return;
        }
        if (!(0, seaRaid_1.default)(game, world, (0, activity_1.activityLevel)(game), (0, onset_1.spawnTurn)(turn))) {
            (0, seaRaid_1.raidFailed)(game, turn.value());
        }
    })),
    new Start_1.default(RuleIds_1.LAND_UPRISING_RULE, new Criterion_1.default((turn) => (0, spawning_1.default)(game.rules, turn)), new Effect_1.default((turn) => {
        if ((0, seaRaid_1.uprisingSkipped)(game, turn.value())) {
            return;
        }
        const city = (0, uprising_1.uprisingCity)(game, () => (0, pickResearch_1.cRand)(game.rng));
        if (city === null) {
            return;
        }
        (0, uprising_1.default)(game, city, (0, activity_1.activityLevel)(game), (0, level_1.levelOf)(game.difficulty), (0, onset_1.spawnTurn)(turn), uprising_1.CLASSIC_UPRISING);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=start.js.map