"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strongestHumanGovernment = exports.strongestHuman = void 0;
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
const isHuman_1 = require("@civ-clone/civ2-difficulty/isHuman");
const rank_1 = require("@civ-clone/core-power/lib/rank");
/**
 * The strongest player a person plays, by the game's `Rank` rules (`game.best_human_rank`), or `null` with none. The
 *  barbarians aren't ranked.
 */
const strongestHuman = (game) => {
    var _a;
    return (_a = (0, rank_1.rankings)(game.players
        .entries()
        .filter((player) => !(0, isBarbarian_1.default)(player)), game.rules).find((player) => (0, isHuman_1.isHuman)(player, game.clients))) !== null && _a !== void 0 ? _a : null;
};
exports.strongestHuman = strongestHuman;
/**
 * The government of the strongest player a person plays, or `null`. The original reads `civs[game.best_human_rank]`,
 *  a power rank used as a civilization number; players here have no numbers, so this reads what was meant.
 */
const strongestHumanGovernment = (game) => {
    const player = (0, exports.strongestHuman)(game);
    if (player === null) {
        return null;
    }
    try {
        return game.playerGovernments.getByPlayer(player).current();
    }
    catch (e) {
        return null;
    }
};
exports.strongestHumanGovernment = strongestHumanGovernment;
//# sourceMappingURL=ranks.js.map