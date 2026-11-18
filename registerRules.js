"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const RuleSets_1 = require("./RuleSets");
const core_game_1 = require("@civ-clone/core-game");
const RuleSet_1 = require("@civ-clone/core-rule/RuleSet");
const activityLevels_1 = require("./Rules/activityLevels");
const build_1 = require("./Rules/City/build");
const client_1 = require("./Rules/client");
const barbarians_1 = require("./Rules/GoodyHut/barbarians");
const turn_start_1 = require("./Rules/Player/turn-start");
const Spawning_1 = require("./Rules/Spawning");
const start_1 = require("./Rules/Turn/start");
const combat_1 = require("./Rules/Unit/combat");
const defeated_1 = require("./Rules/Unit/defeated");
const moved_1 = require("./Rules/Unit/moved");
const yield_1 = require("./Rules/Unit/yield");
const register = (game) => {
    game.rules.register(...(0, activityLevels_1.default)(), ...(0, Spawning_1.default)(game), ...(0, start_1.default)(game), ...(0, barbarians_1.default)(game), ...(0, defeated_1.default)(game), ...(0, moved_1.default)(game), ...(0, build_1.default)(game), ...(0, turn_start_1.default)(game), ...(0, client_1.default)(), ...(0, yield_1.default)(), ...(0, combat_1.default)(game));
    // How active the barbarians are: a choice saved with the game, the second level up to start with.
    game.ruleSets.register(new RuleSet_1.default(RuleSets_1.ACTIVITY, { exclusive: true, default: RuleSets_1.ACTIVITY_DEFAULT }, ...RuleSets_1.ACTIVITY_LEVELS, RuleSets_1.ACTIVITY_RANDOM));
};
exports.register = register;
// The plugin loader imports each package for this side effect.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerRules.js.map