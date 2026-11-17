"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Build_1 = require("@civ-clone/core-city-build/Rules/Build");
const cityBuild_1 = require("../../lib/cityBuild");
const RuleIds_1 = require("../../RuleIds");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
/**
 * What a barbarian city may build: `barbarianBuild`'s one unit, and nothing else (`city_choose_production_barbarian`).
 *  civ2-unit's rules leave barbarian cities to this one. `civ2-enhanced` can take its place.
 */
const getRules = (game) => [
    new Build_1.Build(RuleIds_1.CITY_BUILD_RULE, new Criterion_1.default((city) => (0, isBarbarian_1.default)(city.player())), new Effect_1.default((city, Item) => new Criterion_1.default(() => Item === (0, cityBuild_1.default)(game, city)))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=build.js.map