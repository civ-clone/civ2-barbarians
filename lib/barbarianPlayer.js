"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.barbarianPlayer = void 0;
const barbarianPlayer_1 = require("@civ-clone/base-barbarians/lib/barbarianPlayer");
const Governments_1 = require("@civ-clone/civ2-government/Governments");
/**
 * The barbarian player (civilization 0 in the original), made by the first spawn with base-barbarians'
 *  `barbarianPlayer`: in Anarchy for good, with no advances. Civilization II gives a new player no advances when it
 *  joins (civ2-science's `Added` rule only sets up its research; the starting advances are civ2-player's start
 *  balancing, before the first turn), so no rule is held off.
 */
const barbarianPlayer = (game, world) => (0, barbarianPlayer_1.default)(game, world, { government: Governments_1.Anarchy });
exports.barbarianPlayer = barbarianPlayer;
exports.default = exports.barbarianPlayer;
//# sourceMappingURL=barbarianPlayer.js.map