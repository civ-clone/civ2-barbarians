"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bestHumanGovernment = exports.rankAsNumberGovernment = exports.playerNumbered = exports.bestHumanRank = exports.powerRanks = void 0;
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
const isHuman_1 = require("@civ-clone/civ2-difficulty/isHuman");
const rank_1 = require("@civ-clone/core-power/lib/rank");
/**
 * Each player's power rank, 7 for the strongest and down by one (`civ_update_power_ranks`), by the game's `Rank` rules.
 *  The barbarians have none.
 */
const powerRanks = (game) => new Map((0, rank_1.rankings)(game.players
    .entries()
    .filter((player) => !(0, isBarbarian_1.default)(player)), game.rules).map((player, index) => [
    player,
    7 - index,
]));
exports.powerRanks = powerRanks;
/** The power rank of the strongest player a person plays (`game.best_human_rank`), or `null` with none. */
const bestHumanRank = (game) => {
    const ranks = [...(0, exports.powerRanks)(game)]
        .filter(([player]) => (0, isHuman_1.isHuman)(player, game.clients))
        .map(([, rank]) => rank);
    return ranks.length === 0 ? null : Math.max(...ranks);
};
exports.bestHumanRank = bestHumanRank;
/** The player whose civilization number (civ2-civilization's `colourSet`, 1 to 7) is `number`, or `null`. */
const playerNumbered = (game, number) => {
    var _a;
    return (_a = game.players
        .entries()
        .find((player) => !(0, isBarbarian_1.default)(player) &&
        game.attributes
            .getByCivilization(player.civilization().constructor)
            .some((attribute) => attribute.name() === 'colourSet' && attribute.value() === number))) !== null && _a !== void 0 ? _a : null;
};
exports.playerNumbered = playerNumbered;
const governmentOf = (game, player) => {
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
/**
 * The government the original reads as the strongest human's, `civs[game.best_human_rank].government`: the rank is used
 *  as a civilization number, so it's the government of the player numbered with that rank, whoever plays it. `null`
 *  when no player has that number (an empty slot: the original reads Anarchy's 0 there).
 */
const rankAsNumberGovernment = (game) => {
    const rank = (0, exports.bestHumanRank)(game);
    return rank === null ? null : governmentOf(game, (0, exports.playerNumbered)(game, rank));
};
exports.rankAsNumberGovernment = rankAsNumberGovernment;
/** The government of the strongest player a person plays: what `rankAsNumberGovernment` was meant to read. */
const bestHumanGovernment = (game) => {
    const ranks = (0, exports.powerRanks)(game);
    const [best] = [...ranks]
        .filter(([player]) => (0, isHuman_1.isHuman)(player, game.clients))
        .sort(([, a], [, b]) => b - a);
    return best === undefined ? null : governmentOf(game, best[0]);
};
exports.bestHumanGovernment = bestHumanGovernment;
//# sourceMappingURL=ranks.js.map