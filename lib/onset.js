"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.raidTurn = exports.raidMask = exports.spawns = exports.onsetTurn = exports.spawnTurn = void 0;
/**
 * The original's turn for a `Start` rule on `turn`: `game_spawn_barbarians` runs as the game moves from turn T to
 *  T + 1, before the count goes up (`game.cpp` `game_advance_turn` 1673-1676), and `turn.value()` is Civ2's
 *  `game.turn`, so the turn it tests is the one just played, T = `turn.value()` − 1. It never runs at T = 0.
 */
const spawnTurn = (turn) => turn.value() - 1;
exports.spawnTurn = spawnTurn;
/**
 * The first turn barbarians may appear (`game.cpp` `game_spawn_barbarians` 1566-1580): below Deity
 *  ((3 − a) × 3 + 30) × (5 − d), on Deity (3 − a) × 3 + 15. At a = 0 they never do: `Infinity`.
 */
const onsetTurn = (activity, level) => {
    if (activity === 0) {
        return Infinity;
    }
    if (level < 5) {
        return ((3 - activity) * 3 + 30) * (5 - level);
    }
    return (3 - activity) * 3 + 15;
};
exports.onsetTurn = onsetTurn;
/** Whether barbarians may appear as turn `turn` (the original's) ends. */
const spawns = (activity, level, turn) => turn !== 0 && turn >= (0, exports.onsetTurn)(activity, level);
exports.spawns = spawns;
/** The sea raids' mask (`freq_mask`): 15 at a = 1, 7 at 2 and 3. */
const raidMask = (activity) => (activity === 1 ? 15 : 7);
exports.raidMask = raidMask;
/** Whether a sea raid is tried as turn `turn` ends: `(turn + 1) & mask == 0`, every 16th or 8th turn. */
const raidTurn = (activity, turn) => ((turn + 1) & (0, exports.raidMask)(activity)) === 0;
exports.raidTurn = raidTurn;
exports.default = exports.onsetTurn;
//# sourceMappingURL=onset.js.map