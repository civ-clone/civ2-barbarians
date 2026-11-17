"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityLevel = exports.randomActivity = exports.ACTIVITY_STATE = exports.DEFAULT_ACTIVITY = void 0;
const Activity_1 = require("../Rules/Activity");
const PendingEffect_1 = require("@civ-clone/core-pending-effect/PendingEffect");
const pickResearch_1 = require("@civ-clone/civ2-science/lib/pickResearch");
const level_1 = require("@civ-clone/civ2-difficulty/level");
/** The level with no `Activity` rule registered, and the choice's default: the second level up. */
exports.DEFAULT_ACTIVITY = 2;
/**
 * The `PendingEffect` handler name a drawn level is kept under. Nothing discharges it: it's a record, kept in the
 *  game's pending effects because they are saved, so the level drawn stays the game's level after a load.
 */
exports.ACTIVITY_STATE = 'civ2-barbarians:activity';
/**
 * The level drawn for "random" (OpenCiv2 `game_setup.cpp` 1686-1700), from C's `rand()`: below Prince, the difficulty
 *  level or one more (Chieftain 0–1, Warlord 1–2); Prince to Emperor, 1 to 3; Deity, 2 or 3.
 */
const randomActivity = (level, rand) => {
    if (level < 2) {
        return (rand() % 2) + level;
    }
    if (level < 5) {
        return (rand() % 3) + 1;
    }
    return (rand() % 2) + 2;
};
exports.randomActivity = randomActivity;
const recordOf = (game) => { var _a; return (_a = game.pendingEffects.getByHandler(exports.ACTIVITY_STATE)[0]) !== null && _a !== void 0 ? _a : null; };
/**
 * How active the barbarians are in `game`, 0 to 3 (OpenCiv2 `game.barbarian_activity`): the level its `ACTIVITY`
 *  choice gives, or for "random" the level drawn the first time anyone asks, kept with the game. Nothing is drawn
 *  unless "random" is chosen. A game with no `Activity` rule plays at `DEFAULT_ACTIVITY`.
 */
const activityLevel = (game) => {
    const [choice] = game.rules
        .process(Activity_1.default)
        .filter((answer) => answer !== undefined);
    if (choice === undefined) {
        return exports.DEFAULT_ACTIVITY;
    }
    if (choice !== 'random') {
        return choice;
    }
    const record = recordOf(game), saved = record === null ? NaN : Number(record.data().level);
    if (Number.isInteger(saved) && saved >= 0 && saved <= 3) {
        return saved;
    }
    const level = (0, exports.randomActivity)((0, level_1.levelOf)(game.difficulty), () => (0, pickResearch_1.cRand)(game.rng));
    if (record !== null) {
        record.setData({ level: String(level) });
    }
    else {
        game.pendingEffects.register(new PendingEffect_1.default(exports.ACTIVITY_STATE, null, { level: String(level) }));
    }
    return level;
};
exports.activityLevel = activityLevel;
exports.default = exports.activityLevel;
//# sourceMappingURL=activity.js.map